namespace AI.LMStudio
{
    export class API implements AI.TextAPI
    {
        constructor (config: Data.LMStudioEndpoint)
        {
            this.config = config;
        }

        private config: Data.LMStudioEndpoint;

        public async generateText(prompt: string, temperature: number, schema?: Schema): Promise<string>
        {
            return this.generateInteractions([{ role: "user", content: prompt }], temperature, schema);
        }

        public async generateInteractions(messages: Message[], temperature: number, schema?: Schema): Promise<string>
        {
            const response = await this.request(messages, temperature, false, schema);
            const output = await this.parseOutput(response);
            const content = output.choices?.[0]?.message?.content;
            if (typeof content != "string")
                throw new Error("LM Studio returned an invalid chat response.");
            return content;
        }

        public async generateInteractionsStream(messages: Message[], temperature: number, onChunk: (chunk: string) => void, schema?: Schema): Promise<string>
        {
            const response = await this.request(messages, temperature, true, schema);
            if (!response.ok)
                await this.parseOutput(response);

            let result = "";
            await AI.readServerSentEvents(response, data =>
            {
                if (data == "[DONE]") return;

                let event: any;
                try
                {
                    event = JSON.parse(data);
                }
                catch
                {
                    throw new Error("LM Studio returned an invalid streaming response.");
                }

                if (event.error)
                    throw new Error(typeof event.error == "string" ? event.error : event.error.message ?? "LM Studio request failed.");

                const chunk = event.choices?.[0]?.delta?.content;
                if (typeof chunk != "string") return;
                result += chunk;
                onChunk(chunk);
            });

            if (!result)
                throw new Error("LM Studio returned an invalid streaming response.");
            return result;
        }

        private async request(messages: Message[], temperature: number, stream = false, schema?: Schema): Promise<Response>
        {
            const url = this.config.url.replace(/\/+$/, "") + "/chat/completions";
            const body: any = { model: this.config.model, messages, temperature, stream };
            if (schema)
            {
                body.response_format = {
                    type: "json_schema",
                    json_schema: {
                        name: "response",
                        strict: true,
                        schema
                    }
                };
            }

            return fetch(url,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });
        }

        private async parseOutput(response: Response): Promise<any>
        {
            let output: any;
            try
            {
                output = await response.json();
            }
            catch
            {
                throw new Error("LM Studio returned invalid JSON.");
            }

            if (!response.ok || output.error)
                throw new Error(typeof output.error == "string" ? output.error : output.error?.message ?? output.message ?? "LM Studio request failed.");
            return output;
        }

        public async check(): Promise<void>
        {
            const models = await this.getModels();
            if (!models.includes(this.config.model))
                throw new Error("LM Studio model not found. Make sure a model is loaded and selected.");
        }

        public async getModels(): Promise<string[]>
        {
            const url = this.config.url.replace(/\/+$/, "") + "/models";
            const response = await fetch(url);
            const output = await this.parseOutput(response);
            if (!Array.isArray(output.data))
                return [];
            return output.data
                .map((model: any) => model.id)
                .filter((id: any): id is string => typeof id == "string");
        }
    }
}
