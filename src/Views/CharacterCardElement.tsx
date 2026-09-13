namespace Views
{
    export class CharacterCardElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());
        }

        private nameProperty: HTMLTextAreaElement;
        private appearanceProperty: HTMLTextAreaElement;
        private personalityProperty: HTMLTextAreaElement;
        private traitsProperty: HTMLTextAreaElement;
        private backgroundProperty: HTMLTextAreaElement;

        private additionalPropertiesList: HTMLDivElement;

        private build()
        {
            return <>
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
                <div class="functions">
                    <button class="icon-button delete-button" onclick={ () => this.onDelete() }><color-icon src="img/icons/delete.svg" /></button>
                </div>
            </>;
        }

        public get name(): string { return this.nameProperty.value; }
        public set name(value: string) { this.nameProperty.value = value; }

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
            const data = this.exportCharacter();

            this.additionalPropertiesList.clearChildren();
            for (const property of values)
            {
                this.additionalPropertiesList.append(<div>
                    <label for={ property }>{ property }:</label>
                    <textarea class="single-line" ontouchend={ TextEditTouch } />
                </div>);
            }

            this.importCharacter(data);
        }

        public exportCharacter(): Data.CharacterCard
        {
            const ret = {} as Data.CharacterCard;
            ret.name = this.nameProperty.value;
            ret.appearance = this.appearanceProperty.value;
            ret.personality = this.personalityProperty.value;
            ret.traits = this.traitsProperty.value;
            ret.background = this.backgroundProperty.value;
            for (const label of this.additionalPropertiesList.querySelectorAll("label"))
            {
                const nextInput = label.nextElementSibling as HTMLTextAreaElement;
                const key = label.getAttribute("for");
                const value = nextInput.value.trim();
                ret[key] = value;
            }
            return ret;
        }

        public importCharacter(character: Data.CharacterCard)
        {
            this.nameProperty.value = character.name;
            this.appearanceProperty.value = character.appearance;
            this.personalityProperty.value = character.personality;
            this.traitsProperty.value = character.traits;
            this.backgroundProperty.value = character.background;

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