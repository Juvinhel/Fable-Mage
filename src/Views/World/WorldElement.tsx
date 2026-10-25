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

        private titleInput: HTMLAutoCorrectTextArea;
        private coverImage: HTMLImageElement;
        private versionInput: UI.Elements.SemanticVersionInput;
        private matureContentInput: HTMLInputElement;
        private descriptionInput: HTMLAutoCorrectTextArea;
        private loreInput: HTMLAutoCorrectTextArea;
        private scenarioInput: HTMLAutoCorrectTextArea;
        private tagsInput: HTMLMultiSelect;
        private statList: HTMLDivElement;
        private playerCharacterCard: CharacterCardElement;
        private npcCardList: HTMLElement;

        private prologueContainer: HTMLDivElement;

        private build()
        {
            return this.tabControl = <tab-control>
                <div id="overview-tab" class="data-view" tab-header={ t("world.overview") }>
                    <div class="property-list">
                        <label>{ t("world.title") }</label>
                        { this.titleInput = <auto-correct-text-area lang="en-US" class="title-input single-line" value="" placeholder={ t("world.titlePlaceholder") } analyze={ AI.Client.analyzeLanguage } /> as HTMLAutoCorrectTextArea }

                        <label>{ t("world.cover") }</label>
                        { this.coverImage = <img class="cover-image" onclick={ () => this.onGenerateCover() } /> as HTMLImageElement }

                        <label>{ t("world.version") }</label>
                        { this.versionInput = <semantic-version-input placeholder="1.0.0" value="1.0" /> as UI.Elements.SemanticVersionInput }

                        <label>{ t("world.matureContent") }</label>
                        { this.matureContentInput = <input type="checkbox" /> as HTMLInputElement }

                        <label>{ t("world.description") }</label>
                        { this.descriptionInput = <auto-correct-text-area lang="en-US" class="description-input large" value="" ontouchend={ TextEditTouch } placeholder={ t("world.descriptionPlaceholder") } analyze={ AI.Client.analyzeLanguage } /> as HTMLAutoCorrectTextArea }

                        <label>{ t("world.tags") }</label>
                        { this.tagsInput = <multi-select options={ Data.knownTags.map(x => ({ title: x.value, value: x.value })) } placeholder={ t("world.tagsPlaceholder") } /> as HTMLMultiSelect }

                    </div>

                    <div class="anchor" />

                    <div class="actions">
                        <button class="create-new-world" title={ t("world.createWithAiTitle") } onclick={ () => this.createWorldUsingAI() }><color-icon src="img/icons/ai.svg" /><span>{ t("world.create") }</span></button>
                        <button class="delete-world" title={ t("world.deleteCurrentTitle") } onclick={ () => this.onDeleteWorld() }><color-icon src="img/icons/delete.svg" /><span>{ t("world.deleteCurrent") }</span></button>
                        <button onclick={ () => this.startStory() }><color-icon src="img/icons/play.svg" /><span>{ t("world.startStory") }</span></button>
                        <button class="upload-world" title={ t("world.uploadToNexusTitle") } onclick={ () => this.uploadToNexus() }><color-icon src="img/icons/upload-to-cloud.svg" /><span>{ t("world.uploadToNexus") }</span></button>
                        <span class="thinking-indicator"><span>{ t("common.thinking") }</span><span class="dots">...</span></span>
                    </div>
                </div>
                <div id="details-tab" class="data-view" tab-header={ t("world.details") }>
                    <div class="property-list">
                        <label>{ t("world.lore") }</label>
                        { this.loreInput = <auto-correct-text-area lang="en-US" class="lore-input large" value="" ontouchend={ TextEditTouch } placeholder={ t("world.lorePlaceholder") } analyze={ AI.Client.analyzeLanguage } /> as HTMLAutoCorrectTextArea }

                        <label>{ t("world.scenario") }</label>
                        { this.scenarioInput = <auto-correct-text-area lang="en-US" class="scenario-input large" value="" ontouchend={ TextEditTouch } placeholder={ t("world.scenarioPlaceholder") } analyze={ AI.Client.analyzeLanguage } /> as HTMLAutoCorrectTextArea }

                        <label>{ t("world.trackedStats") }</label>
                        <div class="functions horizontal">
                            <button class="icon-button add-stat-button" title={ t("world.addStat") } onclick={ () => this.onAddStat() }><color-icon src="img/icons/add.svg" /></button>
                        </div>
                        { this.statList = <div class="stat-list" ontoplevelchildrenchanged={ () => this.onStatsChanged() } onnamechange={ (e: Event) => this.onStatNameChanged(e) } /> as HTMLDivElement }
                    </div>

                    <div class="anchor" />

                    <div class="actions" />
                </div>
                <div id="characters-tab" class="data-view" tab-header={ t("world.characters") }>
                    <div class="property-list">
                        <div ontoplevelchildrenchanged={ (e: Event) => this.onPlayerChanged(e) } >
                            <label>{ t("world.player") }</label>
                            <div class="functions horizontal">
                                <button class="icon-button create-player-using-ai-button" title={ t("world.createPlayerWithAi") } onclick={ () => this.onCreatePlayerUsingAI() }><color-icon src="img/icons/ai.svg" /></button>
                            </div>
                            { this.playerCharacterCard = new CharacterCardElement() }
                        </div>

                        <div>
                            <label>{ t("world.npcs") }</label>
                            <div class="functions horizontal">
                                <button class="icon-button add-npc-button" title={ t("world.createNpc") } onclick={ () => this.onAddNPC() }><color-icon src="img/icons/add.svg" /></button>
                                <button class="icon-button add-npc-using-ai-button" title={ t("world.createNpcWithAi") } onclick={ () => this.onAddNPCUsingAI() }><color-icon src="img/icons/ai.svg" /></button>
                            </div>
                            { this.npcCardList = <div class="npc-list" /> as HTMLElement }
                        </div>
                    </div>

                    <div class="anchor" />

                    <div class="actions" />
                </div>
                <div id="prologue-tab" class="data-view" tab-header={ t("world.prologue") }>
                    { this.prologueContainer = <div>{ new PrologueElement() }</div> as HTMLDivElement }

                    <div class="anchor" />

                    <div class="actions">
                        <button class="write-prologue" title={ t("world.writePrologueTitle") } onclick={ () => this.onWritePrologueUsingAI() }><color-icon src="img/icons/ai.svg" /><span>{ t("world.writePrologue") }</span></button>
                        <span class="thinking-indicator"><span>{ t("common.thinking") }</span><span class="dots">...</span></span>
                    </div>
                </div>
                <div id="import-export-tab" class="data-view" tab-header={ t("world.importExport") }>
                    <div />

                    <div class="anchor" />

                    <div class="actions">
                        <button onclick={ () => this.open() }><color-icon src="img/icons/open.svg" /><span>{ t("world.importJson") }</span></button>
                        <button onclick={ () => this.save() }><color-icon src="img/icons/save.svg" /><span>{ t("world.exportJson") }</span></button>
                        <button onclick={ () => this.openLore() }><color-icon src="img/icons/open.svg" /><span>{ t("world.loadLore") }</span></button>
                        <button onclick={ () => this.saveLore() }><color-icon src="img/icons/save.svg" /><span>{ t("world.saveLore") }</span></button>
                    </div>
                </div>
            </tab-control> as HTMLTabControl;
        }

        private previousGenerateCoverPrompt: string;
        private async onGenerateCover()
        {
            if (this.coverImage.classList.contains("disabled")) return;

            const result = await Dialogs.ImageEdit(this.coverImage.src, this.previousGenerateCoverPrompt, t("dialogs.describeWorldCover"));
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
            const result = await Dialogs.TextEdit(t("world.descriptionOfCharacter"), this.previousCreatePlayerPrompt, t("character.describePlayer"));
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
                const player = await AI.Client.createPlayer(prompt, world, world.npcs);
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
            const result = await Dialogs.TextEdit(t("world.descriptionOfCharacter"), this.previousCreateNPCPrompt, t("character.describeNpc"));
            if (!result) return;
            this.previousCreateNPCPrompt = result;

            App.beginThinking();

            try
            {
                const world = this.export();
                const npc = await AI.Client.createNPC(result, world, world.player, world.npcs);

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
        public async createWorldUsingAI(): Promise<boolean>
        {
            const result = await ScenarioEdit(this.previousCreateWorldPrompt);
            if (!result) return false;
            this.previousCreateWorldPrompt = result.text;

            await this.onDeleteWorld();
            App.beginThinking();

            try
            {
                if (result.lore?.trim())
                    this.loreInput.value = result.lore;
                else
                {
                    const lore = await AI.Client.createLore(result.text);
                    this.loreInput.value = lore;
                }
                this.scenarioInput.value = await AI.Client.createScenario(result.text, this.loreInput.value);
                const [player, ...npcs] = await AI.Client.createCharacters(result.text, this.loreInput.value, this.scenarioInput.value);
                const portraitPromises: Promise<void>[] = [];
                this.playerCharacterCard.import(player);
                portraitPromises.push(this.createPortrait(player, this.playerCharacterCard));
                for (const npc of npcs)
                {
                    const characterCardElement = new CharacterCardElement();
                    this.npcCardList.append(characterCardElement);
                    characterCardElement.import(npc);
                    portraitPromises.push(this.createPortrait(npc, characterCardElement));
                }

                await Promise.all([
                    ...portraitPromises,
                    this.createCoverImage(),
                    this.createMetadata(),
                    this.createPrologue("Use this original draft to create a prologue:\n" + result)]);
                App.stopThinking();
                return true;
            }
            catch (error)
            {
                App.stopThinking();
                UI.Dialog.error(error);
                return false;
            }
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

        private async createMetadata()
        {
            try
            {
                const world = this.export();
                const result = await AI.Client.createMetadata(Data.knownTags.map(x => x.value), world);
                this.titleInput.value = result.title;
                this.descriptionInput.value = result.description;
                this.matureContentInput.checked = !!result.mature;
                this.tagsInput.checkedOptions = this.tagsInput.options.filter(x => result.tags.includes(x.value));
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        private async uploadToNexus()
        {
            const nexusAccount = App.config.nexusAccount;
            if (!nexusAccount?.email)
            {
                Views.navigate("Settings");
                UI.Dialog.error(new Error(t("world.loginRequired")));
                return;
            }

            const cover = this.coverImage.getAttribute("src");
            if (!cover?.startsWith("data:"))
            {
                UI.Dialog.error(new Error(t("world.coverRequired")));
                return;
            }

            App.beginThinking();

            const world = this.export();
            const upload: Data.Nexus.WorldUpload = {
                title: world.title,
                description: world.description,
                username: nexusAccount.username,
                userid: nexusAccount.email,
                tags: world.tags ?? [],
                version: world.version ?? "",
                mature: !!world.mature,
                cover: this.dataUriToBlob(cover),
                data: JSON.stringify(world)
            };

            try
            {
                const matchingWorlds = await Data.Nexus.API.findWorldsByTitle(upload.title);
                const accountId = upload.userid.trim().toLocaleLowerCase();
                const ownedWorld = matchingWorlds.find(x => x.userid.trim().toLocaleLowerCase() == accountId);
                if (matchingWorlds.some(x => x.userid.trim().toLocaleLowerCase() != accountId))
                    throw new Error(t("world.duplicateTitle"));

                if (ownedWorld)
                {
                    await Data.Nexus.API.updateWorld(ownedWorld.id, upload);
                    UI.Dialog.message({ title: t("world.updated"), text: t("world.updatedMessage") });
                }
                else
                {
                    await Data.Nexus.API.createWorld(upload);
                    UI.Dialog.message({ title: t("world.uploadSuccess"), text: t("world.uploadedMessage") });
                }
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            App.stopThinking();
        }

        private dataUriToBlob(dataUri: string): Blob
        {
            const [header, data] = dataUri.split(",", 2);
            const mime = header.match(/^data:([^;]+)/)?.[1] ?? "application/octet-stream";
            const binary = atob(data);
            const bytes = new Uint8Array(binary.length);
            for (let index = 0; index < binary.length; index++)
                bytes[index] = binary.charCodeAt(index);
            return new Blob([bytes], { type: mime });
        }

        private previousCreateProloguePrompt;
        private async onWritePrologueUsingAI()
        {
            const result = await Dialogs.TextEdit(t("dialogs.prologue"), this.previousCreateProloguePrompt, t("dialogs.describePrologue"));
            if (!result) return;
            this.previousCreateProloguePrompt = result;

            await this.createPrologue(result);
        }

        private async createPrologue(prompt: string)
        {
            App.beginThinking();

            try
            {
                this.prologueContainer.clearChildren();
                const world = this.export();
                const prologue = await AI.Client.writePrologue(prompt, world);

                const prologueElement = new PrologueElement();
                prologueElement.classList.add("prologue");
                prologueElement.location = prologue.location;
                prologueElement.time = prologue.time;
                prologueElement.text = prologue.plot;
                prologueElement.internal = prologue.internal;
                this.prologueContainer.appendChild(prologueElement); HTMLButtonElement;

                //TODO: better typings
                const plot = [{ text: prologue.plot, location: location, time: prologue.time, internal: prologue.internal }] as unknown as Data.Plot;
                const choices = await AI.Client.offerChoices(plot, "", world as unknown as Data.Story, world.player);
                prologueElement.choices = choices;
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

        public clearWorld(): void
        {
            this.import({ title: "", cover: "", version: "1.0", mature: false, description: "", lore: "", scenario: "", player: { name: "", portrait: "", appearance: "", personality: "", skills: "", background: "" } });
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

        public async saveLore()
        {
            const title = this.titleInput.value.trim() || "lore";
            DownloadHelper.downloadData(title + ".txt", this.loreInput.value);
        }

        public async openLore(): Promise<boolean>
        {
            const result = await UI.Dialog.upload({ multiple: false, title: t("dialogs.uploadLore"), accept: "text/plain,.txt,.md,.text" });
            if (result?.length > 0)
            {
                const file = result.item(0);
                this.loreInput.value = await file.text();
                return true;
            }
            return false;
        }

        public async open(): Promise<boolean>
        {
            const result = await UI.Dialog.upload({ multiple: false, title: t("dialogs.uploadWorld"), accept: "application/json,text/json,.json" });
            if (result?.length > 0)
            {
                const file = result.item(0);
                const text = await file.text();
                const world = JSON.parse(text);
                this.import(world);
                this.tabControl.select("Overview");
                return true;
            }
            return false;
        }

        public export(): Data.World
        {
            const world: Data.World = {
                "title": this.titleInput.value.trim(),
                "cover": this.coverImage.getAttribute("src"),
                "version": this.versionInput.value.trim(),
                "mature": this.matureContentInput.checked,
                "description": this.descriptionInput.value.trim(),
                "lore": this.loreInput.value.trim().trimRight("."),
                "scenario": this.scenarioInput.value.trim().trimRight("."),
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
            this.versionInput.value = world.version ?? "1.0";
            this.matureContentInput.checked = world.mature ?? false;
            this.descriptionInput.value = world.description ?? "";
            this.loreInput.value = world.lore ?? "";
            this.scenarioInput.value = world.scenario ?? "";

            if (world.tags) this.tagsInput.checkedOptions = world.tags.map(x => this.tagsInput.options.first(t => t.value == x));
            else this.tagsInput.checkedOptions = [];

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