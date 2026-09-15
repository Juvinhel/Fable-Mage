namespace Views.Story
{
    export class StoryElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());
        }

        private tabControl: HTMLTabControl;

        private plotTab: HTMLElement;
        private charactersTab: HTMLDivElement;
        private heading: HTMLHeadingElement;
        private plotList: HTMLDivElement;
        public userInput: HTMLTextAreaElement;
        public submitButton: HTMLButtonElement;

        private playerCharacterCard: World.CharacterCardElement;
        private npcCardList: HTMLElement;

        private summaryElement: HTMLTextAreaElement;

        private build()
        {
            return <>
                { this.tabControl = <tab-control>
                    { this.plotTab = <div class="plot" title="Plot">
                        { this.heading = <h1 class="title"></h1> as HTMLHeadingElement }
                        { this.plotList = <div class="plot-list" onchildrenchanged={ () => this.refreshTurnCount() } /> as HTMLDivElement }
                        <div class="input">
                            { this.userInput = <textarea class="user-input" value="" ontouchend={ TextEditTouch } onkeydown={ (event: KeyboardEvent): void => { if (event.key === "Enter" && !event.shiftKey) this.onSubmit(); } }></textarea> as HTMLTextAreaElement }
                            { this.submitButton = <button class="submit-button" onclick={ () => this.onSubmit() } title="Submit"><color-icon src="img/icons/send.svg" /></button> as HTMLButtonElement }
                            <span class="thinking-indicator"><span>Thinking</span><span class="dots">...</span></span>
                        </div>
                        <div class="fly-out" />
                    </div> as HTMLElement }
                    { this.charactersTab = <div class="characters" title="Characters">
                        <div>
                            <div >
                                <label>Player:</label>
                                { this.playerCharacterCard = new World.CharacterCardElement() }
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
                    </div> as HTMLDivElement }
                    <div class="summary" title="Summary">
                        <div>
                            <label>Summary</label>
                            { this.summaryElement = <textarea></textarea> as HTMLTextAreaElement }
                        </div>

                        <div class="anchor" />

                        <div />
                    </div>
                    <div class="save-load" title="Save / Load">
                        <div />

                        <div class="anchor" />

                        <div>
                            <button onclick={ () => this.open() }><span>Load Savegame</span></button>
                            <button onclick={ () => this.save() }><span>Save Savegame</span></button>
                        </div>
                    </div>
                </tab-control> as HTMLTabControl }
            </>;
        }

        private world: Data.World;

        private refreshTurnCount()
        {
            let i = 0;
            for (const plotPointElement of this.plotList.querySelectorAll("my-plot-point") as NodeListOf<PlotPointElement>)
                plotPointElement.turn = ++i;
        }

        private async onAddNPC()
        {
            const npccard = new World.CharacterCardElement();
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

                const npccard = new World.CharacterCardElement();
                npccard.import(npc);
                this.npcCardList.appendChild(npccard);

                this.createPortrait(npc, npccard);
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            App.stopThinking();
        }

        private async createPortrait(character: Data.Character, characterCardElement: World.CharacterCardElement)
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

        private summaryInterval = 3;
        private async onSubmit()
        {
            if (this.submitButton.disabled) return;

            App.beginThinking();

            try
            {
                const input = this.userInput.value.trim();
                const story = this.export();
                story.player = this.calculateCharacter(story.player.name);
                for (let i = 0; i < story.npcs.length; ++i) story.npcs[i] = this.calculateCharacter(story.npcs[i].name);

                const plot = story.plot;
                let plotPointsToSubmit = story.plot.length % this.summaryInterval;
                if (!plotPointsToSubmit) plotPointsToSubmit = this.summaryInterval;

                const result = await AI.Client.advancePlot(input, this.summaryElement.value, story.plot.slice((this.summaryInterval + plotPointsToSubmit) * -1), this.world);

                const plotPointElement = new PlotPointElement();
                plotPointElement.input = input;
                plotPointElement.location = result.location;
                plotPointElement.time = result.time;
                plotPointElement.text = result.plot;
                plotPointElement.internal = result.internal;
                plotPointElement.scenery = "generating image ...";
                this.plotList.appendChild(plotPointElement); HTMLButtonElement;
                //deactivate all inputs
                for (const button of plotPointElement.querySelectorAll("button, input, select, textarea, img") as NodeListOf<any>)
                    button.disabled = true;
                this.tabControl.select("Plot");
                this.plotTab.scrollTo({ behavior: "smooth", top: plotPointElement.offsetTop - 4 });

                await Promise.all([
                    this.updateSummary(),
                    this.updatePlayer(plotPointElement),
                    this.createAmbientImage(plotPointElement.text, this.world, plotPointElement),
                    this.offerChoices(plot, plotPointElement, this.world)]);

                this.userInput.value = "";
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            App.stopThinking();
        }

        private async createAmbientImage(scene: string, world: Data.World, plotPointElement: PlotPointElement)
        {
            try
            {
                const prompt = await AI.Client.describeScene(scene, world);
                plotPointElement.scenery = prompt;
                const image = await AI.Client.getImage(prompt);
                plotPointElement.image = image;
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        private async offerChoices(plot: Data.Plot, plotPointElement: PlotPointElement, world: Data.World)
        {
            try
            {
                plot = [...plot];
                plot.push(plotPointElement.export());
                const choices = await AI.Client.offerChoices(plot, world);
                plotPointElement.choices = choices;
                // deactivate all inputs
                for (const button of plotPointElement.querySelectorAll("button, input, select, textarea") as NodeListOf<any>)
                    button.disabled = true;
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        private async updateSummary()
        {
            const plotPointElements = [...this.querySelectorAll("my-plot-point") as NodeListOf<PlotPointElement>];

            const lastSummaryIndex = plotPointElements.findLastIndex(x => !!x.summary);
            const plotPointElementsSinceLastSummary = plotPointElements.slice(lastSummaryIndex >= 0 ? lastSummaryIndex : 0);

            const createSummary = plotPointElementsSinceLastSummary.length >= 2 * this.summaryInterval;
            if (createSummary)
            {
                const turnsToSummarize = plotPointElementsSinceLastSummary.slice(0, -1 * this.summaryInterval);

                this.summaryElement.value =
                    turnsToSummarize.last().summary = await AI.Client.summarizeProgression(plotPointElements[lastSummaryIndex]?.summary ?? "", turnsToSummarize.map(x => x.export()), this.world);
            }
        }

        private calculateCharacter(name: string): Data.Character
        {
            let character = this.world.player.name == name ? this.world.player : this.world.npcs?.first(x => x.name == name);
            if (!character) return;
            character = JSON.clone(character);
            for (const plotPointElement of this.querySelectorAll("my-plot-point") as NodeListOf<PlotPointElement>)
            {
                let diff: Partial<Data.Character>;
                if (plotPointElement.playerChanges?.name == name)
                    diff = plotPointElement.playerChanges;
                if (plotPointElement.npcChanges)
                    for (const npc of plotPointElement.npcChanges)
                        if (npc.name == name)
                            diff = npc;

                if (diff) for (const [key, value] of Object.entries(diff))
                    if (key != "name")
                        character[key] = "name";
            }
            return character;
        }

        private async updatePlayer(plotPointElement: PlotPointElement)
        {
            const player = this.world.player;
            const character = await AI.Client.updateCharacter(player, this.world, [plotPointElement.export()]);
            if (Object.entries(character).length > 1)
                plotPointElement.playerChanges = character;
        }

        private async archiveMemory(turn: number, plotPoint: Data.PlotPoint)
        {
            try
            {
                const memories = await AI.Client.archiveMemory(plotPoint) as Data.Memory[];
                for (const memory of memories)
                {
                    memory.turn = turn;
                    memory.location = plotPoint.location;
                    memory.time = plotPoint.time;
                }

                console.log("memories: ", memories);
                for (const memory of memories)
                {
                    const output = await App.extractor(memory.content, {
                        pooling: 'mean',
                        normalize: true,
                    });
                    const vectorEmbedding = Array.from(output.data);
                    const record = {
                        id: `memory_${ Date.now() }`,
                        vector: vectorEmbedding, // This is your array of floats (e.g., [0.023, -0.045, ...])
                        metadata: memory
                    };
                    console.log("record", record);
                }
            }
            catch { }
        }

        public async startStory(world: Data.World)
        {
            this.world = world;

            this.plotList.clearChildren();
            this.heading.textContent = world.title;

            const stats = world.stats?.map(x => x.name) ?? [];

            const playerCard = new World.CharacterCardElement();
            playerCard.additionalProperties = stats;
            playerCard.import(world.player);
            this.playerCharacterCard.replaceWith(playerCard);
            this.playerCharacterCard = playerCard;

            this.npcCardList.clearChildren();
            if (world.npcs) for (const npc of world.npcs)
            {
                const npccard = new World.CharacterCardElement();
                npccard.additionalProperties = stats;
                npccard.import(npc);
                this.npcCardList.append(npccard);
            }

            if (world.prologue)
            {
                const plotPointElement = new PlotPointElement();
                plotPointElement.import(world.prologue);
                this.plotList.append(plotPointElement);
            }
        }

        public export(): Data.Story
        {
            const story = JSON.clone(this.world) as Data.Story;
            story.player = this.playerCharacterCard.export();
            story.npcs = [];
            for (const npcCard of this.npcCardList.querySelectorAll("my-character-card") as NodeListOf<World.CharacterCardElement>)
                story.npcs.push(npcCard.export());

            const plot: Data.Plot = [];
            for (const plotPointElement of this.plotList.querySelectorAll(":scope > my-plot-point") as NodeListOf<PlotPointElement>)
            {
                const plotPoint: Data.PlotPoint = plotPointElement.export();
                plot.push(plotPoint);
            }
            story.plot = plot;

            return story;
        }

        public import(story: Data.Story)
        {
            const world = JSON.clone(story);
            delete world.plot;

            // world
            this.heading.textContent = world.title;

            const stats = world.stats?.map(x => x.name) ?? [];

            const playerCard = new World.CharacterCardElement();
            playerCard.additionalProperties = stats;
            playerCard.import(world.player);
            this.playerCharacterCard.replaceWith(playerCard);
            this.playerCharacterCard = playerCard;

            this.npcCardList.clearChildren();
            if (world.npcs) for (const npc of world.npcs)
            {
                const npccard = new World.CharacterCardElement();
                npccard.import(npc);
                this.npcCardList.append(npccard);
            }
            this.world = world;

            // plot
            this.plotList.clearChildren();
            for (const plotPoint of story.plot)
            {
                const plotPointElement = new PlotPointElement();
                plotPointElement.import(plotPoint);
                this.plotList.appendChild(plotPointElement);
            }
        }

        public async save()
        {
            const story = this.export();

            DownloadHelper.downloadData(story.title + " - Turn: " + story.plot.length + ".json", story);
        }

        public async open()
        {
            const result = await UI.Dialog.upload({ multiple: false, title: "Upload your story", accept: "application/json,text/json,.json" });
            if (result.length > 0)
            {
                const file = result.item(0);
                const text = await file.text();
                const story = JSON.parse(text);
                this.import(story);
            }
            this.tabControl.select("Plot");

            await delay(50); // or scroll wont work
            if (this.plotList.children.length)
                this.plotTab.scrollTo({ behavior: "smooth", top: (this.plotList.querySelector("my-plot-point:last-child") as HTMLElement).offsetTop - 4 });
        }
    }

    customElements.define("my-story", StoryElement);
}