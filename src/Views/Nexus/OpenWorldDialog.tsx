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
                <a target="_blank" href={ world.fileUrl } download={ world.title + ".json" }>Download</a>
            </div>
        </div>;
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
            const reponse = await fetch(world.fileUrl);
            const file = await reponse.json();
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