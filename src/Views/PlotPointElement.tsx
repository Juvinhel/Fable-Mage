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
                    <button class="icon-button edit-image-button" title="Edit image" onclick={ () => this.onEditImage() }><color-icon src="img/icons/image.svg" /></button>
                    <button class="icon-button show-unrevealed-button" title="Show unrevealed content" onclick={ () => this.onShowUnrevealed() }><color-icon src="img/icons/show.svg" /></button>
                    <button class="icon-button edit-button" title="Edit plot point content" onclick={ () => this.onEdit() }><color-icon src="img/icons/edit.svg" /></button>
                    <button class="icon-button delete-button" title="Delete plot point" onclick={ () => this.onDelete() }><color-icon src="img/icons/delete.svg" /></button>
                </div>
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

        public unrevealed: string;

        public scenery: string;

        public get image(): string { return this.imageElement.src ? this.imageElement.src.splitFirst(",")[1] : null; }
        public set image(value: string) { this.imageElement.src = value ? "data:image/png;base64," + value : ""; }

        private async onEdit()
        {
            const result = await Views.Dialogs.TextEdit("Edit Plot-Point", this.text);
            if (result) this.text = result;
        }

        private async onShowUnrevealed()
        {
            const result = await Views.Dialogs.TextEdit("Edit Unrevealed", this.unrevealed);
            if (result) this.unrevealed = result;
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
    }

    customElements.define("my-plot-point", PlotPointElement);
}