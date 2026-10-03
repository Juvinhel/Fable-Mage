namespace Views.Settings.ImageAPI
{
    export function anythingLLM(config: Partial<Data.AnythingLLMEndpoint>)
    {
        return Views.Settings.TextAPI.anythingLLM(config);
    }
}