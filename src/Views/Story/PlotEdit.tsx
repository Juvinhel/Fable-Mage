namespace Views.Story
{
    export async function PlotEdit(location: string, time: string, text: string): Promise<{ location: string; time: string; text: string; }>
    {
        const plotEditDialog = buildPlotEditDialog(location, time, text) as HTMLElement;
        await UI.Dialog.show(plotEditDialog, { title: "Plot edit", allowClose: true, mode: "fill" });

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
        return <div class="plot-edit">
            <label class="location-label">Location:</label>
            <auto-correct-text-area lang="en-US" class="location-input single-line" placeholder="Location" value={ location } analyze={ AI.Client.analyzeLanguage } />
            <label class="time-label">Time:</label>
            <auto-correct-text-area lang="en-US" class="time-input single-line" placeholder="Time" value={ time } analyze={ AI.Client.analyzeLanguage } />
            <label class="text-label">Text:</label>
            <auto-correct-text-area lang="en-US" class="text-input" placeholder="Text" value={ text } analyze={ AI.Client.analyzeLanguage } />
            <div class="actions">
                <button class="ok-button" onclick={ okClick }>OK</button>
                <button class="cancel-button" onclick={ cancelClick }>Cancel</button>
            </div>
        </div>;
    }

    function okClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const dialog = target.closest(".plot-edit");
        dialog.classList.toggle("ok", true);

        UI.Dialog.close(dialog);
    }

    function cancelClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const dialog = target.closest(".plot-edit");
        dialog.classList.toggle("ok", false);
        UI.Dialog.close(dialog);
    }
}