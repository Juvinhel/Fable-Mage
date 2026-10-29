namespace Services.LanguageTool
{
    export class API implements Services.LanguageAPI
    {
        constructor (config: Data.LanguageToolEndpoint)
        {
            this.config = config;
        }

        private config: Data.LanguageToolEndpoint;
        private defaultUrl = "https://api.languagetool.org";

        public async analyze(text: string, language?: string): Promise<SuggestedCorrection[]>
        {
            const result = await this.sendRequest(text, language);
            const ret: SuggestedCorrection[] = [];
            for (const match of result.matches)
                ret.push({ offset: match.offset, length: match.length, message: match.message, replacements: match.replacements.map(x => x.value) });
            return ret;
        }

        public async check(): Promise<void>
        {
            await this.sendRequest("LanguageTool connection check.", "en-US");
        }

        private async sendRequest(text: string, language = "auto"): Promise<CheckResponse>
        {
            const url = (this.config.url?.trimEnd("/") || this.defaultUrl) + "/v2/check";
            const body = new URLSearchParams({ text, language });
            if (this.config.api_key)
                body.set("apiKey", this.config.api_key);

            const headers: HeadersInit = { "Content-Type": "application/x-www-form-urlencoded" };
            if (this.config.username && this.config.password)
                headers.authorization = "Basic " + btoa(this.config.username + ":" + this.config.password);

            const response = await fetch(url,
                {
                    method: "POST",
                    headers,
                    body
                });

            let output: any;
            try
            {
                output = await response.json();
            }
            catch
            {
                throw new Error(response.ok
                    ? "LanguageTool returned invalid JSON."
                    : `LanguageTool request failed (${ response.status }).`);
            }

            if (!response.ok)
                throw new Error(typeof output.message == "string"
                    ? output.message
                    : `LanguageTool request failed (${ response.status }).`);

            if (!Array.isArray(output.matches) || !output.language || typeof output.language.code != "string")
                throw new Error("LanguageTool returned an invalid analysis response.");

            return output as CheckResponse;
        }
    }

    export interface CheckResponse
    {
        matches: Match[];
        language: {
            name: string;
            code: string;
            detectedLanguage?: {
                name: string;
                code: string;
            };
        };
    }

    export interface Match
    {
        message: string;
        shortMessage: string;
        offset: number;
        length: number;
        replacements: { value: string; }[];
        rule: {
            id: string;
            description: string;
            issueType?: string;
            category: {
                id: string;
                name: string;
            };
        };
    }
}
