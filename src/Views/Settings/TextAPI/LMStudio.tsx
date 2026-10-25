namespace Views.Settings.TextAPI
{
    export function lmStudio(config: Partial<Data.LMStudioEndpoint>)
    {
        return <div id="lmstudio-api">
            <label>{ t("common.url") }</label>
            <input name="url" type="text" value={ config.url ?? "" } placeholder={ t("apiSettings.lmStudioUrl") } onblur={ (e: FocusEvent) => refreshLMStudioModels(e.currentTarget as HTMLInputElement) } />

            <label>{ t("common.model") }</label>
            <combo-select name="model" type="text" value={ config.model ?? "" } />
        </div>;
    }

    async function refreshLMStudioModels(input: HTMLInputElement)
    {
        const apiElement = input.closest(".lmstudio-api");
        const urlInput = apiElement?.querySelector<HTMLInputElement>('input[name="url"]');
        const modelSelect = apiElement?.querySelector("combo-select") as any;
        const url = urlInput?.value.trim();
        if (!url) return;

        try
        {
            const models = await new AI.LMStudio.API({ name: "LMStudio", url, model: modelSelect.value }).getModels();
            if (urlInput.value.trim() != url) return;
            modelSelect.options = models.map(model => ({ title: model, value: model }));
        }
        catch (error)
        {
            console.error("Unable to load LM Studio models.", error);
            modelSelect.options = [];
        }
    }
}
