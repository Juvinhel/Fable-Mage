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
        private heading: HTMLHeadingElement;
        private plotList: HTMLDivElement;
        public userInput: HTMLTextAreaElement;
        public submitButton: HTMLButtonElement;
        private statsFlyOut: StatsFlyOutElement;

        private summaryElement: HTMLTextAreaElement;

        private build()
        {
            return <>
                { this.tabControl = <tab-control>
                    { this.plotTab = <div class="plot-tab" tab-header="Plot">
                        { this.heading = <h1 class="title"></h1> as HTMLHeadingElement }
                        { this.plotList = <div class="plot-list" onchildrenchanged={ () => this.refreshTurnCount() } /> as HTMLDivElement }
                        <div class="input"
                            // fix for bottom-anchor not working
                            onsizechanged={ (e: UI.Events.SizeChangedEvent) => { this.statsFlyOut.style.bottom = e.newSize.height + "px"; } }>
                            { this.userInput = <textarea class="user-input" value="" ontouchend={ TextEditTouch } onkeydown={ (event: KeyboardEvent): void => { if (event.key === "Enter" && !event.shiftKey) this.onSubmit(); } }></textarea> as HTMLTextAreaElement }
                            { this.submitButton = <button class="submit-button" onclick={ () => this.onSubmit() } title="Submit"><color-icon src="img/icons/send.svg" /></button> as HTMLButtonElement }
                            <span class="thinking-indicator"><span>Thinking</span><span class="dots">...</span></span>
                        </div>
                        <button class="fly-out-toggle icon-button" onclick={ () => this.statsFlyOut.classList.toggle("maximized") }><color-icon src="img/icons/stat.svg" /></button>
                        { this.statsFlyOut = new StatsFlyOutElement() }
                    </div> as HTMLElement }
                    <div class="summary" tab-header="Summary">
                        <div>
                            <label>Summary</label>
                            { this.summaryElement = <textarea></textarea> as HTMLTextAreaElement }
                        </div>

                        <div class="anchor" />

                        <div />
                    </div>
                    <div class="save-load" tab-header="Save / Load">
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

        public async returnHere(returnalElement: PlotPointElement)
        {
            if (!await UI.Dialog.confirm({ title: "Load from here?", text: "Do you really want to load from this point?\nAll plot-points afterwards will be lost." }))
                return;

            const input = returnalElement.input;
            const plot: Data.Plot = [];
            let remove = false;
            for (const plotPointElement of this.querySelectorAll("my-plot-point") as NodeListOf<PlotPointElement>)
            {
                if (plotPointElement == returnalElement) remove = true;
                if (remove) plotPointElement.remove();
                else plot.push(plotPointElement.export());
            }

            this.userInput.value = input ?? "";

            this.statsFlyOut.updateCharacters(this.calculateCharacter(this.world.player.name), this.world.npcs ?? []);
        }

        private summaryInterval = 3;
        private async onSubmit()
        {
            App.beginThinking();

            try
            {
                const input = this.userInput.value.trim();
                const story = this.export();
                story.player = this.calculateCharacter(story.player.name);
                for (let i = 0; i < story.npcs?.length; ++i) story.npcs[i] = this.calculateCharacter(story.npcs[i].name);

                const plot = story.plot;
                let plotPointsToSubmit = plot.length % this.summaryInterval;
                if (!plotPointsToSubmit) plotPointsToSubmit = this.summaryInterval;

                const result = await AI.Client.advancePlot(input, this.summaryElement.value, plot.slice((this.summaryInterval + plotPointsToSubmit) * -1), this.world);

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
                        character[key] = value;
            }
            return character;
        }

        private async updatePlayer(plotPointElement: PlotPointElement)
        {
            const player = this.world.player;
            const character = await AI.Client.updateCharacter(player, this.world, [plotPointElement.export()]);
            if (Object.entries(character).length > 1)
                plotPointElement.playerChanges = character;

            this.statsFlyOut.updateCharacters(this.calculateCharacter(player.name), this.world.npcs ?? []);
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
            const story = JSON.clone(world) as Data.Story;
            story.plot = [];
            if (story.prologue) story.plot.push(story.prologue);
            this.import(story);
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
            this.world = world;

            // plot
            this.plotList.clearChildren();
            for (const plotPoint of story.plot)
            {
                const plotPointElement = new PlotPointElement();
                plotPointElement.import(plotPoint);
                this.plotList.appendChild(plotPointElement);
            }

            //this.plotTab.append(this.statsFlyOut = new StatsFlyOuttElement());
            this.statsFlyOut.reset();
            this.statsFlyOut.updateCharacters(this.calculateCharacter(world.player.name), this.world.npcs ?? []);
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