namespace Views.Dialogs
{
    export async function TextEdit(title: string, text: string, placeholder?: string): Promise<string>
    {
        const textEditDialog = buildTextEditDialog(text, placeholder) as HTMLElement;
        await UI.Dialog.show(textEditDialog, { title, allowClose: true, mode: "fill" });

        const ok = textEditDialog.classList.contains("ok");
        if (ok)
        {
            const textArea: HTMLAutoCorrectTextArea = [...textEditDialog.children].first(x => x instanceof UI.Elements.AutoCorrectTextArea) as HTMLAutoCorrectTextArea;
            return textArea.value;
        }
        return null;
    }

    function buildTextEditDialog(text: string, placeholder?: string)
    {
        return <div class="text-edit">
            <auto-correct-text-area lang="en-US" class="text-input" placeholder={ placeholder ?? "input text" }>{ text }</auto-correct-text-area>
            <button class="ok-button" onclick={ okClick }>OK</button>
            <button class="cancel-button" onclick={ cancelClick }>Cancel</button>
        </div>;
    }

    function okClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const dialog = target.closest(".text-edit");
        dialog.classList.toggle("ok", true);

        UI.Dialog.close(dialog);
    }

    function cancelClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const dialog = target.closest(".text-edit");
        dialog.classList.toggle("ok", false);
        UI.Dialog.close(dialog);
    }
}