namespace Views.Settings
{
    export async function ImageStyleEdit(
        imageStyle: Data.ImageStyle,
        customNames: string[],
        title: string = t("settings.editImageStyleTitle")): Promise<Data.ImageStyle>
    {
        const dialog = buildImageStyleEditDialog(imageStyle, customNames) as HTMLElement;
        await UI.Dialog.show(dialog, { title, allowClose: true, mode: "fill" });

        if (!dialog.classList.contains("ok"))
            return null;

        return {
            name: (dialog.querySelector(".name-input") as HTMLInputElement).value.trim(),
            prefix: (dialog.querySelector(".prefix-input") as HTMLTextAreaElement).value,
            suffix: (dialog.querySelector(".suffix-input") as HTMLTextAreaElement).value
        };
    }

    function buildImageStyleEditDialog(imageStyle: Data.ImageStyle, customNames: string[])
    {
        return <div id="image-style-edit">
            <label class="name-label">{ t("settings.imageStyleName") }</label>
            <input class="name-input" type="text" required data-initial-value={ imageStyle?.name } value={ imageStyle.name } />
            <label class="prefix-label">{ t("settings.imageStylePrefix") }</label>
            <textarea class="prefix-input">{ imageStyle.prefix }</textarea>
            <label class="suffix-label">{ t("settings.imageStyleSuffix") }</label>
            <textarea class="suffix-input">{ imageStyle.suffix }</textarea>
            <div class="actions">
                <button class="ok-button" onclick={ (e: Event) => okClick(e, customNames) }>{ t("common.ok") }</button>
                <button class="cancel-button" onclick={ cancelClick }>{ t("common.cancel") }</button>
            </div>
        </div>;
    }

    function validateImageName(name: string, initialName: string, customNames: string[]): { error: string; } | undefined
    {
        const normalizedName = name.trim().toLowerCase();
        if (!normalizedName) return { error: t("settings.imageStyleNameRequired") };

        const normalizedInitialName = initialName.trim().toLowerCase();
        const builtInNames = Object.values(Data.BuiltInImageStyles).map(style => style.name.toLowerCase());
        if (builtInNames.includes(normalizedName)) return { error: t("settings.imageStyleNameAlreadyInUse") };

        if (normalizedName == normalizedInitialName) return undefined; // name did not change

        customNames = customNames.map(style => style.trim().toLowerCase());
        if (customNames.includes(name)) return { error: t("settings.imageStyleNameAlreadyInUse") };

        return undefined;
    }

    function okClick(event: Event, customNames: string[])
    {
        const target = event.currentTarget as HTMLElement;
        const dialog = target.closest("#image-style-edit");
        const name = dialog.querySelector(".name-input") as HTMLInputElement;
        const validity = validateImageName(name.value, name.getAttribute("data-initial-value"), customNames);
        name.setCustomValidity(validity ? validity.error : "");
        if (validity) return;

        dialog.classList.toggle("ok", true);
        UI.Dialog.close(dialog);
    }

    function cancelClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const dialog = target.closest("#image-style-edit");
        dialog.classList.toggle("ok", false);
        UI.Dialog.close(dialog);
    }
}