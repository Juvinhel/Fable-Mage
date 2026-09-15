namespace Data
{
    export interface Config
    {
        textAPI: KoboldCPPEndpoint | GeminiEndpoint;
        imageAPI: KoboldCPPEndpoint | StableDiffusionEndpoint;
    }

    export interface KoboldCPPEndpoint
    {
        name: "KoboldCPP",
        url: string;
        username?: string;
        password?: string;
        temperature?: number;
    }

    export interface GeminiEndpoint
    {
        name: "Gemini",
        api_key: string;
    }

    export interface StableDiffusionEndpoint
    {
        name: "Stable Diffusion",
        url: string;
        username?: string;
        password?: string;
    }

    const defaultConfig: Config = {
        textAPI: {
            name: "KoboldCPP",
            url: "https://ai.coffinprincess.de",
            temperature: 0.7
        },
        imageAPI: {
            name: "Stable Diffusion",
            url: "https://diffusion.coffinprincess.de"
        }
    };

    export async function loadConfig(): Promise<Config>
    {
        let ret: Config = localStorage.get("config");
        if (!ret) return defaultConfig;

        for (const entry of Object.entries(defaultConfig))
            if (!(entry[0] in ret))
                ret[entry[0]] = entry[1];

        return ret;
    }

    export async function saveConfig(config: Config): Promise<void>
    {
        localStorage.set("config", config);
    }
}