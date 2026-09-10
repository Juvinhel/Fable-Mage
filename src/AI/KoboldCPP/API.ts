namespace AI.KoboldCPP
{
    export class API implements AI.TextAPI, AI.ImageAPI
    {
        constructor (config: Data.KoboldCPPEndpoint)
        {
            this.config = config;
        }

        private config: Data.KoboldCPPEndpoint;

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

            const output: { result: string, success: boolean; } = await response.json();
            if (!output.success) throw new Error("Could not convert JSON Schema to BNF Grammar!");

            return output.result;
        }

        public async generateText(prompt: string, schema?: any): Promise<string>
        {
            const url = this.config.url + "/api/v1/generate";
            const grammar = schema ? await this.generateGrammar(schema) : null;
            const p = prompt.trim();

            console.log("generateText (prompt)", prompt);
            const authorization = this.config.username && this.config.password ? btoa(this.config.username + ":" + this.config.password) : null;
            const body: AI.KoboldCPP.GenerationInput = {
                prompt: p,
                max_length: this.config.textGenerationMaxLength,
            };
            if (grammar) body.grammar = grammar;
            const headers: HeadersInit = {};
            if (authorization) headers.authorization = "Basic " + authorization;

            const response = await fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers
                });

            const output: AI.KoboldCPP.GenerationOutput = await response.json();
            let result = output.results[0];
            if (result.finish_reason == "length") throw new Error("The max_length of request was to low!");
            console.log("generateText (result)", result.text);

            return result.text;
        }

        public async generateInteractions(messages: Message[], schema?): Promise<string>
        {
            const url = this.config.url + "/v1/chat/completions";
            const grammar = schema ? await this.generateGrammar(schema) : null;
            const m = messages.map(x => ({ role: x.role == "system" ? "developer" : x.role, content: x.content.trim() }));

            console.log("generateInteractions (messages)", m);
            const authorization = this.config.username && this.config.password ? btoa(this.config.username + ":" + this.config.password) : null;
            const body: any = {
                messages: m,
                max_length: this.config.textGenerationMaxLength,
            };
            if (grammar) body.grammar = grammar;
            const headers: HeadersInit = {};
            if (authorization) headers.authorization = "Basic " + authorization;

            const response = await fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers
                });

            const output: any = await response.json();
            let result = output.choices[0];
            if (result.finish_reason == "length") throw new Error("The max_length of request was to low!");
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

            const output: AI.KoboldCPP.TXT2ImgOutput = await response.json();
            console.log("generateImage (output)", output);

            const base64 = output.images[0];
            return base64;
        }

        public async check(): Promise<void>
        {
            const url = this.config.url + "/api/v1/info/version";

            const authorization = this.config.username && this.config.password ? btoa(this.config.username + ":" + this.config.password) : null;
            const headers: HeadersInit = {};
            if (authorization) headers.authorization = "Basic " + authorization;

            const response = await fetch(url, { method: "GET", headers });
            if (!response.ok) throw new Error("Check failed!");
            const output = await response.json();
            const version = output.result;
            if (typeof version != "string") throw new Error("Unexpected output!");
        }
    };
}