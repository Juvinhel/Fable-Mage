namespace Views.Story
{
    export async function PlotEdit(location: string, time: string, text: string): Promise<{ location: string; time: string; text: string; }>
    {
        const plotEditDialog = buildPlotEditDialog(location, time, text) as HTMLElement;
        await UI.Dialog.show(plotEditDialog, { title: t("plot.editTitle"), allowClose: true, mode: "fill" });

        const ok = plotEditDialog.classList.contains("ok");
        if (ok)
        {
            const location = (plotEditDialog.querySelector(".location-input") as HTMLAutoCorrectTextArea).value;
            const time = (plotEditDialog.querySelector(".time-input") as HTMLAutoCorrectTextArea).value;
            const text = (plotEditDialog.querySelector(".text-input") as HTMLAutoCorrectTextArea).value;
            return { location, time, text };
        }
        return null;
    }

    function buildPlotEditDialog(location: string, time: string, text: string)
    {
        return <div id="plot-edit">
            <label class="location-label">{ t("plot.location") }</label>
            <auto-correct-text-area lang="en-US" class="location-input single-line" placeholder={ t("plot.locationPlaceholder") } value={ location } analyze={ Services.Client.analyzeLanguage } />
            <label class="time-label">{ t("plot.time") }</label>
            <auto-correct-text-area lang="en-US" class="time-input single-line" placeholder={ t("plot.timePlaceholder") } value={ time } analyze={ Services.Client.analyzeLanguage } />
            <label class="text-label">{ t("plot.text") }</label>
            <auto-correct-text-area lang="en-US" class="text-input" placeholder={ t("plot.textPlaceholder") } value={ text } analyze={ Services.Client.analyzeLanguage } />
            <div class="actions">
                <button class="ok-button" onclick={ okClick }>{ t("common.ok") }</button>
                <button class="cancel-button" onclick={ cancelClick }>{ t("common.cancel") }</button>
            </div>
        </div>;
    }

    function okClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const dialog = target.closest("#plot-edit");
        dialog.classList.toggle("ok", true);
        UI.Dialog.close(dialog);
    }

    function cancelClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const dialog = target.closest("#plot-edit");
        dialog.classList.toggle("ok", false);
        UI.Dialog.close(dialog);
    }
}