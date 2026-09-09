namespace AI.Diffusion
{
    export class API implements AI.ImageAPI
    {
        constructor (config: Data.DiffusionEndpoint)
        {
            this.config = config;
        }

        private config: Data.DiffusionEndpoint;

        public async generateImage(prompt: string): Promise<string>
        {
            const url = this.config.url + "/txt2img/generate";
            const p = prompt.trim();

            console.log("generateImage (prompt)", prompt);
            const authorization = this.config.username && this.config.password ? btoa(this.config.username + ":" + this.config.password) : null;
            const body: AI.KoboldCPP.TXT2ImgInput = {
                prompt: p,
                negative_prompt: "",
                steps: 20,
                width: 1024,
                height: 1024,
                seed: Rand.GetIntegerFromInterval(0, Number.MAX_SAFE_INTEGER)
            };
            const headers: HeadersInit = {};
            if (authorization) headers.authorization = "Basic " + authorization;

            const response = await fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers
                });

            const output = await response.blob();
            console.log("generateImage (output)", output);

            return this.blobToBase64(output);
        }

        private blobToBase64(blob: Blob): Promise<string>
        {
            return new Promise<string>((resolve, reject) =>
            {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () =>
                {
                    const base64data = reader.result as string;
                    resolve(base64data.splitFirst(",")[1]);
                };
                reader.onerror = reject;
            });
        }
    };
}