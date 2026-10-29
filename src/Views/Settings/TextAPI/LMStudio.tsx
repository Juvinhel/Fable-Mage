namespace Views.Settings.TextAPI
{
    export function lmStudio(config: Partial<Data.LMStudioEndpoint>)
    {
        return <div id="lmstudio-api">
            <label>{ t("common.url") }</label>
            <input name="url" type="text" value={ config.url ?? "http://localhost:1234" } placeholder={ t("apiSettings.lmStudioUrl") } onblur={ (e: FocusEvent) => refreshLMStudioModels(e.currentTarget as HTMLInputElement) } />

            <label>{ t("common.model") }</label>
            <combo-select name="model" type="text" value={ config.model ?? "" } />

            <div class="group">
                <label>{ t("common.username") }</label>
                <input name="username" type="text" value={ config.username ?? "" } placeholder={ t("apiSettings.optionalUsername") } onblur={ (e: FocusEvent) => refreshLMStudioModels(e.currentTarget as HTMLInputElement) } />

                <label>{ t("common.password") }</label>
                <input name="password" type="password" value={ config.password ?? "" } placeholder={ t("apiSettings.optionalPassword") } onblur={ (e: FocusEvent) => refreshLMStudioModels(e.currentTarget as HTMLInputElement) } />

                <p>{ t("apiSettings.basicAuthHelp") }</p>
            </div>
        </div>;
    }

    async function refreshLMStudioModels(input: HTMLInputElement)
    {
        const apiElement = input.closest("#lmstudio-api");
        const urlInput = apiElement?.querySelector<HTMLInputElement>('input[name="url"]');
        const usernameInput = apiElement?.querySelector<HTMLInputElement>('input[name="username"]');
        const passwordInput = apiElement?.querySelector<HTMLInputElement>('input[name="password"]');
        const modelSelect = apiElement?.querySelector("combo-select") as any;
        const url = urlInput?.value.trim();
        if (!url) return;

        try
        {
            const username = usernameInput?.value;
            const password = passwordInput?.value;
            const models = await new Services.LMStudio.API({ name: "LMStudio", url, model: modelSelect.value, username, password }).getModels();
            if (urlInput.value.trim() != url || usernameInput?.value != username || passwordInput?.value != password) return;
            modelSelect.options = models.map(model => ({ title: model, value: model }));
        }
        catch (error)
        {
            console.error("Unable to load LM Studio models.", error);
            modelSelect.options = [];
        }
    }
}
