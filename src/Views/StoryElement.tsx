namespace Views
{
    export class StoryElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());
        }

        private plotElement: PlotElement;
        private worldElement: WorldElement;
        private importExportElement: ImportExportElement;
        private settingsElement: SettingsElement;

        private build()
        {
            return <tab-control>
                { this.plotElement = new PlotElement() }
                { this.worldElement = new WorldElement() }
                { this.importExportElement = new ImportExportElement() }
                { this.settingsElement = new SettingsElement() }
            </tab-control>;
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
    }

    customElements.define("my-story", StoryElement);
}