namespace AI.KoboldCPP
{
    export class API implements AI.TextAPI, AI.ImageAPI
    {
        constructor (config: Data.KoboldCPPEndpoint)
        {
            this.config = config;
        }

        private config: Data.KoboldCPPEndpoint;

        public max_length: number;
        public max_context_length: number;

        public async generateGrammar(schema: any): Promise<string>
        {
            const url = this.config.url + "/api/extra/json_to_grammar";

            const authorization = this.config.username && this.config.password ? btoa(this.config.username + ":" + this.config.password) : null;
            const body = schema;
            const headers: HeadersInit = {};
            if (authorization) headers.authorization = "Basic " + authorization;

            const response = await fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers
                });

            const output: { result?: string, success?: boolean, error?: string; } = await this.parseOutput(response);
            if (output.success !== true || typeof output.result != "string")
                throw new Error(output.error ?? "Could not convert JSON Schema to BNF Grammar!");

            return output.result;
        }

        public async generateText(prompt: string, temperature: number, schema?: Schema): Promise<string>
        {
            const url = this.config.url + "/api/v1/generate";
            const grammar = schema ? await this.generateGrammar(schema) : null;
            const p = prompt.trim();

            console.log("generateText (prompt)", prompt);
            const authorization = this.config.username && this.config.password ? btoa(this.config.username + ":" + this.config.password) : null;
            const body: AI.KoboldCPP.GenerationInput = { prompt: p, temperature, max_length: this.max_length, max_context_length: this.max_context_length };
            if (grammar) body.grammar = grammar;

            const headers: HeadersInit = {};
            if (authorization) headers.authorization = "Basic " + authorization;

            const response = await fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers
                });

            const output: AI.KoboldCPP.GenerationOutput = await this.parseOutput(response);
            if (!output.results?.length || typeof output.results[0].text != "string")
                throw new Error("KoboldCPP returned an invalid generation response.");

            let result = output.results[0];
            if (result.finish_reason == "length") throw new Error("The max_length of request was to low!");
            if (result.finish_reason != "stop") console.log("AI stopped early", result);
            console.log("generateText (result)", result.text);

            return result.text;
        }

        public async generateInteractions(messages: Message[], temperature: number, schema?: Schema): Promise<string>
        {
            const url = this.config.url + "/v1/chat/completions";
            const grammar = schema ? await this.generateGrammar(schema) : null;
            const m = messages.map(x => ({ role: x.role == "system" ? "developer" : x.role, content: x.content.trim() }));

            console.log("generateInteractions (messages)", m);
            const authorization = this.config.username && this.config.password ? btoa(this.config.username + ":" + this.config.password) : null;
            const body: any = { messages: m, temperature, max_length: this.max_length, max_context_length: this.max_context_length };
            if (grammar) body.grammar = grammar;

            const headers: HeadersInit = {};
            if (authorization) headers.authorization = "Basic " + authorization;

            const response = await fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers
                });

            const output: AI.KoboldCPP.ChatCompletionOutput = await this.parseOutput(response);
            if (!output.choices?.length || typeof output.choices[0].message?.content != "string")
                throw new Error("KoboldCPP returned an invalid chat response.");

            let result = output.choices[0];
            if (result.finish_reason == "length") throw new Error("The max_length of request was to low!");
            if (result.finish_reason != "stop") console.log("AI stopped early", result);
            console.log("generateInteractions (result)", result.message.content);

            const text: string = result.message.content;
            return text;
        }

        public async generateImage(prompt: string): Promise<string>
        {
            const url = this.config.url + "/sdapi/v1/txt2img";
            const p = prompt.trim();

            console.log("generateImage (prompt)", prompt);
            const authorization = this.config.username && this.config.password ? btoa(this.config.username + ":" + this.config.password) : null;
            const body: AI.KoboldCPP.TXT2ImgInput = {
                prompt: p,
                negative_prompt: "",
                steps: 20,
                cfg_scale: 7.5,
                width: 1024,
                height: 1024,
                sd_model_checkpoint: "",
                sampler_name: "default",
            };
            const headers: HeadersInit = {};
            if (authorization) headers.authorization = "Basic " + authorization;

            const response = await fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers
                });

            const output: AI.KoboldCPP.TXT2ImgOutput = await this.parseOutput(response);
            if (!output.images?.length || typeof output.images[0] != "string")
                throw new Error("KoboldCPP returned an invalid image response.");
            console.log("generateImage (output)", output);

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

        public async check(): Promise<void>
        {
            {
                const url = this.config.url + "/api/v1/config/max_context_length";
                const authorization = this.config.username && this.config.password ? btoa(this.config.username + ":" + this.config.password) : null;
                const headers: HeadersInit = {};
                if (authorization) headers.authorization = "Basic " + authorization;

                const response = await fetch(url, { method: "GET", headers });
                if (!response.ok) throw new Error("Check failed!");
                const output = await response.json();
                this.max_context_length = output.value;
            }

            {
                const url = this.config.url + "/api/v1/config/max_length";
                const authorization = this.config.username && this.config.password ? btoa(this.config.username + ":" + this.config.password) : null;
                const headers: HeadersInit = {};
                if (authorization) headers.authorization = "Basic " + authorization;

                const response = await fetch(url, { method: "GET", headers });
                if (!response.ok) throw new Error("Check failed!");
                const output = await response.json();
                this.max_length = output.value;
            }

            //TODO: remove
            this.max_length = 4096;
        }
    };
}