namespace Services
{
    export let translationAPI: TranslationAPI | undefined;

    export function createTranslationAPI(config?: Data.APIEndpoint): TranslationAPI | undefined
    {
        switch (config?.name)
        {
            case "LibreTranslate": return new Services.LibreTranslate.API(config as any);
            case "None": return undefined;
            case undefined: return undefined;
            default: throw new Error(`Unsupported translation API endpoint: ${ config.name }`);
        }
    }

    export interface TranslationAPI
    {
        translate(text: string, sourceLanguage: string, targetLanguage: string): Promise<string>;
        check(): Promise<void>;
    }
}
