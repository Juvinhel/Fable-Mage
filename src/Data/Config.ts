namespace Data
{
    export interface Config
    {
        language: string;
        textAPI: KoboldCPPEndpoint;
        imageAPI: KoboldCPPEndpoint | CustomImageEndpoint;
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

    export interface CustomImageEndpoint
    {
        name: "Custom Image API",
        url: string;
        username?: string;
        password?: string;
    }

    const defaultConfig: Config = {
        language: "English",
        textAPI: {
            name: "KoboldCPP",
            url: "https://ai.coffinprincess.de",
            textGenerationMaxLength: 4096, //8192
            temperature: 0.7
        },
        imageAPI: {
            name: "Custom Image API",
            url: "https://diffusion.coffinprincess.de/txt2img/generate"
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