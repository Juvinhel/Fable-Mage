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

        return <div class="open-world-dialog">
            { coverUrl ? <img class="cover" src={ coverUrl } /> : <div class="cover missing-cover">No cover</div> }
            <div class="details">
                <div class="metadata">
                    <div class="metadata-field"><label>Author:</label><span>{ world.username || "Unknown" }</span></div>
                    <div class="metadata-field"><label>Version:</label><span>{ world.version || "Unknown" }</span></div>
                    <div class="metadata-field"><label>Mature content:</label><span>{ world.mature ? "Yes" : "No" }</span></div>
                    <div class="metadata-field"><label>Tags:</label><ul class="tags">{ (world.tags ?? []).map(tag => <li>{ tag.trim() }</li>) }</ul></div>
                </div>
            </div>
            <div class="description"><label>Description:</label><p>{ world.description || "No description provided." }</p></div>
            <div class="actions">
                <button class="edit-button" onclick={ () => openWorld(world, "edit") }>Edit</button>
                <button class="play-button" onclick={ () => openWorld(world, "play") }>Play</button>
                { isOwnWorld ? <button class="delete-button" onclick={ () => deleteWorld(world) }>Delete</button> : null }
                <button class="download-button" onclick={ () => downloadWorld(world) }>Download</button>
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
        if (!await UI.Dialog.confirm({ title: "Delete world?", text: `Are you sure you want to delete "${ world.title }" from Nexus? This cannot be undone.` }))
            return;

        try
        {
            await Data.Nexus.API.deleteWorld(world.id);
            UI.Dialog.close(document.querySelector(".open-world-dialog"));
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
            UI.Dialog.close(document.querySelector(".open-world-dialog"));

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