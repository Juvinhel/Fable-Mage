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
        private thinkingIndicator: HTMLSpanElement;

        private build()
        {
            return <>
                { this.heading = <h1 class="title"></h1> as HTMLHeadingElement }
                { this.plotList = <div class="plot-list" /> as HTMLDivElement }
                <div class="input">
                    { this.userInput = <textarea class="user-input" value=""></textarea> as HTMLTextAreaElement }
                    { this.submitButton = <button class="submit-button" onclick={ () => this.onSubmit() }>Submit</button> as HTMLButtonElement }
                    { this.thinkingIndicator = <span class="thinking-indicator"><span>Thinking</span><span class="dots">...</span></span> as HTMLSpanElement }
                </div>
            </>;
        }

        private connectedCallback()
        {
            this.storyElement = this.closest("my-story");
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

                const world = this.storyElement.exportStory();
                const result = await AI.Client.getPlot(input, previous_plot, world);

                const plotPointElement = new PlotPointElement();
                plotPointElement.text = result.plot;
                plotPointElement.input = input;
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
                const base64 = await AI.Client.getImage(prompt);
                plotPointElement.image = base64;
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
                if (includeImagesInPlot) plotPoint.image = plotPointElement.image;
                plot.push(plotPoint);
            }

            return plot;
        }

        public importPlot(plot: Data.Plot)
        {
            this.plotList.clearChildren();
            for (const plotPoint of plot)
            {
                const plotPointElement = new PlotPointElement();
                plotPointElement.text = plotPoint.text;
                plotPointElement.image = plotPoint.image;
                plotPointElement.input = plotPoint.input;
                this.plotList.appendChild(plotPointElement);
            }
        }
    }

    customElements.define("my-plot", PlotElement);
}