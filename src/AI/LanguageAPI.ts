namespace AI
{
    export interface LanguageAPI
    {
        analyze(text: string, language?: string): Promise<SuggestedCorrection[]>;
        check(): Promise<void>;
    }

    export class NoneLanguageAPI implements LanguageAPI
    {
        public async analyze(text: string, language?: string): Promise<SuggestedCorrection[]>
        {
            return [];
        }

        public async check(): Promise<void>
        {
        }
    }

    export interface SuggestedCorrection
    {
        offset: number;
        length: number;
        message: string;
        replacements: string[];
    }
}