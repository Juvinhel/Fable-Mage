namespace AI.Gemini
{
    export class API implements AI.TextAPI
    {
        constructor (config: Data.GeminiEndpoint)
        {
            this.config = config;
        }

        private config: Data.GeminiEndpoint;

        public async generateText(prompt: string, schema?: any): Promise<string>
        {
            const url = "https://generativelanguage.googleapis.com/v1beta/interactions";
            const p = prompt.trim();

            console.log("generateText (prompt)", prompt);
            const body: any = {
                input: p,
                model: "gemini-3.8-flash",
                store: false,
            };
            if (schema)
            {
                body.response_format = {
                    type: "text",
                    mime_type: "application/json",
                    schema
                };
            }

            const headers: HeadersInit = {};
            headers["x-goog-api-key"] = this.config.api_key;

            const response = await fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers
                });

            const output = await response.json();
            if (output.error) throw new Error(output.error.message);
            console.log("generateText (output)", output);

            let result: { type: string, content?: { type: "text", text: string; }[]; }[] = output.steps;

            const text = result.last().content.last().text;
            console.log("generateText (result)", text);

            return text;
        }

        public async generateInteractions(messages: Message[], schema?): Promise<string>
        {
            const url = "https://generativelanguage.googleapis.com/v1beta/interactions";
            const m = messages.map(x =>
            {
                let type: string = x.role;
                if (type == "user") type = "user_input";
                if (type == "developer") type = "user_input";
                if (type == "assistant") type = "model_output";
                return { type, content: x.content };
            });

            console.log("generateInteractions (messages)", m);
            const body: any = {
                input: m,
                model: "gemini-3.8-flash",
                store: false,
            };
            if (schema)
            {
                body.response_format = {
                    "type": "text",
                    "mime_type": "application/json",
                    schema
                };
            }

            const headers: HeadersInit = {};
            headers["x-goog-api-key"] = this.config.api_key;

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

        public async check(): Promise<void>
        {
        }
    };
}