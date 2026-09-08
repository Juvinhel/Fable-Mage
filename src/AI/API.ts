/// <reference path="KoboldCPP/API.ts" />

namespace AI
{
    export const API: API = new AI.KoboldCPP.API();
    export interface API
    {
        generateText(prompt: string, schema?: any): Promise<string>;
        generateInteractions(messages: Message[], schema?: any): Promise<string>;
        generateImage(prompt: string): Promise<string>;
    }

    export type Message = { content: string, role: "system" | "user" | "assistant"; };
}