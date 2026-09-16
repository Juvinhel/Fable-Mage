namespace Views.Story
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
                    { this.imageElement = <img class="image hidden" onclick={ (e: Event) => { UI.Dialog.lightBox({ pages: [{ content: this.image }] }); } } /> as HTMLImageElement }
                    { this.textElement = <span class="text" /> as HTMLSpanElement }
                </div>
                <div class="actions">
                    <button class="icon-button return-button" title="Return here" onclick={ () => this.onReturnHere() }><color-icon src="img/icons/return.svg" /></button>
                    <button class="icon-button edit-image-button" title="Edit image" onclick={ () => this.onEditImage() }><color-icon src="img/icons/image.svg" /></button>
                    <button class="icon-button show-internal-button" title="Show internal content" onclick={ () => this.onShowInternal() }><color-icon src="img/icons/show.svg" /></button>
                    <button class="icon-button edit-button" title="Edit plot point content" onclick={ () => this.onEdit() }><color-icon src="img/icons/edit.svg" /></button>
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

        private internal_scenery: string;
        public get scenery(): string { return this.internal_scenery; }
        public set scenery(value: string) { this.internal_scenery = value; this.imageElement.classList.toggle("hidden", !value); }

        public get image(): string { return this.imageElement.getAttribute("src"); }
        public set image(value: string) { value ? this.imageElement.setAttribute("src", value) : this.imageElement.removeAttribute("src"); }

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

        // summary of previous turns
        public summary: string;

        public playerChanges: Partial<Data.Character>;
        public npcChanges: Partial<Data.Character>[];

        private async setChoice(choice: string)
        {
            if (this.storyElement.userInput.value == choice)
                this.storyElement.submitButton.click();
            else
                this.storyElement.userInput.value = choice;
        }

        private async onReturnHere()
        {
            this.storyElement.returnHere(this);
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

        public export(): Data.PlotPoint
        {
            const plotPoint: Data.PlotPoint = {
                location: this.location,
                time: this.time,
                text: this.text,
                internal: this.internal,
            };
            if (this.scenery) plotPoint.scenery = this.scenery;
            if (this.input) plotPoint.input = this.input;
            if (this.image) plotPoint.image = this.image;
            if (this.choices && this.choices.length > 0) plotPoint.choices = this.choices;

            if (this.summary) plotPoint.summary = this.summary;
            if (this.playerChanges) plotPoint.playerChanges = this.playerChanges;
            if (this.npcChanges && this.npcChanges.length > 0) plotPoint.npcChanges = this.npcChanges;

            return plotPoint;
        }

        public import(plotPoint: Data.PlotPoint)
        {
            this.input = plotPoint.input;
            this.location = plotPoint.location;
            this.time = plotPoint.time;
            this.text = plotPoint.text;
            this.internal = plotPoint.internal;
            this.scenery = plotPoint.scenery;
            this.image = plotPoint.image;
            this.choices = plotPoint.choices;

            this.summary = plotPoint.summary;
            this.playerChanges = plotPoint.playerChanges;
            this.npcChanges = plotPoint.npcChanges;
        }
    }

    customElements.define("my-plot-point", PlotPointElement);
}