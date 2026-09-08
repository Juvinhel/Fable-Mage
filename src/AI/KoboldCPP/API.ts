namespace AI.KoboldCPP
{
    export class API implements AI.API
    {
        public async generateGrammar(schema: any): Promise<string>
        {
            const url = App.config.endpoint + "/api/extra/json_to_grammar";

            const authorization = App.config.username && App.config.password ? btoa(App.config.username + ":" + App.config.password) : null;
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
            const url = App.config.endpoint + "/api/v1/generate";
            const grammar = schema ? await this.generateGrammar(schema) : null;
            const p = prompt.trim();

            console.log("generateText (prompt)", prompt);
            const authorization = App.config.username && App.config.password ? btoa(App.config.username + ":" + App.config.password) : null;
            const body: AI.KoboldCPP.GenerationInput = {
                prompt: p,
                max_length: App.config.textGenerationMaxLength,
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
            const url = App.config.endpoint + "/v1/chat/completions";
            const grammar = schema ? await this.generateGrammar(schema) : null;
            const m = messages.map(x => ({ role: x.role == "system" ? "developer" : x.role, content: x.content.trim() }));

            console.log("generateInteractions (messages)", m);
            const authorization = App.config.username && App.config.password ? btoa(App.config.username + ":" + App.config.password) : null;
            const body: any = {
                messages: m,
                max_length: App.config.textGenerationMaxLength,
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
            const url = App.config.endpoint + "/sdapi/v1/txt2img";
            const p = prompt.trim();

            console.log("generateImage (prompt)", prompt);
            const authorization = App.config.username && App.config.password ? btoa(App.config.username + ":" + App.config.password) : null;
            const body: AI.KoboldCPP.TXT2ImgInput = {
                prompt: p,
                negative_prompt: "",
                steps: 20,
                cfg_scale: 7.5,
                width: 512,
                height: 512,
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
    };
}