namespace Services
{
    export let languageAPI: LanguageAPI | undefined;

    export function createLanguageAPI(config?: Data.APIEndpoint): LanguageAPI | undefined
    {
        switch (config?.name)
        {
            case "LanguageTool": return new Services.LanguageTool.API(config as any);
            case "None": return undefined;
            case undefined: return undefined;
            default: throw new Error(`Unsupported language API endpoint: ${ config.name }`);
        }
    }

    export interface LanguageAPI
    {
        analyze(text: string, language?: string): Promise<SuggestedCorrection[]>;
        check(): Promise<void>;
    }

    export interface SuggestedCorrection
    {
        offset: number;
        length: number;
        message: string;
        replacements: string[];
    }
}