namespace Views.Dialogs
{
    export async function ImageEdit(image: string, prompt: string, placeholder?: string): Promise<{ image: string; prompt: string; }>
    {
        const dialog = buildImageEditDialog(image, prompt, placeholder) as HTMLElement;
        await UI.Dialog.show(dialog, { title: "Generate Image", allowClose: true, mode: "fill" });

        const ok = dialog.classList.contains("ok");
        if (ok)
        {
            const textArea: HTMLTextAreaElement = [...dialog.children].first(x => x instanceof HTMLTextAreaElement) as HTMLTextAreaElement;
            const img: HTMLImageElement = [...dialog.children].first(x => x instanceof HTMLImageElement) as HTMLImageElement;
            return { image: img.src, prompt: textArea.value };
        }
        return null;
    }

    function buildImageEditDialog(image: string, prompt: string, placeholder?: string)
    {
        return <div class="image-edit">
            <img class="image" src={ image } />
            <textarea class="text-input" placeholder={ placeholder ?? "input text" }>{ prompt }</textarea>
            <button class="generate-button" onclick={ (e: Event) => onGenerateImage(e) }>Generate</button>
            <button class="ok-button" onclick={ okClick }>OK</button>
            <button class="cancel-button" onclick={ cancelClick }>Cancel</button>
        </div>;
    }

    async function onGenerateImage(e: Event)
    {
        const button = e.currentTarget as HTMLButtonElement;
        const container = button.closest(".image-edit") as HTMLDivElement;
        const textInput = container.querySelector(".text-input") as HTMLTextAreaElement;
        const image = container.querySelector(".image") as HTMLImageElement;

        beginThinking(container);

        try
        {
            const uri = await AI.Client.getImage(textInput.value);
            image.src = uri;
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }

        stopThinking(container);
    }

    function beginThinking(element: HTMLElement)
    {
        for (const button of element.querySelectorAll("button, input, select, textarea, combo-select") as NodeListOf<any>)
            button.disabled = true;
    }

    function stopThinking(element: HTMLElement)
    {
        for (const button of element.querySelectorAll("button, input, select, textarea, combo-select") as NodeListOf<any>)
            button.disabled = false;
    }

    function okClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const dialog = target.closest(".image-edit");
        dialog.classList.toggle("ok", true);

        UI.Dialog.close(dialog);
    }

    function cancelClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const dialog = target.closest(".image-edit");
        dialog.classList.toggle("ok", false);
        UI.Dialog.close(dialog);
    }
}