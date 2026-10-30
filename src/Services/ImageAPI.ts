namespace Services
{
    export declare let imageAPI: ImageAPI | undefined;

    export function createImageAPI(config?: Data.APIEndpoint): ImageAPI | undefined
    {
        switch (config?.name)
        {
            case "KoboldCPP": return new Services.KoboldCPP.API(config as any);
            case "Gemini": return new Services.Gemini.API(config as any);
            case "AnythingLLM": return new Services.AnythingLLM.API(config as any);
            case "Stable Diffusion": return new Services.StableDiffusion.API(config as any);
            case "ComfyUI": return new Services.ComfyUI.API(config as any);
            case "None": return undefined;
            case undefined: return undefined;
            default: throw new Error(`Unsupported image API endpoint: ${ config.name }`);
        }
    }

    export interface ImageAPI
    {
        generateImage(prompt: string): Promise<string>;
        check(): Promise<void>;
    }
}

Object.defineProperty(Services, "imageAPI", {
    get(): Services.ImageAPI | undefined
    {
        return Services["internal_imageAPI"];
    },
    set(value: Services.ImageAPI | undefined)
    {
        Services["internal_imageAPI"] = value;
        document.body.classList.toggle("no-image-api", !value);
    },
    enumerable: true,
    configurable: true,
});