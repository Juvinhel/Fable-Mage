namespace Views.World
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
        private rulesInput: HTMLTextAreaElement;
        private tagsInput: HTMLMultiSelect;
        private statList: HTMLDivElement;
        private playerCharacterCard: CharacterCardElement;
        private npcCardList: HTMLElement;

        private prologueContainer: HTMLDivElement;

        private build()
        {
            return this.tabControl = <tab-control>
                <div tab-header="World" class="world-tab">
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
                            <label>Rules:</label>
                            { this.rulesInput = <textarea class="rules-input" value="" ontouchend={ TextEditTouch } /> as HTMLTextAreaElement }
                        </div>
                        <div>
                            <label>Tags:</label>
                            { this.tagsInput = <multi-select options={ Data.knownTags.map(x => ({ title: x.value, value: x.value })) } /> as HTMLMultiSelect }
                        </div>
                        <div>
                            <label>Tracked Stats:</label>
                            <div class="functions horizontal">
                                <button class="icon-button add-stat-button" title="Add new stat" onclick={ () => this.onAddStat() }><color-icon src="img/icons/add.svg" /></button>
                            </div>
                            { this.statList = <div class="stat-list" ontoplevelchildrenchanged={ () => this.onStatsChanged() } onnamechange={ (e: Event) => this.onStatNameChanged(e) } /> as HTMLDivElement }
                        </div>
                    </div>

                    <div class="anchor" />

                    <div>
                        <button class="create-new-world" title="Create a new world using AI" onclick={ () => this.createWorldUsingAI() }><color-icon src="img/icons/ai.svg" /><span>Create new world</span></button>
                        <button class="delete-world" title="Delete current world" onclick={ () => this.onDeleteWorld() }><color-icon src="img/icons/delete.svg" /><span>Delete current world</span></button>
                        <button onclick={ () => this.startStory() }><span>Start Story</span></button>
                        <span class="thinking-indicator"><span>Thinking</span><span class="dots">...</span></span>
                    </div>
                </div>
                <div tab-header="Characters" class="characters-tab">
                    <div>
                        <div ontoplevelchildrenchanged={ (e: Event) => this.onPlayerChanged(e) } >
                            <label>Player:</label>
                            <div class="functions horizontal">
                                <button class="icon-button create-player-using-ai-button" title="Create player character using AI" onclick={ () => this.onCreatePlayerUsingAI() }><color-icon src="img/icons/ai.svg" /></button>
                            </div>
                            { this.playerCharacterCard = new CharacterCardElement() }
                        </div>

                        <div>
                            <label>NPCs:</label>
                            <div class="functions horizontal">
                                <button class="icon-button add-npc-button" title="Create new npc" onclick={ () => this.onAddNPC() }><color-icon src="img/icons/add.svg" /></button>
                                <button class="icon-button add-npc-using-ai-button" title="Create new npc using AI" onclick={ () => this.onAddNPCUsingAI() }><color-icon src="img/icons/ai.svg" /></button>
                            </div>
                            { this.npcCardList = <div class="npc-list" /> as HTMLElement }
                        </div>
                    </div>

                    <div class="anchor" />

                    <div />
                </div>
                <div tab-header="Prologue" class="prologue-tab">
                    { this.prologueContainer = <div /> as HTMLDivElement }

                    <div class="anchor" />

                    <div>
                        <button class="write-prologue" title="Write a prologue to your world using AI" onclick={ () => this.onWritePrologueUsingAI() }><color-icon src="img/icons/ai.svg" /><span>Write prologue</span></button>
                        <span class="thinking-indicator"><span>Thinking</span><span class="dots">...</span></span>
                    </div>
                </div>
                <div tab-header="Import / Export" class="import-export-tab">
                    <div />

                    <div class="anchor" />

                    <div>
                        <button onclick={ () => this.open() }><span>Import JSON</span></button>
                        <button onclick={ () => this.save() }><span>Export JSON</span></button>
                    </div>
                </div>
            </tab-control> as HTMLTabControl;
        }

        private previousGenerateCoverPrompt: string;
        private async onGenerateCover()
        {
            if (this.coverImage.classList.contains("disabled")) return;

            const result = await Dialogs.ImageEdit(this.coverImage.src, this.previousGenerateCoverPrompt, "Describe the cover image of your world.");
            if (!result) return;

            this.previousGenerateCoverPrompt = result.prompt;
            result.image ? this.coverImage.setAttribute("src", result.image) : this.coverImage.removeAttribute("src");
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
            this.playerCharacterCard.additionalProperties = statNames;
        }

        private onStatNameChanged(e: Event)
        {
            const oldName = e["old-name"];
            const newName = e["new-name"];
            const statNames = this.stats.map(x => x.name);

            for (const characterCardElement of this.querySelectorAll("my-character-card") as NodeListOf<CharacterCardElement>)
            {
                const character = characterCardElement.export();
                characterCardElement.additionalProperties = statNames;
                character[newName] = character[oldName];
                delete character[oldName];
                characterCardElement.import(character);
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

        private previousCreatePlayerPrompt = "";
        private async onCreatePlayerUsingAI()
        {
            const result = await Dialogs.TextEdit("Character Description", this.previousCreatePlayerPrompt, "Describe your player character.");
            if (!result) return;
            this.previousCreatePlayerPrompt = result;

            App.beginThinking();

            await this.createPlayerUsingAI(result);

            App.stopThinking();
        }

        private async createPlayerUsingAI(prompt: string)
        {
            try
            {
                const world = this.export();
                const player = await AI.Client.createPlayer(prompt, world);
                this.playerCharacterCard.import(player);
                await this.createPortrait(player, this.playerCharacterCard);
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        private async onAddNPC()
        {
            const npccard = new CharacterCardElement();
            this.npcCardList.appendChild(npccard);
        }

        private previousCreateNPCPrompt = "";
        private async onAddNPCUsingAI()
        {
            const result = await Dialogs.TextEdit("Character Description", this.previousCreateNPCPrompt, "Describe the NPC that should be added.");
            if (!result) return;
            this.previousCreateNPCPrompt = result;

            App.beginThinking();

            try
            {
                const world = this.export();
                const npc = await AI.Client.createNPC(result, world);

                const npccard = new CharacterCardElement();
                npccard.import(npc);
                this.npcCardList.appendChild(npccard);

                await this.createPortrait(npc, npccard);
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            App.stopThinking();
        }

        private async createPortrait(character: Data.Character, characterCardElement: CharacterCardElement)
        {
            try
            {
                const prompt = await AI.Client.describeCharacter(character);
                characterCardElement.previousGeneratePortraitPrompt = prompt;
                const image = await AI.Client.getImage(prompt);
                characterCardElement.portrait = image;
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        private previousCreateWorldPrompt = "";
        public async createWorldUsingAI()
        {
            const result = await Dialogs.TextEdit("World Description", this.previousCreateWorldPrompt, "Describe your scenario including lore and background story.");
            if (!result) return;
            this.previousCreateWorldPrompt = result;

            await this.onDeleteWorld();
            App.beginThinking();

            try
            {
                const output = await AI.Client.createWorld(result);
                this.titleInput.value = output.title;
                this.authorStyleInput.value = output["author-style"];
                this.scenarioInput.value = output.scenario;
                this.rulesInput.value = output.rules;

                await Promise.all([
                    this.createCoverImage(),
                    this.extractTags(),
                    this.createPlayerUsingAI(output.protagonist)]);
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            App.stopThinking();
        }

        private async createCoverImage()
        {
            try
            {
                const world = this.export();
                const prompt = await AI.Client.describeWorld(world);
                this.previousGenerateCoverPrompt = prompt;
                const image = await AI.Client.getImage(prompt);
                this.coverImage.setAttribute("src", image);
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        private async extractTags()
        {
            try
            {
                const world = this.export();
                const tags = await AI.Client.extractTags(Data.knownTags.map(x => x.value), world);
                this.tagsInput.checkedOptions = this.tagsInput.options.filter(x => tags.includes(x.value));
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        private previousCreateProloguePrompt;
        private async onWritePrologueUsingAI()
        {
            const result = await Dialogs.TextEdit("Prologue", this.previousCreateProloguePrompt, "Write where the story should start off.");
            if (!result) return;
            this.previousCreateProloguePrompt = result;

            App.beginThinking();

            try
            {
                this.prologueContainer.clearChildren();
                const world = this.export();
                const prologue = await AI.Client.writePrologue(result, world);

                const prologueElement = new PrologueElement();
                prologueElement.classList.add("prologue");
                prologueElement.location = prologue.location;
                prologueElement.time = prologue.time;
                prologueElement.text = prologue.plot;
                prologueElement.internal = prologue.internal;
                this.prologueContainer.appendChild(prologueElement); HTMLButtonElement;
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            App.stopThinking();
        }

        private async onDeleteWorld()
        {
            this.clearWorld();
        }

        public async startStory()
        {
            Views.navigate("Story");
            Views.storyElement.startStory(this.export());
        }

        public async save()
        {
            const world = this.export();

            DownloadHelper.downloadData(world.title + ".json", world);
        }

        public async open()
        {
            const result = await UI.Dialog.upload({ multiple: false, title: "Upload your world", accept: "application/json,text/json,.json" });
            if (result.length > 0)
            {
                const file = result.item(0);
                const text = await file.text();
                const world = JSON.parse(text);
                this.import(world);
            }
            this.tabControl.select("World");
        }

        public clearWorld(): void
        {
            this.import({ title: "", cover: "", "author-style": "", scenario: "", rules: "", player: { name: "", portrait: "", appearance: "", personality: "", traits: "", background: "" } });
        }

        public export(): Data.World
        {
            const world: Data.World = {
                "title": this.titleInput.value.trim(),
                "cover": this.coverImage.getAttribute("src"),
                "author-style": this.authorStyleInput.value.trim().trimRight("."),
                "scenario": this.scenarioInput.value.trim().trimRight("."),
                "rules": this.rulesInput.value.trim().trimRight("."),
                "player": this.playerCharacterCard.export(),
            };

            if (this.tagsInput.checkedOptions.length > 0)
                world.tags = this.tagsInput.checkedOptions.map(x => x.value);

            const stats = this.stats;
            if (stats && stats.length > 0)
                world.stats = stats;

            const npcs = [];
            for (const npcCard of this.npcCardList.querySelectorAll("my-character-card") as NodeListOf<CharacterCardElement>)
                npcs.push(npcCard.export());
            if (npcs.length > 0) world.npcs = npcs;

            const prologueElement = this.prologueContainer.querySelector("my-prologue") as PrologueElement;
            if (prologueElement)
            {
                const prologue: Data.Prologue = prologueElement.export();
                world.prologue = prologue;
            }

            return world;
        }

        public import(world: Data.World)
        {
            this.npcCardList.clearChildren();

            this.titleInput.value = world.title;
            world.cover ? this.coverImage.setAttribute("src", world.cover) : this.coverImage.removeAttribute("src");
            this.authorStyleInput.value = world["author-style"];
            this.scenarioInput.value = world.scenario;
            this.rulesInput.value = world.rules;

            if (world.tags)
                this.tagsInput.checkedOptions = world.tags.map(x => this.tagsInput.options.first(t => t.value == x));

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
            playerCard.import(world.player);
            this.playerCharacterCard.replaceWith(playerCard);
            this.playerCharacterCard = playerCard;

            this.npcCardList.clearChildren();
            if (world.npcs) for (const npc of world.npcs)
            {
                const npccard = new CharacterCardElement();
                npccard.import(npc);
                this.npcCardList.append(npccard);
            }

            this.prologueContainer.clearChildren();
            if (world.prologue)
            {
                const prologueElement = new PrologueElement();
                prologueElement.import(world.prologue);
                this.prologueContainer.append(prologueElement);
            }
        }
    }

    customElements.define("my-world", WorldElement);
}