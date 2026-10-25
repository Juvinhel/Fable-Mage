namespace Views.Nexus
{
    export async function OpenWorldDialog(world: Data.Nexus.WorldRecord): Promise<void>
    {
        const dialog = buildOpenWorldDialog(world) as HTMLElement;
        await UI.Dialog.show(dialog, { title: world.title, allowClose: true, mode: "fill" });
    }

    function buildOpenWorldDialog(world: Data.Nexus.WorldRecord)
    {
        const coverUrl = world.coverUrl ?? null;
        const userId = App.config.nexusAccount?.email?.trim().toLocaleLowerCase();
        const isOwnWorld = !!userId && world.userid?.trim().toLocaleLowerCase() == userId;

        return <div id="open-world-dialog">
            { coverUrl ? <img class="cover" src={ coverUrl } /> : <div class="cover missing-cover">{ t("nexus.noCover") }</div> }
            <div class="details">
                <div class="metadata">
                    <div class="metadata-field"><label>{ t("nexus.author") }</label><span>{ world.username || t("common.unknown") }</span></div>
                    <div class="metadata-field"><label>{ t("nexus.version") }</label><span>{ world.version || t("common.unknown") }</span></div>
                    <div class="metadata-field"><label>{ t("nexus.matureContent") }</label><span>{ world.mature ? t("common.yes") : t("common.no") }</span></div>
                    <div class="metadata-field"><label>{ t("nexus.tags") }</label><ul class="tags">{ (world.tags ?? []).map(tag => <li>{ tag.trim() }</li>) }</ul></div>
                </div>
            </div>
            <div class="description"><label>{ t("nexus.description") }</label><p>{ world.description || t("nexus.noDescription") }</p></div>
            <div class="actions">
                <button class="play-button" onclick={ () => openWorld(world, "play") }><color-icon src="img/icons/play.svg" /><span>{ t("nexus.play") }</span></button>
                <button class="edit-button" onclick={ () => openWorld(world, "edit") }><color-icon src="img/icons/edit.svg" /><span>{ t("nexus.edit") }</span></button>
                { isOwnWorld ? <button class="delete-button" onclick={ () => deleteWorld(world) }><color-icon src="img/icons/delete.svg" /><span>{ t("nexus.delete") }</span></button> : null }
                <button class="download-button" onclick={ () => downloadWorld(world) }><color-icon src="img/icons/download-from-cloud.svg" /><span>{ t("nexus.download") }</span></button>
            </div>
        </div>;
    }

    async function downloadWorld(world: Data.Nexus.WorldRecord)
    {
        try
        {
            const data = await Data.Nexus.API.getWorldData(world.id);
            const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));
            const link = document.createElement("a");
            link.href = url;
            link.download = world.title + ".json";
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 0);
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }

    async function deleteWorld(world: Data.Nexus.WorldRecord)
    {
        if (!await UI.Dialog.confirm({ title: t("nexus.deleteWorldTitle"), text: t("nexus.deleteWorldConfirmation", { title: world.title }) }))
            return;

        try
        {
            await Data.Nexus.API.deleteWorld(world.id);
            UI.Dialog.close(document.querySelector("#open-world-dialog"));
            await Views.nexusElement.refresh();
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }

    async function openWorld(world: Data.Nexus.WorldRecord, action: "edit" | "play")
    {
        try
        {
            const file = await Data.Nexus.API.getWorldData(world.id);
            UI.Dialog.close(document.querySelector("#open-world-dialog"));

            if (action == "edit")
            {
                Views.navigate("World");
                Views.worldElement.import(file);
            }
            else
            {
                Views.navigate("Story");
                await Views.storyElement.startStory(file);
            }
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }
}