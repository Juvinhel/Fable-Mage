namespace Services
{
    export interface TranslationAPI
    {
        translate(text: string, sourceLanguage: string, targetLanguage: string): Promise<string>;
        check(): Promise<void>;
    }

    export class NoneTranslationAPI implements TranslationAPI
    {
        public async translate(text: string, sourceLanguage: string, targetLanguage: string): Promise<string>
        {
            return text;
        }

        public async check(): Promise<void>
        {
        }
    }
}
