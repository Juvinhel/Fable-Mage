namespace Views.Nexus
{
    export async function OpenWorldDialog(world: Data.Nexus.WorldRecord): Promise<void>
    {
        const dialog = buildOpenWorldDialog(world) as HTMLElement;
        await UI.Dialog.show(dialog, { title: world.title, allowClose: true, mode: "fill" });
    }

    function buildOpenWorldDialog(world: Data.Nexus.WorldRecord)
    {
        const cover = world.cover?.[0]?.signedPath;
        const coverUrl = cover ? new URL("/" + cover.replace("\\\\", "/"), App.config.nexusURL).toString() : null;

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
            </div>
        </div>;
    }

    async function openWorld(world: Data.Nexus.WorldRecord, action: "edit" | "play")
    {
        try
        {
            const loadedWorld = await new Data.Nexus.API(App.config).getWorldFile(world);
            UI.Dialog.close(document.querySelector(".open-world-dialog"));

            if (action == "edit")
            {
                Views.navigate("World");
                Views.worldElement.import(loadedWorld);
            }
            else
            {
                Views.navigate("Story");
                await Views.storyElement.startStory(loadedWorld);
            }
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }
}