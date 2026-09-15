namespace Views.World
{
    export class PrologueElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());
        }

        private locationElement: HTMLSpanElement;
        private timeElement: HTMLSpanElement;
        private textElement: HTMLSpanElement;

        private build()
        {
            return <>
                <div class="location-time">
                    { this.locationElement = <span class="location" /> as HTMLSpanElement }
                    { this.timeElement = <span class="time" /> as HTMLSpanElement }
                </div>
                <div class="plot-text">
                    <span class="turn">1</span>
                    { this.textElement = <span class="text" /> as HTMLSpanElement }
                </div>
                <div class="actions">
                    <button class="icon-button show-internal-button" title="Show internal content" onclick={ () => this.onShowInternal() }><color-icon src="img/icons/show.svg" /></button>
                    <button class="icon-button edit-button" title="Edit plot point content" onclick={ () => this.onEdit() }><color-icon src="img/icons/edit.svg" /></button>
                </div>
            </>;
        }
        public input: string;

        public get text(): string { return this.textElement.textContent; }
        public set text(value: string) { this.textElement.textContent = value; }

        public get location(): string { return this.locationElement.textContent; }
        public set location(value: string) { this.locationElement.textContent = value; }

        public get time(): string { return this.timeElement.textContent; }
        public set time(value: string) { this.timeElement.textContent = value; }

        public internal: string;

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

        public export(): Data.PlotPoint
        {
            const prologue: Data.Prologue = {
                location: this.location,
                time: this.time,
                text: this.text,
                internal: this.internal,
            };
            return prologue;
        }

        public import(prologue: Data.Prologue)
        {
            this.location = prologue.location;
            this.time = prologue.time;
            this.text = prologue.text;
            this.internal = prologue.internal;
        }
    }

    customElements.define("my-prologue", PrologueElement);
}