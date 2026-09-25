namespace AI.KoboldCPP
{
    export class API implements AI.TextAPI, AI.ImageAPI
    {
        constructor (config: Data.KoboldCPPEndpoint)
        {
            this.config = config;
        }

        private config: Data.KoboldCPPEndpoint;

        public true_max_context_length: number;

        public async generateGrammar(schema: any): Promise<string>
        {
            const response = await this.fetch("/api/extra/json_to_grammar", schema);

            const output: { result?: string, success?: boolean, error?: string; } = await this.parseOutput(response);
            if (output.success !== true || typeof output.result != "string")
                throw new Error(output.error ?? "Could not convert JSON Schema to BNF Grammar!");

            return output.result;
        }

        public async generateText(prompt: string, temperature: number, schema?: Schema): Promise<string>
        {
            const grammar = schema ? await this.generateGrammar(schema) : null;
            const safeMaxLength = await this.calculateSafeMaxLength(prompt);
            const body: AI.KoboldCPP.GenerationInput = { prompt: prompt, temperature, max_length: safeMaxLength };
            if (grammar) body.grammar = grammar;

            const response = await this.fetch("/api/v1/generate", body);

            const output: AI.KoboldCPP.GenerationOutput = await this.parseOutput(response);
            if (!output.results?.length || typeof output.results[0].text != "string")
                throw new Error("KoboldCPP returned an invalid generation response.");

            let result = output.results[0];
            if (result.finish_reason == "length") throw new Error("The max_length of request was to low!");
            if (result.finish_reason != "stop") console.log("AI stopped early", result);

            return result.text;
        }

        public async generateInteractions(messages: Message[], temperature: number, schema?: Schema): Promise<string>
        {
            const grammar = schema ? await this.generateGrammar(schema) : null;
            const safeMaxLength = await this.calculateSafeMaxLength(messages);
            const m = messages.map(x => ({ role: x.role == "system" ? "developer" : x.role, content: x.content.trim() }));
            const body: any = { messages: m, temperature, max_length: safeMaxLength };
            if (grammar) body.grammar = grammar;

            const response = await this.fetch("/v1/chat/completions", body);

            const output: AI.KoboldCPP.ChatCompletionOutput = await this.parseOutput(response);
            if (!output.choices?.length || typeof output.choices[0].message?.content != "string")
                throw new Error("KoboldCPP returned an invalid chat response.");

            let result = output.choices[0];
            if (result.finish_reason == "length") throw new Error("The max_length of request was to low!");
            if (result.finish_reason != "stop") console.log("AI stopped early", result);

            return result.message.content;
        }

        public async generateImage(prompt: string): Promise<string>
        {
            const body: AI.KoboldCPP.TXT2ImgInput = {
                prompt: prompt.trim(),
                negative_prompt: "",
                steps: 20,
                cfg_scale: 7.5,
                width: 1024,
                height: 1024,
                sd_model_checkpoint: "",
                sampler_name: "default",
            };

            const response = await this.fetch("/sdapi/v1/txt2img", body);

            const output: AI.KoboldCPP.TXT2ImgOutput = await this.parseOutput(response);
            if (!output.images?.length || typeof output.images[0] != "string")
                throw new Error("KoboldCPP returned an invalid image response.");

            return "data:image/png;base64," + output.images[0];
        }

        private async parseOutput<T extends AI.KoboldCPP.APIErrorResponse>(response: Response): Promise<T>
        {
            let output: T;
            try
            {
                output = await response.json();
            }
            catch
            {
                throw new Error("KoboldCPP returned invalid JSON.");
            }

            if (!response.ok || output.error !== undefined || output.detail !== undefined)
            {
                const error = output.error;
                const message = typeof error == "string"
                    ? error
                    : error?.message ?? error?.msg ?? output.detail ?? output.message ?? output.msg;
                throw new Error(message ?? "KoboldCPP request failed.");
            }

            return output;
        }

        private async fetch(path: string, body?: any): Promise<Response>
        {
            const url = this.config.url + "/" + path.trimStart("/");
            const authorization = this.config.username && this.config.password ? btoa(this.config.username + ":" + this.config.password) : null;
            const headers: HeadersInit = {};
            if (authorization) headers.authorization = "Basic " + authorization;

            const request: RequestInit = { method: body ? "POST" : "GET", headers: headers };
            if (body) request.body = typeof body === "string" ? body : JSON.stringify(body);
            const response = await fetch(url, request);
            return response;
        }

        public async check(): Promise<void>
        {
            {
                const response = await this.fetch("/api/extra/true_max_context_length");
                if (!response.ok) throw new Error("Check failed!");
                const data = await response.json();
                // KoboldCPP typically returns an object like { value: 24576 } or a direct number depending on version
                this.true_max_context_length = data.value || data.max_context || 24576;
            }
        }

        private async calculateSafeMaxLength(prompt: string | Message[], desiredMaxLength = 1024, safetyBuffer = 64)
        {
            const promptTokenCount = await this.fetchTokenCount(prompt);
            // 1. Calculate the absolute remaining space in the context window
            const availableSpace = this.true_max_context_length - promptTokenCount - safetyBuffer;

            // 2. If the prompt is too large and leaves no room, fallback to a minimum safe token count (e.g., 64)
            if (availableSpace <= 0)
                throw new Error("Warning: Prompt is nearing or exceeding the context limit!");

            // 3. Return the smaller of your desired length vs the actual available space
            return Math.min(desiredMaxLength, availableSpace);
        }

        private async fetchTokenCount(prompt: string | Message[])
        {
            try
            {
                if (typeof prompt !== "string")
                {
                    prompt = prompt.map(msg =>
                    {
                        return `<|im_start|>${ msg.role }\n${ msg.content }<|im_end|>\n`;
                    }).join("");
                    prompt += "<|im_start|>assistant\n";
                }

                const response = await this.fetch("/api/extra/tokencount", { prompt });
                if (!response.ok) throw new Error(`HTTP error! status: ${ response.status }`);
                const data = await response.json();
                return data.value || data.token_count || 0;
            }
            catch (error)
            {
                console.error("Failed to count tokens via API:", error);
                throw error;
            }
        }
    };
}