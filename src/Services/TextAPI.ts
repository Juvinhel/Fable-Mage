namespace Services
{
    export interface TextAPI
    {
        generateText(prompt: string, temperature: number, schema?: Schema): Promise<string>;
        generateInteractions(messages: Message[], temperature: number, schema?: Schema): Promise<string>;
        generateInteractionsStream(messages: Message[], temperature: number, onChunk: (chunk: string) => void, schema?: Schema): Promise<string>;
        check(): Promise<void>;
    }

    export type Message = { content: string, role: "system" | "user" | "assistant"; };
}