namespace Views
{
    export class StoryElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());
        }

        private heading: HTMLHeadingElement;
        private plotList: HTMLDivElement;
        private userInput: HTMLTextAreaElement;
        private submitButton: HTMLButtonElement;
        private thinkingIndicator: HTMLSpanElement;

        private worldElement: WorldElement;
        private importExportElement: ImportExportElement;
        private settingsElement: SettingsElement;

        private build()
        {
            return <tab-control>
                <div title="Plot" class="plot-tab">
                    { this.heading = <h1 class="title"></h1> as HTMLHeadingElement }
                    { this.plotList = <div class="plot-list" /> as HTMLDivElement }
                    <div class="prompt">
                        { this.userInput = <textarea class="user-input" value=""></textarea> as HTMLTextAreaElement }
                        { this.submitButton = <button class="submit-button" onclick={ () => this.onSubmit() }>Submit</button> as HTMLButtonElement }
                        { this.thinkingIndicator = <span class="thinking-indicator"><span>Thinking</span><span class="dots">...</span></span> as HTMLSpanElement }
                    </div>
                </div>
                { this.worldElement = new WorldElement() }
                { this.importExportElement = new ImportExportElement() }
                { this.settingsElement = new SettingsElement() }
            </tab-control>;
        }

        private async onSubmit()
        {
            if (this.submitButton.disabled) return;

            this.submitButton.disabled = true;
            this.userInput.disabled = true;
            this.thinkingIndicator.classList.toggle("show", true);

            try
            {
                const input = this.userInput.value.trim();

                const previous_plot: string[] = [];
                for (const plotPoint of this.plotList.querySelectorAll("my-plot-point") as NodeListOf<PlotPointElement>)
                    previous_plot.push(plotPoint.text);

                const world = this.exportStory();
                const result = await API.AI.getPlot(input, previous_plot, world);

                const plotPointElement = new PlotPointElement();
                plotPointElement.text = result.plot;
                this.plotList.appendChild(plotPointElement);

                this.userInput.value = "";
                this.submitButton.disabled = false;
                this.userInput.disabled = false;
                this.thinkingIndicator.classList.toggle("show", false);

                await this.createAmbientImage(result.image.trim().trimRight(".") + ".", plotPointElement);
            }
            catch (error)
            {
                this.submitButton.disabled = false;
                this.userInput.disabled = false;
                this.thinkingIndicator.classList.toggle("show", false);

                UI.Dialog.error(error);
            }
        }

        private async createAmbientImage(prompt: string, plotPointElement: PlotPointElement)
        {
            try
            {
                const base64 = await API.AI.getImage(prompt);
                plotPointElement.image = base64;
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        public exportStory(includePlot = false, includeImagesInPlot = false): Data.Story
        {
            const story: Data.Story = this.worldElement.exportWorld();

            const plot: Data.Plot = [];
            if (includePlot)
            {
                for (const plotPointElement of this.plotList.querySelectorAll(":scope > my-plot-point") as NodeListOf<PlotPointElement>)
                {
                    const plotPoint: Data.PlotPoint = { text: plotPointElement.text };
                    if (includeImagesInPlot)
                        plotPoint.image = plotPointElement.image;
                    plot.push(plotPoint);
                }
            }
            if (plot.length > 0) story.plot = plot;

            return story;
        }

        public importStory(data: Data.Story)
        {
            this.worldElement.importWorld(data);
            this.heading.textContent = data.title;

            this.plotList.clearChildren();
            if (data.plot)
                for (const plotPoint of data.plot)
                {
                    const plotPointElement = new PlotPointElement();
                    plotPointElement.text = plotPoint.text;
                    plotPointElement.image = plotPoint.image;
                    this.plotList.appendChild(plotPointElement);
                }
        }
    }

    customElements.define("my-story", StoryElement);
}