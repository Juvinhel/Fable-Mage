namespace AI.ComfyUI
{
    export class API implements AI.ImageAPI
    {
        constructor (config: Data.ComfyUIEndpoint)
        {
            this.config = config;
        }

        private config: Data.ComfyUIEndpoint;

        public async generateImage(prompt: string): Promise<string>
        {
            const workflow = this.getWorkflow(prompt);
            const response = await fetch(this.url("/prompt"), {
                method: "POST",
                headers: this.headers("application/json"),
                body: JSON.stringify({ prompt: workflow })
            });
            if (!response.ok)
                throw new Error("ComfyUI could not queue the workflow: " + await response.text());

            const result = await response.json();
            if (!result.prompt_id)
                throw new Error("ComfyUI did not return a prompt ID.");

            const deadline = Date.now() + 5 * 60 * 1000;
            while (Date.now() < deadline)
            {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const historyResponse = await fetch(this.url("/history/" + encodeURIComponent(result.prompt_id)), { headers: this.headers() });
                if (!historyResponse.ok) continue;

                const history = await historyResponse.json();
                const outputs = history[result.prompt_id]?.outputs;
                if (!outputs) continue;

                for (const output of Object.values(outputs) as any[])
                {
                    const image = output.images?.[0];
                    if (image)
                        return this.fetchImage(image);
                }
                throw new Error("The ComfyUI workflow completed without producing an image.");
            }

            throw new Error("Timed out waiting for ComfyUI to generate an image.");
        }

        private getWorkflow(prompt: string): any
        {
            if (!this.config.workflow)
                throw new Error("Upload a ComfyUI API workflow JSON in ImageAPI settings.");

            let workflow: any;
            try
            {
                workflow = JSON.parse(this.config.workflow);
            }
            catch
            {
                throw new Error("The saved ComfyUI workflow is not valid JSON.");
            }

            const serialized = JSON.stringify(workflow);
            if (!serialized.includes("{{prompt}}"))
                throw new Error('The ComfyUI workflow must contain "{{prompt}}" in its text input.');

            const replacePrompt = (value: any): any =>
            {
                if (typeof value == "string") return value.replaceAll("{{prompt}}", prompt.trim());
                if (Array.isArray(value)) return value.map(replacePrompt);
                if (value && typeof value == "object")
                {
                    for (const key of Object.keys(value))
                        value[key] = replacePrompt(value[key]);
                }
                return value;
            };
            return replacePrompt(workflow);
        }

        private async fetchImage(image: { filename: string; subfolder?: string; type?: string; }): Promise<string>
        {
            const params = new URLSearchParams({ filename: image.filename, subfolder: image.subfolder ?? "", type: image.type ?? "output" });
            const response = await fetch(this.url("/view?" + params.toString()), { headers: this.headers() });
            if (!response.ok)
                throw new Error("ComfyUI could not return the generated image.");

            const blob = await response.blob();
            return new Promise<string>((resolve, reject) =>
            {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        private url(path: string): string
        {
            return this.config.url.replace(/\/+$/, "") + path;
        }

        private headers(contentType?: string): HeadersInit
        {
            const headers: HeadersInit = {};
            if (contentType) headers["Content-Type"] = contentType;
            if (this.config.username && this.config.password)
                headers.authorization = "Basic " + btoa(this.config.username + ":" + this.config.password);
            return headers;
        }

        public async check(): Promise<void>
        {
            if (!this.config.url?.trim())
                throw new Error("Enter the ComfyUI server URL.");
            this.getWorkflow("");

            const response = await fetch(this.url("/system_stats"), { headers: this.headers() });
            if (!response.ok)
                throw new Error("Could not connect to ComfyUI.");
        }
    }
}