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
        language?: string;
        nexusAccount?: NexusAccount;
        summaryInterval?: number;
        imageStyle?: string;
        customImageStyles: ImageStyle[];
        textAPI: APIEndpoint;
        imageAPI: APIEndpoint;
        languageAPI: APIEndpoint;
        translationAPI: APIEndpoint;
    }

    export interface APIEndpoint
    {
        name: string;
    }

    export interface LanguageToolEndpoint extends APIEndpoint
    {
        name: "LanguageTool";
        url?: string;
        api_key?: string;
        username?: string;
        password?: string;
    }

    export interface NoneLanguageEndpoint extends APIEndpoint
    {
        name: "None";
    }

    export interface LibreTranslateEndpoint extends APIEndpoint
    {
        name: "LibreTranslate";
        url?: string;
        api_key?: string;
        username?: string;
        password?: string;
    }

    export interface NoneTranslateEndpoint extends APIEndpoint
    {
        name: "None";
    }

    export interface KoboldCPPEndpoint extends APIEndpoint
    {
        name: "KoboldCPP",
        url: string;
        username?: string;
        password?: string;
        max_length?: number;
    }

    export interface GeminiEndpoint extends APIEndpoint
    {
        name: "Gemini",
        api_key: string;
        model?: string;
    }

    export interface AnythingLLMEndpoint extends APIEndpoint
    {
        name: "AnythingLLM";
        url: string;
        api_key: string;
        workspace: string;
        username?: string;
        password?: string;
    }

    export interface LMStudioEndpoint extends APIEndpoint
    {
        name: "LMStudio";
        url: string;
        model: string;
        username?: string;
        password?: string;
    }

    export interface StableDiffusionEndpoint extends APIEndpoint
    {
        name: "Stable Diffusion",
        url: string;
        username?: string;
        password?: string;
    }

    export interface ComfyUIEndpoint extends APIEndpoint
    {
        name: "ComfyUI";
        url: string;
        username?: string;
        password?: string;
        workflow: string;
    }

    export interface NoneImageEndpoint extends APIEndpoint
    {
        name: "None";
    }

    const defaultConfig: Config = {
        textAPI: {
            name: "KoboldCPP",
            url: "http://localhost:5001"
        } as KoboldCPPEndpoint,
        imageAPI: {
            name: "Stable Diffusion",
            url: "http://localhost:7860"
        } as StableDiffusionEndpoint,
        languageAPI: {
            name: "None"
        } as NoneLanguageEndpoint,
        translationAPI: {
            name: "None"
        } as NoneTranslateEndpoint,
        customImageStyles: [],
    };

    export async function loadConfig(): Promise<Config>
    {
        let ret: Partial<Config> = localStorage.get("config");
        if (!ret) return defaultConfig;

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