namespace AI.Gemini
{
    export class API implements AI.TextAPI, AI.ImageAPI
    {
        constructor (config: Data.GeminiEndpoint)
        {
            this.config = config;
        }

        private config: Data.GeminiEndpoint;

        public async generateText(prompt: string, temperature: number, schema?: Schema): Promise<string>
        {
            const url = "https://generativelanguage.googleapis.com/v1beta/interactions";
            const p = prompt.trim();
            const model = this.config.model ?? "gemini-3.8-flash";

            const body: any = {
                input: p,
                model,
                store: false,
                generation_config: { temperature: temperature }
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
            if (!response.ok || output.error) throw new Error(output.error?.message ?? "Gemini request failed.");

            return this.extractText(output);
        }

        public async generateInteractions(messages: Message[], temperature: number, schema?: Schema): Promise<string>
        {
            const url = "https://generativelanguage.googleapis.com/v1beta/interactions";
            const systemInstruction = messages
                .filter(x => x.role == "system")
                .map(x => x.content.trim())
                .join("\n\n");
            const model = this.config.model ?? "gemini-3.8-flash";
            const m = messages.filter(x => x.role != "system").map(x =>
            {
                let type: string = x.role;
                if (type == "user") type = "user_input";
                if (type == "assistant") type = "model_output";
                return { type, content: x.content };
            });

            const body: any = {
                input: m,
                model,
                store: false,
                generation_config: { temperature: temperature }
            };
            if (systemInstruction)
                body.system_instruction = systemInstruction;
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
            if (!response.ok || output.error) throw new Error(output.error?.message ?? "Gemini request failed.");
            
            return this.extractText(output);
        }

        private extractText(output: any): string
        {
            const steps = output.steps ?? [];
            for (let stepIndex = steps.length - 1; stepIndex >= 0; stepIndex--)
            {
                const step = steps[stepIndex];
                if (step.type != "model_output") continue;

                const content = step.content ?? [];
                for (let contentIndex = content.length - 1; contentIndex >= 0; contentIndex--)
                {
                    const block = content[contentIndex];
                    if (block.type == "text" && typeof block.text == "string")
                        return block.text;
                }
            }

            throw new Error("Gemini did not return text output.");
        }

        public async generateImage(prompt: string): Promise<string>
        {
            const model = this.config.model ?? "gemini-3.1-flash-image";
            const url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent";
            const headers: HeadersInit = {
                "Content-Type": "application/json",
                "x-goog-api-key": this.config.api_key
            };
            const body = {
                contents: [{ parts: [{ text: prompt.trim() }] }],
                generationConfig: { responseModalities: ["IMAGE"] }
            };

            const response = await fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers
                });

            const output: any = await response.json();
            if (output.error) throw new Error(output.error.message);

            const parts = output.candidates?.[0]?.content?.parts ?? [];
            const image = parts.find((part: any) => part.inlineData);
            if (!image) throw new Error("Gemini did not return an image.");

            return "data:" + image.inlineData.mimeType + ";base64," + image.inlineData.data;
        }

        public async check(): Promise<void>
        {
            const model = this.config.model ?? "gemini-3.8-flash";
            const url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model);
            const response = await fetch(url,
                {
                    method: "GET",
                    headers: { "x-goog-api-key": this.config.api_key }
                });
            if (!response.ok) throw new Error("Check failed!");
        }
    };
}