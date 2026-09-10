namespace Views
{
    export class PlotElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.title = "Plot";
            this.append(this.build());
        }

        private storyElement: StoryElement;

        private heading: HTMLHeadingElement;
        private plotList: HTMLDivElement;
        private userInput: HTMLTextAreaElement;
        private submitButton: HTMLButtonElement;

        private build()
        {
            return <>
                { this.heading = <h1 class="title"></h1> as HTMLHeadingElement }
                { this.plotList = <div class="plot-list" onchildrenchanged={ () => this.refreshTurnCount() } /> as HTMLDivElement }
                <div class="input">
                    { this.userInput = <textarea class="user-input" value="" ontouchend={ TextEditTouch }></textarea> as HTMLTextAreaElement }
                    { this.submitButton = <button class="submit-button" onclick={ () => this.onSubmit() } title="Submit"><color-icon src="img/icons/send.svg" /></button> as HTMLButtonElement }
                    <span class="thinking-indicator"><span>Thinking</span><span class="dots">...</span></span>
                </div>
            </>;
        }

        private connectedCallback()
        {
            this.storyElement = this.closest("my-story");
        }

        private refreshTurnCount()
        {
            let i = 0;
            for (const plotPointElement of this.plotList.querySelectorAll("my-plot-point") as NodeListOf<PlotPointElement>)
                plotPointElement.turn = ++i;
        }

        private async onSubmit()
        {
            if (this.submitButton.disabled) return;

            this.storyElement.beginThinking();

            try
            {
                const input = this.userInput.value.trim();
                const plot = this.exportPlot(false);
                const world = this.storyElement.exportStory();
                const result = await AI.Client.getPlot(input, plot, world);

                const plotPointElement = new PlotPointElement();
                plotPointElement.input = input;
                plotPointElement.text = result.plot;
                plotPointElement.unrevealed = result.unrevealed;
                plotPointElement.scenery = result.scenery;
                this.plotList.appendChild(plotPointElement); HTMLButtonElement;
                //deactivate all inputs
                for (const button of plotPointElement.querySelectorAll("button, input, select, textarea") as NodeListOf<any>)
                    button.disabled = true;
                this.scrollTo({ behavior: "smooth", top: plotPointElement.offsetTop - 4 });

                await this.createAmbientImage(result.scenery.trim().trimRight(".") + ".", plotPointElement);

                this.userInput.value = "";
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            this.storyElement.stopThinking();
        }

        private async createAmbientImage(prompt: string, plotPointElement: PlotPointElement)
        {
            try
            {
                const image = await AI.Client.getImage(prompt);
                plotPointElement.image = image;
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        public exportPlot(includeImagesInPlot = false): Data.Plot
        {
            const plot: Data.Plot = [];

            for (const plotPointElement of this.plotList.querySelectorAll(":scope > my-plot-point") as NodeListOf<PlotPointElement>)
            {
                const plotPoint: Data.PlotPoint = { text: plotPointElement.text };
                if (plotPointElement.input) plotPoint.input = plotPointElement.input;
                if (plotPointElement.unrevealed) plotPoint.unrevealed = plotPointElement.unrevealed;
                if (plotPointElement.scenery) plotPoint.scenery = plotPointElement.scenery;
                if (includeImagesInPlot && plotPointElement.image) plotPoint.image = plotPointElement.image;
                plot.push(plotPoint);
            }

            return plot;
        }

        public importPlot(plot: Data.Plot)
        {
            this.plotList.clearChildren();
            let plotPointElement: PlotPointElement;
            for (const plotPoint of plot)
            {
                plotPointElement = new PlotPointElement();
                plotPointElement.input = plotPoint.input;
                plotPointElement.text = plotPoint.text;
                plotPointElement.unrevealed = plotPoint.unrevealed;
                plotPointElement.scenery = plotPoint.scenery;
                plotPointElement.image = plotPoint.image;
                this.plotList.appendChild(plotPointElement);
            }
            if (plotPointElement)
                this.scrollTo({ behavior: "smooth", top: plotPointElement.offsetTop - 4 });
        }
    }

    customElements.define("my-plot", PlotElement);
}