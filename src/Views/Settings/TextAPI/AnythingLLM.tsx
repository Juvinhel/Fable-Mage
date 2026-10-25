namespace Views.Settings.TextAPI
{
    export function anythingLLM(config: Partial<Data.AnythingLLMEndpoint>)
    {
        return <div id="anythingllm-api">
            <label>{ t("common.url") }</label>
            <input name="url" type="text" value={ config.url ?? "" } placeholder={ t("apiSettings.anythingServerUrl") } onblur={ (e: FocusEvent) => refreshAnythingLLMModels(e.currentTarget as HTMLInputElement) } />

            <label>{ t("common.apiKey") }</label>
            <input name="api_key" type="password" value={ config.api_key ?? "" } placeholder={ t("apiSettings.anythingApiKey") } onblur={ (e: FocusEvent) => refreshAnythingLLMModels(e.currentTarget as HTMLInputElement) } />

            <label>{ t("apiSettings.workspace") }</label>
            <combo-select name="workspace" type="text" value={ config.workspace ?? "" } />
        </div>;
    }

    async function refreshAnythingLLMModels(input: HTMLInputElement)
    {
        const apiElement = input.closest(".anythingllm-api");
        const urlInput = apiElement?.querySelector<HTMLInputElement>('input[name="url"]');
        const apiKeyInput = apiElement?.querySelector<HTMLInputElement>('input[name="api_key"]');
        const workspaceSelect = apiElement?.querySelector("combo-select") as any;
        const url = urlInput?.value.trim();
        const apiKey = apiKeyInput?.value?.trim();
        if (!url || !apiKey) return;

        const config: Data.AnythingLLMEndpoint = {
            name: "AnythingLLM",
            url,
            api_key: apiKey,
            workspace: workspaceSelect.value
        };

        try
        {
            const models = await new AI.AnythingLLM.API(config).getModels();
            if (urlInput.value.trim() != url || apiKeyInput.value != apiKey) return;
            workspaceSelect.options = models.map(model => ({ title: model, value: model }));
        }
        catch (error)
        { workspaceSelect.options = []; }
    }
}