namespace Views
{
    export class PlotPointElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());
        }

        private textElement: HTMLSpanElement;
        private imageElement: HTMLImageElement;

        private build()
        {
            return <>
                <div>
                    { this.imageElement = <img class="image" onclick={ (e: Event) => { UI.Dialog.lightBox({ pages: [{ content: "data:image/png;base64," + this.image }] }); } } /> as HTMLImageElement }
                    { this.textElement = <span class="text" /> as HTMLSpanElement }
                </div>
                <div>
                    <button class="icon-button edit-button" title="Edit plot point content" onclick={ () => this.onEdit() }><color-icon src="img/icons/edit.svg" /></button>
                    <button class="icon-button delete-button" title="Delete plot point" onclick={ () => this.onDelete() }><color-icon src="img/icons/delete.svg" /></button>
                </div>
            </>;
        }

        public get text(): string { return this.textElement.textContent; }
        public set text(value: string) { this.textElement.textContent = value; }

        public get image(): string { return this.imageElement.src ? this.imageElement.src.splitFirst(",")[1] : null; }
        public set image(value: string) { this.imageElement.src = value ? "data:image/png;base64," + value : ""; }

        public input: string;

        private async onDelete()
        {
            if (await UI.Dialog.confirm({ text: "Are you sure you want to delete this plot-point?", title: "Delete plot-point?" }))
                this.remove();
        }

        private async onEdit()
        {
            const result = await Views.Dialogs.TextEdit("Edit Plot-Point", this.text);
            if (result) this.text = result;
        }
    }

    customElements.define("my-plot-point", PlotPointElement);
}