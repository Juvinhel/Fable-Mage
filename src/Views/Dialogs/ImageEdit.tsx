namespace Views.Dialogs
{
    export async function ImageEdit(image: string, prompt: string, placeholder?: string): Promise<{ image: string; prompt: string; }>
    {
        const dialog = buildImageEditDialog(image, prompt, placeholder) as HTMLElement;
        await UI.Dialog.show(dialog, { title: t("dialogs.generateImage"), allowClose: true, mode: "fill" });

        const ok = dialog.classList.contains("ok");
        if (ok)
        {
            const textArea: HTMLAutoCorrectTextArea = [...dialog.children].first(x => x instanceof UI.Elements.AutoCorrectTextArea) as HTMLAutoCorrectTextArea;
            const img: HTMLImageElement = [...dialog.children].first(x => x instanceof HTMLImageElement) as HTMLImageElement;
            return { image: img.src, prompt: textArea.value };
        }
        return null;
    }

    function buildImageEditDialog(image: string, prompt: string, placeholder?: string)
    {
        return <div id="image-edit">
            <img class="image" src={ image } />
            <auto-correct-text-area class="text-input" placeholder={ placeholder ?? t("dialogs.inputText") } lang="en-US" value={ prompt } analyze={ AI.Client.analyzeLanguage } />
            <button class="generate-button" onclick={ (e: Event) => onGenerateImage(e) }>{ t("dialogs.generate") }</button>
            <button class="ok-button" onclick={ okClick }>{ t("common.ok") }</button>
            <button class="cancel-button" onclick={ cancelClick }>{ t("common.cancel") }</button>
        </div>;
    }

    async function onGenerateImage(e: Event)
    {
        const button = e.currentTarget as HTMLButtonElement;
        const container = button.closest("#image-edit") as HTMLDivElement;
        const textInput = container.querySelector(".text-input") as HTMLAutoCorrectTextArea;
        const image = container.querySelector(".image") as HTMLImageElement;

        App.beginThinking();

        try
        {
            const uri = await AI.Client.getImage(textInput.value);
            image.src = uri;
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }

        App.stopThinking();
    }

    function okClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const dialog = target.closest("#image-edit");
        dialog.classList.toggle("ok", true);
        UI.Dialog.close(dialog);
    }

    function cancelClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const dialog = target.closest("#image-edit");
        dialog.classList.toggle("ok", false);
        UI.Dialog.close(dialog);
    }
}