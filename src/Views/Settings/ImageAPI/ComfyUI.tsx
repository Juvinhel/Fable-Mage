namespace Views.Settings.ImageAPI
{
    export function comfyUI(config: Partial<Data.ComfyUIEndpoint>)
    {
        return <div class="comfyui-api">
            <div>
                <label>URL:</label>
                <input name="url" type="text" value={ config.url ?? "" } placeholder="ComfyUI server URL" />
            </div>
            <div class="group">
                <div>
                    <label>Workflow JSON:</label>
                    <input type="file" accept="application/json,.json" onchange={ (e: Event) => loadComfyUIWorkflow(e.currentTarget as HTMLInputElement) } />
                    <input name="workflow" type="hidden" value={ config.workflow ?? "" } />
                    <span>{ config.workflow ? "Workflow loaded" : "" }</span>
                </div>
                <p>Upload an API-format workflow JSON with { "{{prompt}}" } in the text input to fill with the generated prompt.</p>
            </div>
            <div class="group">
                <div>
                    <label>Username:</label>
                    <input name="username" type="text" value={ config.username ?? "" } placeholder="Optional username" />
                </div>
                <div>
                    <label>Password:</label>
                    <input name="password" type="password" value={ config.password ?? "" } placeholder="Optional password" />
                </div>
                <p>Only needed when the endpoint is behind a reverse proxy using Basic authentication.</p>
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
            UI.Dialog.error(new Error("The selected workflow file is not valid JSON."));
        }
    }
}