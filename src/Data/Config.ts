namespace Data
{
    export interface Config
    {
        TextAPI: KoboldCPPEndpoint;
        ImageAPI: KoboldCPPEndpoint | DiffusionEndpoint;
    }

    export interface KoboldCPPEndpoint
    {
        name: "KoboldCPP",
        url: string;
        username?: string;
        password?: string;
        textGenerationMaxLength?: number,
        temperature?: number;
    }

    export interface DiffusionEndpoint
    {
        name: "Diffusion",
        url: string;
        username?: string;
        password?: string;
    }

    const defaultConfig: Config = {
        TextAPI: {
            name: "KoboldCPP",
            url: "https://ai.coffinprincess.de",
            textGenerationMaxLength: 4096, //8192
            temperature: 0.7
        },
        ImageAPI: {
            name: "Diffusion",
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