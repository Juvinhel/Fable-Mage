namespace Data
{
    export interface NexusAccount
    {
        provider: string;
        email: string;
        username: string;
    }

    export interface Config
    {
        nexusAccount?: NexusAccount;
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
        let ret: Partial<Config> & { nexusEmail?: string; nexusUsername?: string; } = localStorage.get("config");
        if (!ret) return defaultConfig;

        if (!("nexusAccount" in ret) && (ret.nexusEmail !== undefined || ret.nexusUsername !== undefined))
        {
            ret.nexusAccount = {
                provider: "Google",
                email: ret.nexusEmail ?? "",
                username: ret.nexusUsername ?? ""
            };
        }

        delete ret.nexusEmail;
        delete ret.nexusUsername;

        for (const entry of Object.entries(defaultConfig))
            if (!(entry[0] in ret))
                (ret as any)[entry[0]] = entry[1];

        return ret as Config;
    }

    export async function saveConfig(config: Config): Promise<void>
    {
        localStorage.set("config", config);
    }
}