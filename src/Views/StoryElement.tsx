namespace Views
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
        private heading: HTMLHeadingElement;
        private plotList: HTMLDivElement;
        public userInput: HTMLTextAreaElement;
        public submitButton: HTMLButtonElement;

        private playerCharacterCard: CharacterCardElement;
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
                    </div> as HTMLElement }
                    <div class="characters" title="Characters">
                        <div>
                            <div >
                                <label>Player:</label>
                                { this.playerCharacterCard = new CharacterCardElement() }
                            </div>

                            <div>
                                <label>NPCs:</label>
                                { this.npcCardList = <div class="npc-list" /> as HTMLElement }
                            </div>
                        </div>

                        <div class="anchor" />

                        <div />
                    </div>
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

        private summaryInterval = 5;
        private async onSubmit()
        {
            if (this.submitButton.disabled) return;

            App.beginThinking();

            try
            {
                const input = this.userInput.value.trim();
                const story = this.export();
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
                this.plotList.appendChild(plotPointElement); HTMLButtonElement;
                //deactivate all inputs
                for (const button of plotPointElement.querySelectorAll("button, input, select, textarea") as NodeListOf<any>)
                    button.disabled = true;
                this.tabControl.select("Plot");
                this.plotTab.scrollTo({ behavior: "smooth", top: plotPointElement.offsetTop - 4 });

                await Promise.all([
                    this.updateSummary(),
                    this.updatePlayer(plotPointElement.export()),
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
            console.log("i", lastSummaryIndex);
            const plotPointElementsSinceLastSummary = plotPointElements.slice(lastSummaryIndex >= 0 ? lastSummaryIndex : 0);
            console.log("pp", plotPointElementsSinceLastSummary);

            const createSummary = plotPointElementsSinceLastSummary.length >= 2 * this.summaryInterval;
            if (createSummary)
            {
                const turnsToSummarize = plotPointElementsSinceLastSummary.slice(0, -1 * this.summaryInterval);
                console.log("SUMMARY:", turnsToSummarize);

                this.summaryElement.value =
                    turnsToSummarize.last().summary = await AI.Client.summarizeProgression(plotPointElements[lastSummaryIndex]?.summary ?? "", turnsToSummarize.map(x => x.export()), this.world);
            }

        }

        private async updatePlayer(plotPoint: Data.PlotPoint)
        {
            const player = this.world.player;
            await AI.Client.updateCharacter(player, this.world, [plotPoint]);
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

            const playerCard = new CharacterCardElement();
            playerCard.additionalProperties = stats;
            playerCard.import(world.player);
            this.playerCharacterCard.replaceWith(playerCard);
            this.playerCharacterCard = playerCard;

            this.npcCardList.clearChildren();
            if (world.npcs) for (const npc of world.npcs)
            {
                const npccard = new CharacterCardElement();
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
            this.world = world;

            // plot
            this.plotList.clearChildren();
            let plotPointElement: PlotPointElement;
            for (const plotPoint of story.plot)
            {
                plotPointElement = new PlotPointElement();
                plotPointElement.import(plotPoint);
                this.plotList.appendChild(plotPointElement);
            }
            if (plotPointElement)
                this.plotTab.scrollTo({ behavior: "smooth", top: plotPointElement.offsetTop - 4 });
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
        }
    }

    customElements.define("my-story", StoryElement);
}