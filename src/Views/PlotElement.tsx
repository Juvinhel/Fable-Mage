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
        public userInput: HTMLTextAreaElement;
        public submitButton: HTMLButtonElement;

        private build()
        {
            return <>
                { this.heading = <h1 class="title"></h1> as HTMLHeadingElement }
                { this.plotList = <div class="plot-list" onchildrenchanged={ () => this.refreshTurnCount() } /> as HTMLDivElement }
                <div class="input">
                    { this.userInput = <textarea class="user-input" value="" ontouchend={ TextEditTouch } onkeydown={ (event: KeyboardEvent): void => { if (event.key === "Enter" && !event.shiftKey) this.onSubmit(); } }></textarea> as HTMLTextAreaElement }
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
                plotPointElement.internal = result.internal;
                plotPointElement.scenery = result.scenery;
                this.plotList.appendChild(plotPointElement); HTMLButtonElement;
                //deactivate all inputs
                for (const button of plotPointElement.querySelectorAll("button, input, select, textarea") as NodeListOf<any>)
                    button.disabled = true;
                this.scrollTo({ behavior: "smooth", top: plotPointElement.offsetTop - 4 });

                await Promise.all([
                    this.createAmbientImage(result.scenery.trim().trimRight(".") + ".", plotPointElement),
                    this.offerChoices(plot, plotPointElement, world)]);

                this.userInput.value = "";
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            this.storyElement.stopThinking();
        }

        public async onWritePrologueUsingAI()
        {
            const result = await Dialogs.TextEdit("Prologue", "", "Write where the story should start off.");
            if (!result) return;

            this.storyElement.beginThinking();

            try
            {
                this.storyElement.plotElement.plotList.clearChildren();
                const world = this.storyElement.exportWorld();

                const story = world as Data.Story;
                const prologue = await AI.Client.writePrologue(result, story);

                const plotPointElement = new PlotPointElement();
                plotPointElement.text = prologue.plot;
                plotPointElement.internal = prologue.internal;
                plotPointElement.scenery = prologue.scenery;
                this.plotList.appendChild(plotPointElement); HTMLButtonElement;
                //deactivate all inputs
                for (const button of plotPointElement.querySelectorAll("button, input, select, textarea") as NodeListOf<any>)
                    button.disabled = true;
                this.scrollTo({ behavior: "smooth", top: plotPointElement.offsetTop - 4 });

                await Promise.all([
                    this.createAmbientImage(prologue.scenery.trim().trimRight(".") + ".", plotPointElement),
                    this.offerChoices([], plotPointElement, world)]);

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

        private async offerChoices(plot: Data.Plot, plotPointElement: PlotPointElement, world: Data.World)
        {
            try
            {
                plot = [...plot];
                plot.push(plotPointElement.exportPlotPoint());
                const choices = await AI.Client.offerChoices(plot, world);
                plotPointElement.choices = choices;
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
                const plotPoint: Data.PlotPoint = plotPointElement.exportPlotPoint(includeImagesInPlot);
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
                plotPointElement.importPlotPoint(plotPoint);
                this.plotList.appendChild(plotPointElement);
            }
            if (plotPointElement)
                this.scrollTo({ behavior: "smooth", top: plotPointElement.offsetTop - 4 });
        }
    }

    customElements.define("my-plot", PlotElement);
}