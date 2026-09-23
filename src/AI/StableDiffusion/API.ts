namespace AI.StableDiffusion
{
    export class API implements AI.ImageAPI
    {
        constructor (config: Data.StableDiffusionEndpoint)
        {
            this.config = config;
        }

        private config: Data.StableDiffusionEndpoint;

        public async generateImage(prompt: string): Promise<string>
        {
            const url = this.config.url + "/sdapi/v1/txt2img";
            const p = prompt.trim();

            const authorization = this.config.username && this.config.password ? btoa(this.config.username + ":" + this.config.password) : null;
            const body: AI.KoboldCPP.TXT2ImgInput = {
                prompt: p,
                width: 1024,
                height: 1024,
            };
            const headers: HeadersInit = {};
            if (authorization) headers.authorization = "Basic " + authorization;

            const response = await fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers
                });
            const contentType = response.headers.get('Content-Type');
            let dataURI;
            switch (contentType.toLowerCase())
            {
                case "text/json":
                case "application/json":
                    const output: AI.KoboldCPP.TXT2ImgOutput = await response.json();
                    dataURI = "data:image/png;base64," + output.images[0];
                    break;
                case "application/octet-stream":
                    const blob1 = await response.blob();
                    dataURI = "data:image/png;base64," + await this.blobToBase64(blob1);
                    break;
                default:
                    const blob2 = await response.blob();
                    dataURI = "data:" + contentType.toLowerCase() + ";base64," + await this.blobToBase64(blob2);
                    break;
            }
            return dataURI;
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

        public async check(): Promise<void>
        {
            const url = this.config.url + "/sdapi/v1/options";

            const authorization = this.config.username && this.config.password ? btoa(this.config.username + ":" + this.config.password) : null;
            const headers: HeadersInit = {};
            if (authorization) headers.authorization = "Basic " + authorization;

            const response = await fetch(url, { method: "GET", headers });
            if (!response.ok) throw new Error("Check failed!");
        }
    };
}