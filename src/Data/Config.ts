namespace Data
{
    export interface Config
    {
        endpoint: string;
        username?: string;
        password?: string;
        textGenerationMaxLength?: number,
    }

    const defaultConfig: Config = {
        endpoint: "http://localhost:5001",
        textGenerationMaxLength: 4096 //8192
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