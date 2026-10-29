namespace Services.LibreTranslate
{
    export class API implements Services.TranslationAPI
    {
        constructor(config: Data.LibreTranslateEndpoint)
        {
            this.config = config;
        }

        private config: Data.LibreTranslateEndpoint;
        private defaultUrl = "https://libretranslate.com";

        public async translate(text: string, sourceLanguage: string, targetLanguage: string): Promise<string>
        {
            const body: { q: string; source: string; target: string; format: string; api_key?: string; } = {
                q: text,
                source: sourceLanguage,
                target: targetLanguage,
                format: "text"
            };
            if (this.config.api_key)
                body.api_key = this.config.api_key;

            const response = await fetch(this.url + "/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...this.headers },
                body: JSON.stringify(body)
            });

            const output = await this.readResponse(response);
            if (!response.ok)
                throw new Error(typeof output.error == "string"
                    ? output.error
                    : `LibreTranslate request failed (${ response.status }).`);
            if (typeof output.translatedText != "string")
                throw new Error("LibreTranslate returned an invalid translation response.");

            return output.translatedText;
        }

        public async check(): Promise<void>
        {
            const response = await fetch(this.url + "/languages", { headers: this.headers });
            const output = await this.readResponse(response);
            if (!response.ok)
                throw new Error(typeof output.error == "string"
                    ? output.error
                    : `LibreTranslate request failed (${ response.status }).`);
            if (!Array.isArray(output) || !output.every(language =>
                language && typeof language.code == "string" && typeof language.name == "string"))
                throw new Error("LibreTranslate returned an invalid languages response.");
        }

        private get url(): string
        {
            return (this.config.url?.trim().replace(/\/+$/, "") || this.defaultUrl);
        }

        private get headers(): Record<string, string>
        {
            const headers: Record<string, string> = {};
            if (this.config.username && this.config.password)
                headers.authorization = "Basic " + btoa(this.config.username + ":" + this.config.password);
            return headers;
        }

        private async readResponse(response: Response): Promise<any>
        {
            try
            {
                return await response.json();
            }
            catch
            {
                throw new Error(response.ok
                    ? "LibreTranslate returned invalid JSON."
                    : `LibreTranslate request failed (${ response.status }).`);
            }
        }
    }
}
