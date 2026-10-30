namespace Services
{
    export let textAPI: TextAPI;

    export function createTextAPI(config: Data.APIEndpoint): TextAPI
    {
        switch (config.name)
        {
            case "KoboldCPP": return new Services.KoboldCPP.API(config as any);
            case "Gemini": return new Services.Gemini.API(config as any);
            case "AnythingLLM": return new Services.AnythingLLM.API(config as any);
            case "LMStudio": return new Services.LMStudio.API(config as any);
        }
    }

    export interface TextAPI
    {
        generateText(prompt: string, temperature: number, schema?: Schema): Promise<string>;
        generateInteractions(messages: Message[], temperature: number, schema?: Schema): Promise<string>;
        generateInteractionsStream(messages: Message[], temperature: number, onChunk: (chunk: string) => void, schema?: Schema): Promise<string>;
        check(): Promise<void>;
    }

    export type Message = { content: string, role: "system" | "user" | "assistant"; };
}