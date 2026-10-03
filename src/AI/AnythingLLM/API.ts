namespace AI.AnythingLLM
{
    export class API implements AI.TextAPI, AI.ImageAPI
    {
        constructor (config: Data.AnythingLLMEndpoint)
        {
            this.config = config;
        }

        private config: Data.AnythingLLMEndpoint;

        public async generateText(prompt: string, temperature: number, schema?: Schema): Promise<string>
        {
            return this.generateInteractions([{ role: "user", content: prompt }], temperature, schema);
        }

        public async generateInteractions(messages: Message[], temperature: number, schema?: Schema): Promise<string>
        {
            const response = await this.request(this.buildMessages(messages, schema), temperature);
            const output: any = await this.parseOutput(response);
            const result = output.choices?.[0]?.message?.content;
            if (typeof result != "string")
                throw new Error("AnythingLLM returned an invalid chat response.");
            return result;
        }

        public async generateImage(prompt: string): Promise<string>
        {
            const url = this.config.url.replace(/\/+$/, "") + "/api/v1/openai/images/generations";
            const response = await fetch(url,
                {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + this.config.api_key,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: this.config.workspace,
                        prompt: prompt.trim(),
                        response_format: "b64_json"
                    })
                });
            const output: any = await this.parseOutput(response);
            const image = output.data?.[0];
            if (typeof image?.b64_json == "string")
                return "data:image/png;base64," + image.b64_json;
            if (typeof image?.url == "string")
                return image.url;
            throw new Error("AnythingLLM did not return an image.");
        }

        public async generateInteractionsStream(messages: Message[], temperature: number, onChunk: (chunk: string) => void, schema?: Schema): Promise<string>
        {
            const response = await this.request(this.buildMessages(messages, schema), temperature, true);
            if (!response.ok) await this.parseOutput(response);

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
                    throw new Error("AnythingLLM returned an invalid streaming response.");
                }

                if (event.error)
                    throw new Error(event.error ?? event.message ?? "AnythingLLM request failed.");
                const chunk = event.choices?.[0]?.delta?.content;
                if (typeof chunk != "string") return;

                result += chunk;
                onChunk(chunk);
            });

            if (!result) throw new Error("AnythingLLM returned an invalid streaming response.");
            return result;
        }

        private buildMessages(messages: Message[], schema?: Schema): Message[]
        {
            const result = messages.map(message => ({ ...message }));
            if (schema)
            {
                const instruction = "### JSON Schema Template\n```json\n" + JSON.stringify(schema, null, 4) + "\n```";
                const systemMessage = result.find(message => message.role == "system");
                if (systemMessage)
                    systemMessage.content += "\n\n" + instruction;
                else
                    result.unshift({ role: "system", content: instruction });
            }

            if (result[result.length - 1]?.role != "user")
                result.push({ role: "user", content: "Please follow the instructions above." });
            return result;
        }

        private async request(messages: Message[], temperature: number, stream = false): Promise<Response>
        {
            const url = this.config.url.replace(/\/+$/, "") + "/api/v1/openai/chat/completions";
            return fetch(url,
                {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + this.config.api_key,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ model: this.config.workspace, messages, temperature, stream })
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
                throw new Error("AnythingLLM returned invalid JSON.");
            }

            if (!response.ok || output.error)
                throw new Error(output.error ?? output.message ?? "AnythingLLM request failed.");
            return output;
        }

        public async check(): Promise<void>
        {
            const models = await this.getModels();
            if (!models.includes(this.config.workspace))
                throw new Error("AnythingLLM workspace not found.");
        }

        public async getModels(): Promise<string[]>
        {
            const url = this.config.url.replace(/\/+$/, "") + "/api/v1/openai/models";
            const response = await fetch(url,
                {
                    method: "GET",
                    headers: { "Authorization": "Bearer " + this.config.api_key }
                });
            const output = await this.parseOutput(response);
            if (!Array.isArray(output.data)) return [];
            return output.data
                .map((model: any) => model.id)
                .filter((id: any): id is string => typeof id == "string");
        }
    }
}
