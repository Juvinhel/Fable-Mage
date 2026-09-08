namespace Views
{
    export async function TextEditTouch(e: TouchEvent)
    {
        const textArea = e.currentTarget as HTMLTextAreaElement;
        if (textArea.disabled) return;

        const result = await Dialogs.TextEdit("Text Edit", textArea.value);
        if (result) textArea.value = result;
    }
}