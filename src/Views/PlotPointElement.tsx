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

        private locationElement: HTMLSpanElement;
        private timeElement: HTMLSpanElement;
        private turnElement: HTMLSpanElement;
        private textElement: HTMLSpanElement;
        private imageElement: HTMLImageElement;
        private choicesListElement: HTMLDivElement;

        private build()
        {
            return <>
                <div class="location-time">
                    { this.locationElement = <span class="location" /> as HTMLSpanElement }
                    { this.timeElement = <span class="time" /> as HTMLSpanElement }
                </div>
                <div class="plot-text">
                    { this.turnElement = <span class="turn" /> as HTMLSpanElement }
                    { this.imageElement = <img class="image" onclick={ (e: Event) => { UI.Dialog.lightBox({ pages: [{ content: this.image }] }); } } /> as HTMLImageElement }
                    { this.textElement = <span class="text" /> as HTMLSpanElement }
                </div>
                <div class="actions">
                    <button class="icon-button return-button" title="Return here" onclick={ () => this.onReturnHere() }><color-icon src="img/icons/return.svg" /></button>
                    <button class="icon-button edit-image-button" title="Edit image" onclick={ () => this.onEditImage() }><color-icon src="img/icons/image.svg" /></button>
                    <button class="icon-button show-internal-button" title="Show internal content" onclick={ () => this.onShowInternal() }><color-icon src="img/icons/show.svg" /></button>
                    <button class="icon-button edit-button" title="Edit plot point content" onclick={ () => this.onEdit() }><color-icon src="img/icons/edit.svg" /></button>
                    <button class="icon-button delete-button" title="Delete plot point" onclick={ () => this.onDelete() }><color-icon src="img/icons/delete.svg" /></button>
                </div>
                { this.choicesListElement = <div class="choices-list"></div> as HTMLDivElement }
            </>;
        }

        private connectedCallback()
        {
            this.storyElement = this.closest("my-story");
        }

        public get turn() { return parseInt(this.turnElement.textContent); }
        public set turn(value: number) { this.turnElement.textContent = value.toFixed(0); }

        public input: string;

        public get text(): string { return this.textElement.textContent; }
        public set text(value: string) { this.textElement.textContent = value; }

        public get location(): string { return this.locationElement.textContent; }
        public set location(value: string) { this.locationElement.textContent = value; }

        public get time(): string { return this.timeElement.textContent; }
        public set time(value: string) { this.timeElement.textContent = value; }

        public internal: string;

        public scenery: string;

        public get image(): string { return this.imageElement.src ? this.imageElement.src : null; }
        public set image(value: string) { this.imageElement.src = value ? value : ""; }

        public get choices(): string[] { return [...this.choicesListElement.querySelectorAll("button")].map(x => x.textContent); }
        public set choices(values: string[])
        {
            this.choicesListElement.clearChildren();
            if (values)
                for (const choice of values)
                {
                    const button = <button onclick={ (e: Event) => this.setChoice((e.currentTarget as HTMLButtonElement).textContent) }>
                        <color-icon src="img/icons/send.svg" />
                        <span>{ choice }</span>
                    </button>;
                    this.choicesListElement.append(button);
                }
        }

        private async setChoice(choice: string)
        {
            if (this.storyElement.userInput.value == choice)
                this.storyElement.submitButton.click();
            else
                this.storyElement.userInput.value = choice;
        }

        private async onReturnHere()
        {
            if (!await UI.Dialog.confirm({ title: "Load from here?", text: "Do you really want to load from this point?\nAll plot-points afterwards will be lost." }))
                return;

            const input = this.input;
            const plot: Data.Plot = [];
            let remove = false;
            for (const plotPointElement of this.storyElement.querySelectorAll("my-plot-point") as NodeListOf<PlotPointElement>)
            {
                if (plotPointElement == this) remove = true;
                if (remove) plotPointElement.remove();
                else plot.push(plotPointElement.exportPlotPoint());
            }

            this.storyElement.userInput.value = input ?? "";
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
            const result = await Dialogs.ImageEdit(this.image, this.scenery, "Describe the ambient image of the plot.");
            if (!result) return;

            this.scenery = result.prompt;
            this.image = result.image;
        }

        private async onDelete()
        {
            if (await UI.Dialog.confirm({ text: "Are you sure you want to delete this plot-point?", title: "Delete plot-point?" }))
                this.remove();
        }

        public exportPlotPoint(includeImagesInPlot = false): Data.PlotPoint
        {
            const plotPoint: Data.PlotPoint = {
                location: this.location,
                time: this.time,
                text: this.text,
                internal: this.internal,
            };
            if (this.scenery) plotPoint.scenery = this.scenery;
            if (this.input) plotPoint.input = this.input;
            if (includeImagesInPlot && this.image) plotPoint.image = this.image;
            if (this.choices && this.choices.length > 0) plotPoint.choices = this.choices;
            return plotPoint;
        }

        public importPlotPoint(plotPoint: Data.PlotPoint)
        {
            this.input = plotPoint.input;
            this.location = plotPoint.location;
            this.time = plotPoint.time;
            this.text = plotPoint.text;
            this.internal = plotPoint.internal;
            this.scenery = plotPoint.scenery;
            this.image = plotPoint.image;
            this.choices = plotPoint.choices;
        }
    }

    customElements.define("my-plot-point", PlotPointElement);
}