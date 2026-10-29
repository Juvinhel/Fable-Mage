namespace Views.Settings.ImageAPI
{
    export function comfyUI(config: Partial<Data.ComfyUIEndpoint>)
    {
        return <div id="comfyui-api">
            <label>{ t("common.url") }</label>
            <input name="url" type="text" value={ config.url ?? "http://localhost:8188" } placeholder={ t("apiSettings.comfyUiUrl") } />

            <div class="group">
                <label>{ t("apiSettings.workflowJson") }</label>

                <div>
                    <input type="file" accept="application/json,.json" onchange={ (e: Event) => loadComfyUIWorkflow(e.currentTarget as HTMLInputElement) } />
                    <input name="workflow" type="hidden" value={ config.workflow ?? "" } />
                    <span>{ config.workflow ? t("apiSettings.workflowLoaded") : "" }</span>
                </div>

                <p>{ t("apiSettings.workflowHelp") }</p>
            </div>

            <div class="group">
                <label>{ t("common.username") }</label>
                <input name="username" type="text" value={ config.username ?? "" } placeholder={ t("apiSettings.optionalUsername") } />

                <label>{ t("common.password") }</label>
                <input name="password" type="password" value={ config.password ?? "" } placeholder={ t("apiSettings.optionalPassword") } />

                <p>{ t("apiSettings.basicAuthHelp") }</p>
            </div>
        </div>;
    }

    async function loadComfyUIWorkflow(input: HTMLInputElement)
    {
        const file = input.files?.[0];
        if (!file) return;

        try
        {
            const workflow = await file.text();
            JSON.parse(workflow);
            const apiElement = input.closest(".comfyui-api");
            const workflowInput = apiElement?.querySelector<HTMLInputElement>('input[name="workflow"]');
            if (!workflowInput) return;
            workflowInput.value = workflow;
            const status = workflowInput.nextElementSibling as HTMLElement;
            status.textContent = file.name;
        }
        catch
        {
            input.value = "";
            UI.Dialog.error(new Error(t("apiSettings.invalidWorkflow")));
        }
    }
}