namespace AI
{
    export interface ImageAPI
    {
        generateImage(prompt: string): Promise<string>;
        check(): Promise<void>;
    }

    export class NoneImageAPI implements ImageAPI
    {
        public async generateImage(prompt: string): Promise<string>
        {
            return "";
        }

        public async check(): Promise<void>
        {
        }
    }
}