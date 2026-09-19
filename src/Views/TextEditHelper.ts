namespace Views
{
    export async function TextEditTouch(e: TouchEvent)
    {
        const textArea = e.currentTarget as (HTMLAutoCorrectTextArea | HTMLTextAreaElement);
        if (textArea.classList.contains("disabled") || (textArea as any).disabled) return;

        const result = await Dialogs.TextEdit("Text Edit", textArea.value);
        if (result) textArea.value = result;
    }
}