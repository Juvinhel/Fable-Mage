namespace Views.World
{
    export async function ScenarioEdit(text: string): Promise<{ lore?: string; text: string; }>
    {
        const scenarioEditDialog = buildScenarioEditDialog(text) as HTMLElement;
        await UI.Dialog.show(scenarioEditDialog, { title: t("scenario.title"), allowClose: true, mode: "fill" });

        const ok = scenarioEditDialog.classList.contains("ok");
        if (ok)
        {
            const lore = (scenarioEditDialog.querySelector(".lore-input") as HTMLAutoCorrectTextArea).value;
            const text = (scenarioEditDialog.querySelector(".text-input") as HTMLAutoCorrectTextArea).value;
            return { lore, text };
        }
        return null;
    }

    function buildScenarioEditDialog(text: string)
    {
        return <div id="scenario-edit">
            <details class="lore">
                <summary>
                    <div>
                        <span>{ t("scenario.lore") }</span>
                        <button class="icon-button load-lore-button" title={ t("scenario.loadLore") } onclick={ loadLoreClick }><color-icon src="img/icons/open.svg" /></button>
                    </div>
                </summary>
                <auto-correct-text-area lang="en-US" class="lore-input large" placeholder={ t("scenario.describeLore") } analyze={ AI.Client.analyzeLanguage } />
            </details>
            <label class="text-label">{ t("scenario.text") }</label>
            <auto-correct-text-area lang="en-US" class="text-input" placeholder={ t("scenario.describe") } value={ text } analyze={ AI.Client.analyzeLanguage } />
            <div class="actions">
                <button class="ok-button" onclick={ okClick }>{ t("common.ok") }</button>
                <button class="cancel-button" onclick={ cancelClick }>{ t("common.cancel") }</button>
            </div>
        </div>;
    }

    async function loadLoreClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const dialog = target.closest("#scenario-edit") as HTMLElement;
        const loreInput = dialog.querySelector(".lore-input") as HTMLAutoCorrectTextArea;

        const result = await UI.Dialog.upload({ multiple: false, title: t("dialogs.loadLore"), accept: "text/plain,.txt,.md,.text" });
        if (result?.length > 0)
        {
            const file = result.item(0);
            loreInput.value = await file.text();
        }
    }

    function okClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const dialog = target.closest("#scenario-edit");
        dialog.classList.toggle("ok", true);
        UI.Dialog.close(dialog);
    }

    function cancelClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const dialog = target.closest("#scenario-edit");
        dialog.classList.toggle("ok", false);
        UI.Dialog.close(dialog);
    }
}