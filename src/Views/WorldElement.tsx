namespace Views
{
    export class WorldElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());
        }

        private tabControl: HTMLTabControl;

        private titleInput: HTMLTextAreaElement;
        private coverImage: HTMLImageElement;
        private authorStyleInput: HTMLTextAreaElement;
        private scenarioInput: HTMLTextAreaElement;
        private focusInput: HTMLTextAreaElement;
        private statList: HTMLDivElement;
        private playerCharacterCard: CharacterCardElement;
        private npcCardList: HTMLElement;

        private prologueContainer: HTMLDivElement;

        private build()
        {
            return this.tabControl = <tab-control>
                <div title="World">
                    <div>
                        <div>
                            <label>Title:</label>
                            { this.titleInput = <textarea class="title-input single-line" value="" /> as HTMLTextAreaElement }
                        </div>
                        <div>
                            <label>Cover:</label>
                            { this.coverImage = <img class="cover-image" onclick={ () => this.onGenerateCover() } /> as HTMLImageElement }
                        </div>
                        <div>
                            <label>Author style:</label>
                            { this.authorStyleInput = <textarea class="author-style-input single-line" value="" ontouchend={ TextEditTouch } /> as HTMLTextAreaElement }
                        </div>
                        <div>
                            <label>Scenario:</label>
                            { this.scenarioInput = <textarea class="scenario-input" value="" ontouchend={ TextEditTouch } /> as HTMLTextAreaElement }
                        </div>
                        <div>
                            <label>Focus:</label>
                            { this.focusInput = <textarea class="focus-input" value="" ontouchend={ TextEditTouch } /> as HTMLTextAreaElement }
                        </div>
                        <div>
                            <label>Tracked Stats:</label>
                            <div class="functions">
                                <button class="icon-button add-stat-button" title="Add new stat" onclick={ () => this.onAddStat() }><color-icon src="img/icons/add.svg" /></button>
                            </div>
                            { this.statList = <div class="stat-list" ontoplevelchildrenchanged={ () => this.onStatsChanged() } onnamechange={ (e: Event) => this.onStatNameChanged(e) } /> as HTMLDivElement }
                        </div>
                    </div>

                    <div class="anchor" />

                    <div>
                        <button class="create-new-world" title="Create a new world using AI" onclick={ () => this.onCreateWorldUsingAI() }><color-icon src="img/icons/ai.svg" /><span>Create new world</span></button>
                        <button class="delete-world" title="Delete current world" onclick={ () => this.onDeleteWorld() }><color-icon src="img/icons/delete.svg" /><span>Delete current world</span></button>
                        <span class="thinking-indicator"><span>Thinking</span><span class="dots">...</span></span>
                    </div>
                </div>
                <div title="Characters">
                    <div>
                        <div ontoplevelchildrenchanged={ (e: Event) => this.onPlayerChanged(e) } >
                            <label>Player:</label>
                            <div class="functions">
                                <button class="icon-button create-player-using-ai-button" title="Create player character using AI" onclick={ () => this.onCreatePlayerUsingAI() }><color-icon src="img/icons/ai.svg" /></button>
                            </div>
                            { this.playerCharacterCard = new CharacterCardElement() }
                        </div>

                        <div>
                            <label>NPCs:</label>
                            <div class="functions">
                                <button class="icon-button add-npc-button" title="Create new npc" onclick={ () => this.onAddNPC() }><color-icon src="img/icons/add.svg" /></button>
                                <button class="icon-button add-npc-using-ai-button" title="Create new npc using AI" onclick={ () => this.onAddNPCUsingAI() }><color-icon src="img/icons/ai.svg" /></button>
                            </div>
                            { this.npcCardList = <div class="npc-list" /> as HTMLElement }
                        </div>
                    </div>

                    <div class="anchor" />

                    <div />
                </div>
                <div title="Prologue">
                    { this.prologueContainer = <div /> as HTMLDivElement }

                    <div class="anchor" />

                    <div>
                        <button class="write-prologue" title="Write a prologue to your world using AI" onclick={ () => this.onWritePrologueUsingAI() }><color-icon src="img/icons/ai.svg" /><span>Write prologue</span></button>
                        <span class="thinking-indicator"><span>Thinking</span><span class="dots">...</span></span>
                    </div>
                </div>
                <div title="Import / Export">
                    <div />

                    <div class="anchor" />

                    <div>
                        <button onclick={ () => this.onImportJSON() }><span>Import JSON</span></button>
                        <button onclick={ () => this.onExportJSON() }><span>Export JSON</span></button>
                    </div>
                </div>
            </tab-control> as HTMLTabControl;
        }

        private coverPrompt: string;
        private async onGenerateCover()
        {
            const result = await Dialogs.ImageEdit(this.coverImage.src, this.coverPrompt, "Describe the cover image of your world.");
            if (!result) return;

            this.coverImage.src = result.image;
            this.coverPrompt = result.prompt;
        }

        private onAddStat()
        {
            this.statList.append(new StatDescriptionElement());
        }

        private get stats(): Data.Stat[]
        {
            const ret: Data.Stat[] = [];
            for (const statDescription of this.statList.querySelectorAll("my-stat-description") as NodeListOf<StatDescriptionElement>)
                ret.push({ name: statDescription.name, description: statDescription.description });
            return ret;
        };

        private onStatsChanged()
        {
            const statNames = this.stats.map(x => x.name);
            for (const characterCardElement of this.querySelectorAll("my-character-card") as NodeListOf<CharacterCardElement>)
                characterCardElement.additionalProperties = statNames;
        }

        private onStatNameChanged(e: Event)
        {
            const oldName = e["old-name"];
            const newName = e["new-name"];
            const statNames = this.stats.map(x => x.name);

            for (const characterCardElement of this.querySelectorAll("my-character-card") as NodeListOf<CharacterCardElement>)
            {
                const character = characterCardElement.exportCharacter();
                characterCardElement.additionalProperties = statNames;
                character[newName] = character[oldName];
                delete character[oldName];
                characterCardElement.importCharacter(character);
            }
        }

        private onPlayerChanged(e: Event)
        {
            const playerContainer = e.currentTarget as HTMLElement;
            if (playerContainer.children.length <= 2) 
            {
                const stats = this.stats.map(x => x.name);
                const playerCard = new CharacterCardElement();
                playerCard.additionalProperties = stats;
                playerContainer.appendChild(this.playerCharacterCard = playerCard);
            }
        }

        private async onCreatePlayerUsingAI()
        {
            const result = await Dialogs.TextEdit("Character Description", "", "Describe your player character.");
            if (!result) return;

            this.beginThinking();

            try
            {
                const world = this.exportWorld();
                const player = await AI.Client.createPlayer(result, world);

                this.playerCharacterCard.importCharacter(player);
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            this.stopThinking();
        }

        private async onAddNPC()
        {
            const stats = this.stats.map(x => x.name);
            const npccard = new CharacterCardElement();
            npccard.additionalProperties = stats;
            this.npcCardList.appendChild(npccard);
        }

        private async onAddNPCUsingAI()
        {
            const result = await Dialogs.TextEdit("Character Description", "", "Describe the NPC that should be added.");
            if (!result) return;

            this.beginThinking();

            try
            {
                const world = this.exportWorld();
                const npc = await AI.Client.createNPC(result, world);

                const stats = this.stats.map(x => x.name);
                const npccard = new CharacterCardElement();
                npccard.additionalProperties = stats;
                npccard.importCharacter(npc);
                this.npcCardList.appendChild(npccard);
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            this.stopThinking();
        }

        private async onCreateWorldUsingAI()
        {
            const result = await Dialogs.TextEdit("World Description", "", "Describe your scenario including lore and background story.");
            if (!result) return;

            await this.onDeleteWorld();
            this.beginThinking();

            try
            {
                const output = await AI.Client.createWorld(result);
                this.titleInput.value = output.title;
                this.authorStyleInput.value = output["author-style"];
                this.scenarioInput.value = output.scenario;
                this.focusInput.value = output.focus;

                const preWorld = this.exportWorld();
                console.log("preWorld", preWorld);
                const [player] = await Promise.all([
                    AI.Client.createPlayer(output.protagonist, preWorld),
                    this.createImage(preWorld)]);

                this.playerCharacterCard.importCharacter(player);
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            this.stopThinking();
        }

        private async createImage(world: Data.World)
        {
            if (this.coverImage.classList.contains("disabled")) return;

            try
            {
                const prompt = await AI.Client.describeWorld(world);
                this.coverPrompt = prompt;
                const image = await AI.Client.getImage(prompt);
                this.coverImage.setAttribute("src", image);
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        private async onWritePrologueUsingAI()
        {
            const result = await Dialogs.TextEdit("Prologue", "", "Write where the story should start off.");
            if (!result) return;

            this.beginThinking();

            try
            {
                this.prologueContainer.clearChildren();
                const world = this.exportWorld();
                const prologue = await AI.Client.writePrologue(result, world);

                const plotPointElement = new PlotPointElement();
                plotPointElement.classList.add("prologue");
                plotPointElement.location = prologue.location;
                plotPointElement.time = prologue.time;
                plotPointElement.text = prologue.plot;
                plotPointElement.internal = prologue.internal;
                this.prologueContainer.appendChild(plotPointElement); HTMLButtonElement;
                // deactivate all inputs
                for (const button of plotPointElement.querySelectorAll("button, input, select, textarea") as NodeListOf<any>)
                    button.disabled = true;
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            this.stopThinking();
        }

        private async onDeleteWorld()
        {
            this.clearWorld();
        }

        private onExportJSON()
        {
            const world = this.exportWorld();

            DownloadHelper.downloadData(world.title + ".json", world);
        }

        private async onImportJSON()
        {
            await this.openWorld();
        }

        public async openWorld()
        {
            const result = await UI.Dialog.upload({ multiple: false, title: "Upload your story", accept: "application/json,text/json,.json" });
            if (result.length > 0)
            {
                const file = result.item(0);
                const text = await file.text();
                const world = JSON.parse(text);
                this.importWorld(world);
            }
        }

        public clearWorld(): void
        {
            this.importWorld({ title: "", cover: "", "author-style": "", scenario: "", focus: "", player: { name: "", appearance: "", personality: "", traits: "", background: "" } });
        }

        public exportWorld(): Data.World
        {
            const world: Data.World = {
                "title": this.titleInput.value.trim(),
                "cover": this.coverImage.getAttribute("src"),
                "author-style": this.authorStyleInput.value.trim().trimRight("."),
                "scenario": this.scenarioInput.value.trim().trimRight("."),
                "focus": this.focusInput.value.trim().trimRight("."),
                "player": this.playerCharacterCard.exportCharacter(),
            };

            const stats = this.stats;
            if (stats && stats.length > 0)
                world.stats = stats;

            const npcs = [];
            for (const npcCard of this.npcCardList.querySelectorAll("my-character-card") as NodeListOf<CharacterCardElement>)
                npcs.push(npcCard.exportCharacter());
            if (npcs.length > 0) world.npcs = npcs;

            const prologueElement = this.prologueContainer.children[0] as PlotPointElement;
            if (prologueElement)
            {
                const prologue: Data.Prologue = prologueElement.exportPlotPoint();
                world.prologue = prologue;
            }

            return world;
        }

        public importWorld(world: Data.World)
        {
            this.npcCardList.clearChildren();

            this.titleInput.value = world.title;
            this.coverImage.setAttribute("src", world.cover);
            this.authorStyleInput.value = world["author-style"];
            this.scenarioInput.value = world.scenario;
            this.focusInput.value = world.focus;

            this.statList.clearChildren();
            if (world.stats)
                for (const stat of world.stats)
                {
                    const statDescriptionElement = new StatDescriptionElement();
                    statDescriptionElement.name = stat.name;
                    statDescriptionElement.description = stat.description;
                    this.statList.append(statDescriptionElement);
                }

            const stats = world.stats?.map(x => x.name) ?? [];

            const playerCard = new CharacterCardElement();
            playerCard.additionalProperties = stats;
            playerCard.importCharacter(world.player);
            this.playerCharacterCard.replaceWith(playerCard);
            this.playerCharacterCard = playerCard;

            this.npcCardList.clearChildren();
            if (world.npcs) for (const npc of world.npcs)
            {
                const npccard = new CharacterCardElement();
                npccard.additionalProperties = stats;
                npccard.importCharacter(npc);
                this.npcCardList.append(npccard);
            }

            this.prologueContainer.clearChildren();
            if (world.prologue)
            {
                const plotPointElement = new PlotPointElement();
                plotPointElement.classList.add("prologue");
                plotPointElement.importPlotPoint(world.prologue);
            }
        }

        private beginThinking()
        {
            for (const indicator of this.querySelectorAll(".thinking-indicator"))
                indicator.classList.toggle("show", true);
            for (const button of this.querySelectorAll("button, input, select, textarea, combo-select, img") as NodeListOf<any>)
                button.disabled = true;
        }

        private stopThinking()
        {
            for (const indicator of this.querySelectorAll(".thinking-indicator"))
                indicator.classList.toggle("show", false);
            for (const button of this.querySelectorAll("button, input, select, textarea, combo-select, img") as NodeListOf<any>)
                button.disabled = false;
        }
    }

    customElements.define("my-world", WorldElement);
}