namespace Views
{
    export class PlotPointElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());
        }

        private storyElement: StoryElement;
        private plotElement: PlotElement;

        private turnElement: HTMLSpanElement;
        private textElement: HTMLSpanElement;
        private imageElement: HTMLImageElement;

        private build()
        {
            return <>
                <div>
                    { this.turnElement = <span class="turn" /> as HTMLSpanElement }
                    { this.imageElement = <img class="image" onclick={ (e: Event) => { UI.Dialog.lightBox({ pages: [{ content: "data:image/png;base64," + this.image }] }); } } /> as HTMLImageElement }
                    { this.textElement = <span class="text" /> as HTMLSpanElement }
                </div>
                <div>
                    <button class="icon-button return-button" title="Return here" onclick={ () => this.onReturnHere() }><color-icon src="img/icons/return.svg" /></button>
                    <button class="icon-button edit-image-button" title="Edit image" onclick={ () => this.onEditImage() }><color-icon src="img/icons/image.svg" /></button>
                    <button class="icon-button show-internal-button" title="Show internal content" onclick={ () => this.onShowInternal() }><color-icon src="img/icons/show.svg" /></button>
                    <button class="icon-button edit-button" title="Edit plot point content" onclick={ () => this.onEdit() }><color-icon src="img/icons/edit.svg" /></button>
                    <button class="icon-button delete-button" title="Delete plot point" onclick={ () => this.onDelete() }><color-icon src="img/icons/delete.svg" /></button>
                </div>
            </>;
        }

        private connectedCallback()
        {
            this.storyElement = this.closest("my-story");
            this.plotElement = this.closest("my-plot");
        }

        public get turn() { return parseInt(this.turnElement.textContent); }
        public set turn(value: number) { this.turnElement.textContent = value.toFixed(0); }

        public input: string;

        public get text(): string { return this.textElement.textContent; }
        public set text(value: string) { this.textElement.textContent = value; }

        public internal: string;

        public scenery: string;

        public get image(): string { return this.imageElement.src ? this.imageElement.src.splitFirst(",")[1] : null; }
        public set image(value: string) { this.imageElement.src = value ? "data:image/png;base64," + value : ""; }

        private async onReturnHere()
        {
            if (!await UI.Dialog.confirm({ title: "Load from here?", text: "Do you really want to load from this point?\nAll plot-points afterwards will be lost." }))
                return;

            const input = this.input;
            const plot: Data.Plot = [];
            let remove = false;
            for (const plotPointElement of this.plotElement.querySelectorAll("my-plot-point") as NodeListOf<PlotPointElement>)
            {
                if (plotPointElement == this) remove = true;
                if (remove) plotPointElement.remove();
                else plot.push(plotPointElement.exportPlotPoint());
            }

            this.plotElement.userInput.value = input;
        }

        private async onEdit()
        {
            const result = await Views.Dialogs.TextEdit("Edit Plot-Point", this.text);
            if (result) this.text = result;
        }

        private async onShowInternal()
        {
            const result = await Views.Dialogs.TextEdit("Edit Internal Text", this.internal);
            if (result) this.internal = result;
        }

        private async onEditImage()
        {
            const result = await Views.Dialogs.TextEdit("Edit Image", this.scenery);
            if (result) 
            {
                this.storyElement.beginThinking();

                try
                {
                    this.scenery = result;
                    const base64 = await AI.Client.getImage(this.scenery);
                    this.image = base64;
                }
                catch (error)
                {
                    UI.Dialog.error(error);
                }

                this.storyElement.stopThinking();
            }
        }

        private async onDelete()
        {
            if (await UI.Dialog.confirm({ text: "Are you sure you want to delete this plot-point?", title: "Delete plot-point?" }))
                this.remove();
        }

        public exportPlotPoint(includeImagesInPlot = false): Data.PlotPoint
        {
            const plotPoint: Data.PlotPoint = { text: this.text };
            if (this.input) plotPoint.input = this.input;
            if (this.internal) plotPoint.internal = this.internal;
            if (this.scenery) plotPoint.scenery = this.scenery;
            if (includeImagesInPlot && this.image) plotPoint.image = this.image;
            return plotPoint;
        }

        public importPlotPoint(plotPoint: Data.PlotPoint)
        {
            this.input = plotPoint.input;
            this.text = plotPoint.text;
            this.internal = plotPoint.internal;
            this.scenery = plotPoint.scenery;
            this.image = plotPoint.image;
        }
    }

    customElements.define("my-plot-point", PlotPointElement);
}