namespace Views
{
    export class CharacterCardElement extends HTMLElement
    {
        constructor (character?: Data.CharacterCard)
        {
            super();

            this.append(this.build());

            if (character)
                this.importCharacter(character);
            else
                this.importCharacter({ name: "", appearance: "", personality: "", traits: "", background: "" });
        }

        private propertyList: HTMLDivElement;

        private build()
        {
            return <>
                { this.propertyList = <div class="property-list" /> as HTMLDivElement }
                <div class="functions">
                    <button class="icon-button delete-button" onclick={ () => this.onDelete() }><color-icon src="img/icons/delete.svg" /></button>
                </div>
            </>;
        }

        public exportCharacter(): Data.CharacterCard
        {
            const ret: { [key: string]: string; } = {};
            for (const label of this.propertyList.querySelectorAll("label") as NodeListOf<HTMLLabelElement>)
            {
                const nextInput = label.nextElementSibling as HTMLTextAreaElement;
                const key = Helper.convertPascalCaseToKebabCase(label.textContent.trim().trimRight(":"));
                const value = nextInput.value.trim();
                ret[key] = value;
            }
            return ret as Data.CharacterCard;
        }

        public importCharacter(character: Data.CharacterCard)
        {
            this.propertyList.clearChildren();

            for (const [key, value] of Object.entries(character))
            {
                this.propertyList.append(<div>
                    <label>{ Helper.convertKebabCaseToPascalCase(key) + ":" }</label>
                    <textarea class="single-line" value={ value } ontouchend={ TextEditTouch } />
                </div>);
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