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
        public userInput: HTMLAutoCorrectTextArea;
        public submitButton: HTMLButtonElement;
        private statsFlyOut: StatsFlyOutElement;

        private contextElement: HTMLTextAreaElement;
        private summaryElement: HTMLTextAreaElement;

        private build()
        {
            return <>
                { this.tabControl = <tab-control>
                    { this.plotTab = <div class="plot-tab" tab-header="Plot">
                        { this.heading = <h1 class="title" /> as HTMLHeadingElement }
                        { this.plotList = <div class="plot-list" onchildrenchanged={ () => this.refreshTurnCount() } /> as HTMLDivElement }
                        <div class="input"
                            // fix for bottom-anchor not working
                            onsizechanged={ (e: UI.Events.SizeChangedEvent) => { this.statsFlyOut.style.bottom = e.newSize.height + "px"; } }>
                            { this.userInput = <auto-correct-text-area
                                class="user-input"
                                lang="en-US"
                                ontouchend={ TextEditTouch }
                                onkeydown={ (e: KeyboardEvent) => { if (e.key == "Enter" && !e.shiftKey) { e.preventDefault(); this.onSubmit(); } } }
                                placeholder="Write what your character should do. Use [Square Brackets] for Game Master instructions." /> as HTMLAutoCorrectTextArea }
                            { this.submitButton = <button class="submit-button" onclick={ () => this.onSubmit() } title="Submit"><color-icon src="img/icons/send.svg" /></button> as HTMLButtonElement }
                            <span class="thinking-indicator"><span>Thinking</span><span class="dots">...</span></span>
                        </div>
                        <button class="fly-out-toggle icon-button" onclick={ () => this.statsFlyOut.classList.toggle("maximized") }><color-icon src="img/icons/stat.svg" /></button>
                        { this.statsFlyOut = new StatsFlyOutElement() }
                    </div> as HTMLElement }
                    <div class="context-tab" tab-header="Context">
                        <div>
                            <label>Context</label>
                            { this.contextElement = <textarea /> as HTMLTextAreaElement }
                        </div>

                        <div class="anchor" />

                        <div /></div>
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

        private scenario: string;
        private rules: string;
        private stats?: Data.Stat[];
        private get player(): Data.Character { return this.statsFlyOut.characters[0]; }
        private get npcs(): Data.Character[] { return this.statsFlyOut.characters.slice(1); }

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

            const nextPlotElement = returnalElement.nextElementSibling as PlotPointElement;

            const input = nextPlotElement?.input;
            const context = nextPlotElement?.context ?? returnalElement.context;
            const characters = [nextPlotElement.player, ...(nextPlotElement.npcs ?? [])];

            let remove = false;
            for (const plotPointElement of this.querySelectorAll("my-plot-point") as NodeListOf<PlotPointElement>)
            {
                if (plotPointElement == returnalElement) { remove = true; continue; }
                if (remove) plotPointElement.remove();
            }

            this.userInput.value = input ?? "";
            this.contextElement.value = context ?? "";
            this.statsFlyOut.characters = characters;
        }

        private summaryInterval = 3;
        private async onSubmit()
        {
            App.beginThinking();

            try
            {
                const input = this.userInput.value.trim();
                const story = this.export();

                const plot = story.plot;
                let plotPointsToSubmit = plot.length % this.summaryInterval;
                if (!plotPointsToSubmit) plotPointsToSubmit = this.summaryInterval;

                const result = await AI.Client.advancePlot(
                    input,
                    this.summaryElement.value.trim(),
                    this.contextElement.value.trim(),
                    plot.slice((this.summaryInterval + plotPointsToSubmit) * -1),
                    story,
                    this.player,
                    this.npcs);

                const plotPointElement = new PlotPointElement();
                plotPointElement.input = input;
                plotPointElement.location = result.location;
                plotPointElement.time = result.time;
                plotPointElement.text = result.plot;
                plotPointElement.internal = result.internal;
                plotPointElement.scenery = "generating image ...";
                plotPointElement.context = this.contextElement.value.trim() ? this.contextElement.value : null;
                this.plotList.appendChild(plotPointElement); HTMLButtonElement;

                this.tabControl.select("Plot");
                this.plotTab.scrollTo({ behavior: "smooth", top: plotPointElement.offsetTop - 4 });

                await Promise.all([
                    this.updateSummary(story),
                    this.updateCharacters(story, plotPointElement),
                    this.createAmbientImage(plotPointElement.text, plotPointElement),
                    this.offerChoices(plot, plotPointElement, story)]);

                this.userInput.value = "";
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            App.stopThinking();
        }

        private async createAmbientImage(scene: string, plotPointElement: PlotPointElement)
        {
            try
            {
                const prompt = await AI.Client.describeScene(scene, this.player, this.npcs);
                plotPointElement.scenery = prompt;
                const image = await AI.Client.getImage(prompt);
                plotPointElement.image = image;
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        private async offerChoices(plot: Data.Plot, plotPointElement: PlotPointElement, story: Data.Story)
        {
            try
            {
                plot = [...plot];
                plot.push(plotPointElement.export());
                const choices = await AI.Client.offerChoices(
                    plot,
                    this.contextElement.value.trim(),
                    story,
                    this.player);
                plotPointElement.choices = choices;
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        private async updateSummary(story: Data.Story)
        {
            const plotPointElements = [...this.querySelectorAll("my-plot-point") as NodeListOf<PlotPointElement>];

            const lastSummaryIndex = plotPointElements.findLastIndex(x => !!x.summary);
            const plotPointElementsSinceLastSummary = plotPointElements.slice(lastSummaryIndex >= 0 ? lastSummaryIndex : 0);

            const createSummary = plotPointElementsSinceLastSummary.length >= 2 * this.summaryInterval;
            if (createSummary)
            {
                const turnsToSummarize = plotPointElementsSinceLastSummary.slice(0, -1 * this.summaryInterval);

                this.summaryElement.value =
                    turnsToSummarize.last().summary = await AI.Client.summarizeProgression(plotPointElements[lastSummaryIndex]?.summary ?? "", turnsToSummarize.map(x => x.export()), story);
            }
        }

        private async updateCharacters(story: Data.Story, plotPointElement: PlotPointElement)
        {
            const characters = this.statsFlyOut.characters;

            {   // update player
                const player = this.player;
                const characterUpdate = await AI.Client.updateCharacter(player, story, true, [plotPointElement.export()]);

                for (const [key, value] of Object.entries(characterUpdate))
                    if (value)
                    {
                        // new properties are not allowed
                        if (!(key in player)) { UI.Dialog.error({ title: "AI Error", text: "AI introduced new character property (" + key + ": \"" + value + "\")!" }); continue; }
                        player[key] = value;
                    }

                plotPointElement.player = player;
            }

            {
                //TODO: implement npc updates
                plotPointElement.npcs = this.npcs;
                if (plotPointElement.npcs.length == 0) plotPointElement.npcs = null;
            }

            this.statsFlyOut.characters = characters;
        }

        public async startStory(world: Data.World)
        {
            this.heading.textContent = world.title;
            this.scenario = world.scenario;
            this.rules = world.rules;
            this.stats = world.stats;

            if (world.prologue)
            {
                const plotPoint = JSON.clone(world.prologue) as Data.PlotPoint;
                plotPoint.player = JSON.clone(world.player);
                plotPoint.npcs = JSON.clone(world.npcs);
                const plotPointElement = new PlotPointElement();
                plotPointElement.import(plotPoint);
                this.plotList.appendChild(plotPointElement);
            }

            this.statsFlyOut.reset();
            this.statsFlyOut.characters = [world.player, ...(world.npcs ?? [])];
        }

        public export(): Data.Story
        {
            const story = {} as Data.Story;
            story.title = this.heading.textContent;
            story.scenario = this.scenario;
            story.rules = this.rules;
            story.stats = this.stats;

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
            // world
            this.heading.textContent = story.title;
            this.scenario = story.scenario;
            this.rules = story.rules;
            this.stats = story.stats;

            // plot
            this.plotList.clearChildren();
            let plotPointElement: PlotPointElement;
            for (const plotPoint of story.plot)
            {
                plotPointElement = new PlotPointElement();
                plotPointElement.import(plotPoint);
                this.plotList.appendChild(plotPointElement);
            }
            this.contextElement.value = plotPointElement?.context ?? "";

            this.statsFlyOut.reset();
            this.statsFlyOut.characters = [plotPointElement.player, ...(plotPointElement.npcs ?? [])];
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