/// <reference path="KoboldCPP/API.ts" />
/// <reference path="Gemini/API.ts" />
/// <reference path="AnythingLLM/API.ts" />
/// <reference path="LMStudio/API.ts" />
/// <reference path="StableDiffusion/API.ts" />
/// <reference path="ComfyUI/API.ts" />

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
            case "AnythingLLM": return new AI.AnythingLLM.API(config);
            case "LMStudio": return new AI.LMStudio.API(config);
        }
    }

    export function createImageAPI(config: any): ImageAPI
    {
        switch (config.name)
        {
            case "KoboldCPP": return new AI.KoboldCPP.API(config);
            case "Gemini": return new AI.Gemini.API(config);
            case "AnythingLLM": return new AI.AnythingLLM.API(config);
            case "Stable Diffusion": return new AI.StableDiffusion.API(config);
            case "ComfyUI": return new AI.ComfyUI.API(config);
            case "None": return new NoneImageAPI();
        }
    }

    export interface TextAPI
    {
        generateText(prompt: string, temperature: number, schema?: Schema): Promise<string>;
        generateInteractions(messages: Message[], temperature: number, schema?: Schema): Promise<string>;
        generateInteractionsStream(messages: Message[], temperature: number, onChunk: (chunk: string) => void, schema?: Schema): Promise<string>;
        check(): Promise<void>;
    }

    export async function readServerSentEvents(response: Response, onData: (data: string) => void): Promise<void>
    {
        const reader = response.body?.getReader();
        if (!reader) throw new Error("The response did not include a readable stream.");

        const decoder = new TextDecoder();
        let buffer = "";
        const dispatch = (event: string) =>
        {
            const data = event.split("\n")
                .filter(line => line.startsWith("data:"))
                .map(line => line.slice(5).replace(/^ /, ""))
                .join("\n");
            if (data) onData(data);
        };

        try
        {
            while (true)
            {
                const { done, value } = await reader.read();
                buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
                let boundary: number;
                while ((boundary = buffer.indexOf("\n\n")) >= 0)
                {
                    dispatch(buffer.slice(0, boundary));
                    buffer = buffer.slice(boundary + 2);
                }
                if (done)
                {
                    if (buffer) dispatch(buffer);
                    break;
                }
            }
        }
        catch (error)
        {
            await reader.cancel();
            throw error;
        }
        finally
        {
            reader.releaseLock();
        }
    }

    export interface ImageAPI
    {
        generateImage(prompt: string): Promise<string>;
        check(): Promise<void>;
    }

    export class NoneImageAPI implements ImageAPI
    {
        public async generateImage(prompt: string): Promise<string>
        {
            return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=";
        }

        public async check(): Promise<void>
        {
        }
    }

    export type Message = { content: string, role: "system" | "user" | "assistant"; };
}