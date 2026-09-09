/// <reference path="KoboldCPP/API.ts" />
/// <reference path="Diffusion/API.ts" />

namespace AI
{
    export const API = new class
    {
        public get TextAPI()
        {
            switch (App.config.TextAPI.name)
            {
                case "KoboldCPP": return new AI.KoboldCPP.API(App.config.TextAPI);
            }
        }

        public get ImageAPI()
        {
            switch (App.config.ImageAPI.name)
            {
                case "KoboldCPP": return new AI.KoboldCPP.API(App.config.ImageAPI);
                case "Diffusion": return new AI.Diffusion.API(App.config.ImageAPI);
            }
        }
    }();

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