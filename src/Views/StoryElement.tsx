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
        public plotElement: PlotElement;
        private worldElement: WorldElement;
        private importExportElement: ImportExportElement;
        private settingsElement: SettingsElement;

        private build()
        {
            return this.tabControl = <tab-control>
                { this.plotElement = new PlotElement() }
                { this.worldElement = new WorldElement() }
                { this.importExportElement = new ImportExportElement() }
                { this.settingsElement = new SettingsElement() }
            </tab-control> as HTMLTabControl;
        }

        public init()
        {
            this.settingsElement.save();
        }

        public selectTab(tab: "Plot" | "World" | "Import / Export" | "Settings")
        {
            this.tabControl.select(tab);
        }

        public exportStory(includePlot = false, includeImagesInPlot = false): Data.Story
        {
            const story: Data.Story = this.worldElement.exportWorld();

            if (includePlot)
            {
                const plot: Data.Plot = this.plotElement.exportPlot(includeImagesInPlot);
                if (plot.length > 0) story.plot = plot;
            }

            return story;
        }

        public importStory(story: Data.Story)
        {
            this.importWorld(story);
            this.importPlot(story.plot ?? []);
        }

        public exportPlot(includeImagesInPlot = false): Data.Plot
        {
            return this.plotElement.exportPlot(includeImagesInPlot);
        }

        public importPlot(plot: Data.Plot)
        {
            this.plotElement.importPlot(plot);
        }

        public exportWorld(): Data.World
        {
            return this.worldElement.exportWorld();
        }

        public importWorld(world: Data.World)
        {
            this.worldElement.importWorld(world);

            const titleHeading = this.querySelector(".title") as HTMLHeadingElement;
            titleHeading.textContent = world.title;
        }

        public beginThinking()
        {
            for (const indicator of this.querySelectorAll(".thinking-indicator"))
                indicator.classList.toggle("show", true);
            for (const button of this.querySelectorAll("button, input, select, textarea, combo-select") as NodeListOf<any>)
                button.disabled = true;
        }

        public stopThinking()
        {
            for (const indicator of this.querySelectorAll(".thinking-indicator"))
                indicator.classList.toggle("show", false);
            for (const button of this.querySelectorAll("button, input, select, textarea, combo-select") as NodeListOf<any>)
                button.disabled = false;
        }
    }

    customElements.define("my-story", StoryElement);
}