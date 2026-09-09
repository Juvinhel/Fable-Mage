/// <reference path="KoboldCPP/API.ts" />
/// <reference path="Diffusion/API.ts" />

namespace AI
{
    export const TextAPI: TextAPI = new AI.KoboldCPP.API();
    export const ImageAPI: ImageAPI = new AI.Diffusion.API();

    export interface TextAPI
    {
        generateText(prompt: string, schema?: any): Promise<string>;
        generateInteractions(messages: Message[], schema?: any): Promise<string>;
    }

    export interface ImageAPI
    {
        generateImage(prompt: string): Promise<string>;
    }

    export type Message = { content: string, role: "system" | "user" | "assistant"; };
}