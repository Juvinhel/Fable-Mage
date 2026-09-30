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
        private textElement: HTMLAutoCorrectTextArea;
        private choicesListElement: HTMLDivElement;

        private build()
        {
            return <>
                <div class="location-time">
                    { this.locationElement = <span class="location" /> as HTMLSpanElement }
                    { this.timeElement = <span class="time" /> as HTMLSpanElement }
                </div>
                <span>Text:</span>
                { this.textElement = <auto-correct-text-area class="plot-text large" /> as HTMLAutoCorrectTextArea }
                <span>Choices:</span>
                { this.choicesListElement = <div class="choices-list">
                    <auto-correct-text-area class="choice single-line" placeholder="First Choice" />
                    <auto-correct-text-area class="choice single-line" placeholder="Second Choice" />
                    <auto-correct-text-area class="choice single-line" placeholder="Third Choice" />
                </div> as HTMLDivElement }
                <div class="actions">
                    <button class="icon-button show-internal-button" title="Show internal content" onclick={ () => this.onShowInternal() }><color-icon src="img/icons/show.svg" /></button>
                </div>
            </>;
        }
        public input: string;

        public get text(): string { return this.textElement.value; }
        public set text(value: string) { this.textElement.value = value; }

        public get location(): string { return this.locationElement.textContent; }
        public set location(value: string) { this.locationElement.textContent = value; }

        public get time(): string { return this.timeElement.textContent; }
        public set time(value: string) { this.timeElement.textContent = value; }

        public internal: string;

        public get choices(): string[] { return [...this.choicesListElement.querySelectorAll("auto-correct-text-area")].map(x => (x as HTMLAutoCorrectTextArea).value); }
        public set choices(values: string[])
        {
            this.choicesListElement.clearChildren();
            if (values)
                for (const choice of values)
                {
                    const textArea = <auto-correct-text-area class="choice single-line" value={ choice } />;
                    this.choicesListElement.append(textArea);
                }
        }

        private async onShowInternal()
        {
            const result = await Views.Dialogs.TextEdit("Edit Internal Text", this.internal);
            if (result) this.internal = result;
        }

        public export(): Data.Prologue
        {
            const prologue: Data.Prologue = {
                location: this.location,
                time: this.time,
                text: this.text,
                internal: this.internal,
                choices: this.choices,
            };
            return prologue;
        }

        public import(prologue: Data.Prologue)
        {
            this.location = prologue.location;
            this.time = prologue.time;
            this.text = prologue.text;
            this.internal = prologue.internal;
            this.choices = prologue.choices;
        }
    }

    customElements.define("my-prologue", PrologueElement);
}