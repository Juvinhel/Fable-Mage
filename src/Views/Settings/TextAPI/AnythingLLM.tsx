namespace Views.Settings.TextAPI
{
    export function anythingLLM(config: Partial<Data.AnythingLLMEndpoint>)
    {
        return <div id="anythingllm-api">
            <label>{ t("common.url") }</label>
            <input name="url" type="text" value={ config.url ?? "http://localhost:3001" } placeholder={ t("apiSettings.anythingServerUrl") } onblur={ (e: FocusEvent) => refreshAnythingLLMModels(e.currentTarget as HTMLInputElement) } />

            <label>{ t("common.apiKey") }</label>
            <input name="api_key" type="password" value={ config.api_key ?? "" } placeholder={ t("apiSettings.anythingApiKey") } onblur={ (e: FocusEvent) => refreshAnythingLLMModels(e.currentTarget as HTMLInputElement) } />

            <div class="group">
                <label>{ t("common.username") }</label>
                <input name="username" type="text" value={ config.username ?? "" } placeholder={ t("apiSettings.optionalUsername") } onblur={ (e: FocusEvent) => refreshAnythingLLMModels(e.currentTarget as HTMLInputElement) } />

                <label>{ t("common.password") }</label>
                <input name="password" type="password" value={ config.password ?? "" } placeholder={ t("apiSettings.optionalPassword") } onblur={ (e: FocusEvent) => refreshAnythingLLMModels(e.currentTarget as HTMLInputElement) } />

                <p>{ t("apiSettings.anythingBasicAuthHelp") }</p>
            </div>

            <label>{ t("apiSettings.workspace") }</label>
            <combo-select name="workspace" type="text" value={ config.workspace ?? "" } />
        </div>;
    }

    async function refreshAnythingLLMModels(input: HTMLInputElement)
    {
        const apiElement = input.closest("#anythingllm-api");
        const urlInput = apiElement?.querySelector<HTMLInputElement>('input[name="url"]');
        const apiKeyInput = apiElement?.querySelector<HTMLInputElement>('input[name="api_key"]');
        const usernameInput = apiElement?.querySelector<HTMLInputElement>('input[name="username"]');
        const passwordInput = apiElement?.querySelector<HTMLInputElement>('input[name="password"]');
        const workspaceSelect = apiElement?.querySelector("combo-select") as any;
        const url = urlInput?.value.trim();
        const apiKey = apiKeyInput?.value?.trim();
        const username = usernameInput?.value;
        const password = passwordInput?.value;
        if (!url || (!apiKey && !(username && password))) return;

        const config: Data.AnythingLLMEndpoint = {
            name: "AnythingLLM",
            url,
            api_key: apiKey,
            workspace: workspaceSelect.value,
            username,
            password
        };

        try
        {
            const models = await new Services.AnythingLLM.API(config).getModels();
            if (urlInput.value.trim() != url || apiKeyInput.value != apiKey || usernameInput?.value != username || passwordInput?.value != password) return;
            workspaceSelect.options = models.map(model => ({ title: model, value: model }));
        }
        catch (error)
        { workspaceSelect.options = []; }
    }
}