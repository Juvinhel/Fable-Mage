namespace AI.Diffusion
{
    export class API implements AI.ImageAPI
    {
        public async generateImage(prompt: string): Promise<string>
        {
            const url = App.config.ImageAPI.url + "/generate";
            const p = prompt.trim();

            console.log("generateImage (prompt)", prompt);
            const authorization = App.config.ImageAPI.username && App.config.ImageAPI.password ? btoa(App.config.ImageAPI.username + ":" + App.config.ImageAPI.password) : null;
            const body: AI.KoboldCPP.TXT2ImgInput = {
                prompt: p,
                negative_prompt: "",
                steps: 20,
                width: 512,
                height: 512,
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