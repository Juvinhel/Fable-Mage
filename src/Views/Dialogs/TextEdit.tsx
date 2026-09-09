namespace Views.Dialogs
{
    export async function TextEdit(title: string, text: string, placeholder?: string): Promise<string>
    {
        const textEditDialog = buildTextEditDialog(text, placeholder) as HTMLElement;
        await UI.Dialog.show(textEditDialog, { title, allowClose: true, icon: "img/icons/edit.svg", mode: "fill" });

        const ok = textEditDialog.classList.contains("ok");
        if (ok)
        {
            const textArea: HTMLTextAreaElement = [...textEditDialog.children].first(x => x instanceof HTMLTextAreaElement) as HTMLTextAreaElement;
            return textArea.value;
        }
        return null;
    }

    function buildTextEditDialog(text: string, placeholder?: string)
    {
        return <div class="text-edit">
            <textarea class="text-input" placeholder={ placeholder ?? "input text" }>{ text }</textarea>
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