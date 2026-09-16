namespace Views.World
{
    export class CharacterCardElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());
        }

        private nameProperty: HTMLTextAreaElement;
        private portraitImage: HTMLImageElement;
        private appearanceProperty: HTMLTextAreaElement;
        private personalityProperty: HTMLTextAreaElement;
        private traitsProperty: HTMLTextAreaElement;
        private backgroundProperty: HTMLTextAreaElement;

        private additionalPropertiesList: HTMLDivElement;

        private build()
        {
            return <>
                { this.portraitImage = <img class="portrait" onclick={ () => this.onGeneratePortrait() } /> as HTMLImageElement }
                <div class="base-property-list">
                    <div>
                        <label>Name:</label>
                        { this.nameProperty = <textarea class="single-line" ontouchend={ TextEditTouch } /> as HTMLTextAreaElement }
                    </div>
                    <div>
                        <label>Appearance:</label>
                        { this.appearanceProperty = <textarea class="single-line" ontouchend={ TextEditTouch } /> as HTMLTextAreaElement }
                    </div>
                    <div>
                        <label>Personality:</label>
                        { this.personalityProperty = <textarea class="single-line" ontouchend={ TextEditTouch } /> as HTMLTextAreaElement }
                    </div>
                    <div>
                        <label for="traits">Traits:</label>
                        { this.traitsProperty = <textarea class="single-line" ontouchend={ TextEditTouch } /> as HTMLTextAreaElement }
                    </div>
                    <div>
                        <label>Background:</label>
                        { this.backgroundProperty = <textarea class="single-line" ontouchend={ TextEditTouch } /> as HTMLTextAreaElement }
                    </div>
                </div>
                { this.additionalPropertiesList = <div class="additional-property-list" /> as HTMLDivElement }
                <div class="functions vertical">
                    <button class="icon-button delete-button" onclick={ () => this.onDelete() }><color-icon src="img/icons/delete.svg" /></button>
                </div>
            </>;
        }

        public get name(): string { return this.nameProperty.value; }
        public set name(value: string) { this.nameProperty.value = value; }

        public get portrait(): string { return this.portraitImage.getAttribute("src"); }
        public set portrait(value: string) { value ? this.portraitImage.setAttribute("src", value) : this.portraitImage.removeAttribute("src"); }

        public get appearance(): string { return this.appearanceProperty.value; }
        public set appearance(value: string) { this.appearanceProperty.value = value; }

        public get personality(): string { return this.personalityProperty.value; }
        public set personality(value: string) { this.personalityProperty.value = value; }

        public get traits(): string { return this.traitsProperty.value; }
        public set traits(value: string) { this.traitsProperty.value = value; }

        public get background(): string { return this.backgroundProperty.value; }
        public set background(value: string) { this.backgroundProperty.value = value; }

        public get additionalProperties(): string[]
        {
            const ret: string[] = [];
            for (const label of this.additionalPropertiesList.querySelectorAll("label"))
                ret.push(Helper.convertPascalCaseToKebabCase(label.getAttribute("name")));
            return ret;
        }

        public set additionalProperties(values: string[])
        {
            const data = this.export();

            this.additionalPropertiesList.clearChildren();
            for (const property of values)
            {
                this.additionalPropertiesList.append(<div>
                    <label for={ property }>{ Helper.converKebabCaseToTitleCase(property) }:</label>
                    <textarea class="single-line" ontouchend={ TextEditTouch } />
                </div>);
            }

            this.import(data);
        }

        public previousGeneratePortraitPrompt: string;
        private async onGeneratePortrait()
        {
            if (this.portraitImage.classList.contains("disabled")) return;

            if (!this.previousGeneratePortraitPrompt)
                this.previousGeneratePortraitPrompt = this.appearanceProperty.value;

            const result = await Dialogs.ImageEdit(this.portraitImage.src, this.previousGeneratePortraitPrompt, "Describe the portrait of your character.");
            if (!result) return;

            this.previousGeneratePortraitPrompt = result.prompt;
            this.portraitImage.src = result.image;
        }

        public export(): Data.Character
        {
            const ret = {} as Data.Character;
            ret.name = this.name;
            ret.portrait = this.portrait;
            ret.appearance = this.appearance;
            ret.personality = this.personality;
            ret.traits = this.traits;
            ret.background = this.background;

            for (const label of this.additionalPropertiesList.querySelectorAll("label"))
            {
                const nextInput = label.nextElementSibling as HTMLTextAreaElement;
                const key = label.getAttribute("for");
                const value = nextInput.value.trim();
                ret[key] = value;
            }
            return ret;
        }

        public import(character: Data.Character)
        {
            this.name = character.name;
            this.portrait = character.portrait;
            this.appearance = character.appearance;
            this.personality = character.personality;
            this.traits = character.traits;
            this.background = character.background;

            for (const [key, value] of Object.entries(character))
            {
                if (key == "name") continue;
                if (key == "appearance") continue;
                if (key == "personality") continue;
                if (key == "traits") continue;
                if (key == "background") continue;

                const label = this.additionalPropertiesList.querySelector("label[for=\"" + key + "\"]");
                if (label)
                {
                    const input = label.nextElementSibling as HTMLTextAreaElement;
                    input.value = value;
                }
            }
        }

        private async onDelete()
        {
            if (await UI.Dialog.confirm({ text: "Are you sure you want to delete this character?", title: "Delete character?" }))
                this.remove();
        }
    }

    customElements.define("my-character-card", CharacterCardElement);
}