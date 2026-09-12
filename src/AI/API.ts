/// <reference path="KoboldCPP/API.ts" />
/// <reference path="StableDiffusion/API.ts" />

namespace AI
{
    export let textAPI: TextAPI;
    export let imageAPI: ImageAPI;

    export function createTextAPI(config: any): TextAPI
    {
        switch (config.name)
        {
            case "KoboldCPP": return new AI.KoboldCPP.API(config);
            case "Gemini": return new AI.Gemini.API(config);
        }
    }

    export function createImageAPI(config: any): ImageAPI
    {
        switch (config.name)
        {
            case "KoboldCPP": return new AI.KoboldCPP.API(config);
            case "Stable Diffusion": return new AI.StableDiffusion.API(config);
        }
    }

    export interface TextAPI
    {
        generateText(prompt: string, schema?: any): Promise<string>;
        generateInteractions(messages: Message[], schema?: any): Promise<string>;
        check(): Promise<void>;
    }

    export interface ImageAPI
    {
        generateImage(prompt: string): Promise<string>;
        check(): Promise<void>;
    }

    export type Message = { content: string, role: "system" | "user" | "assistant"; };
}