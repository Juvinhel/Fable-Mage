/// <reference path="KoboldCPP/API.ts" />
/// <reference path="Gemini/API.ts" />
/// <reference path="AnythingLLM/API.ts" />
/// <reference path="LMStudio/API.ts" />
/// <reference path="LanguageAPI.ts" />
/// <reference path="LanguageTool/API.ts" />
/// <reference path="TranslationAPI.ts" />
/// <reference path="LibreTranslate/API.ts" />
/// <reference path="StableDiffusion/API.ts" />
/// <reference path="ComfyUI/API.ts" />

namespace Services
{
    export let textAPI: TextAPI;
    export let languageAPI: LanguageAPI;
    export let translationAPI: TranslationAPI;
    export declare let imageAPI: ImageAPI;

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

    export function createImageAPI(config: Data.APIEndpoint): ImageAPI
    {
        switch (config.name)
        {
            case "KoboldCPP": return new Services.KoboldCPP.API(config as any);
            case "Gemini": return new Services.Gemini.API(config as any);
            case "AnythingLLM": return new Services.AnythingLLM.API(config as any);
            case "Stable Diffusion": return new Services.StableDiffusion.API(config as any);
            case "ComfyUI": return new Services.ComfyUI.API(config as any);
            case "None": return new NoneImageAPI();
        }
    }

    export function createLanguageAPI(config: Data.APIEndpoint): LanguageAPI
    {
        switch (config.name)
        {
            case "LanguageTool": return new Services.LanguageTool.API(config as any);
            case "None": return new NoneLanguageAPI();
        }
    }

    export function createTranslationAPI(config: Data.APIEndpoint): TranslationAPI
    {
        switch (config.name)
        {
            case "LibreTranslate": return new Services.LibreTranslate.API(config as any);
            case "None": return new NoneTranslationAPI();
        }
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
}

Object.defineProperty(Services, "imageAPI", {
    get(): Services.ImageAPI
    {
        return Services["internal_imageAPI"];
    },
    set(value: Services.ImageAPI)
    {
        Services["internal_imageAPI"] = value;
        document.body.classList.toggle("no-image-api", value instanceof Services.NoneImageAPI);
    },
    enumerable: true,
    configurable: true,
});