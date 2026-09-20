namespace Data
{
    export interface Config
    {
        nexusURL: string;
        nexusToken: string;
        textAPI: KoboldCPPEndpoint | GeminiEndpoint;
        imageAPI: KoboldCPPEndpoint | GeminiEndpoint | StableDiffusionEndpoint;
    }

    export interface KoboldCPPEndpoint
    {
        name: "KoboldCPP",
        url: string;
        username?: string;
        password?: string;
    }

    export interface GeminiEndpoint
    {
        name: "Gemini",
        api_key: string;
        model?: string;
    }

    export interface StableDiffusionEndpoint
    {
        name: "Stable Diffusion",
        url: string;
        username?: string;
        password?: string;
    }

    const defaultConfig: Config = {
        nexusURL: "https://database.coffinprincess.de/api/v3/data/pe577zan7ugfn6t/m6a7odt9dx2qkn8/records",
        nexusToken: "",
        textAPI: {
            name: "KoboldCPP",
            url: "https://ai.coffinprincess.de"
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