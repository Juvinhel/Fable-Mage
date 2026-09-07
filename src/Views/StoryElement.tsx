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

        public importStory(data: Data.Story)
        {
            this.worldElement.importWorld(data);
            this.plotElement.importPlot(data.plot ?? []);

            const titleHeading = this.querySelector(".title") as HTMLHeadingElement;
            titleHeading.textContent = data.title;
        }
    }

    customElements.define("my-story", StoryElement);
}