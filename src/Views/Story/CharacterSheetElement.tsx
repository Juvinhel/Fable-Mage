namespace Views.Story
{
    export class CharacterSheetElement extends HTMLElement
    {
        constructor (character: Data.Character)
        {
            super();

            this.originalName = character.name;
            this.append(this.build(character));
        }

        public originalName: string;

        private portraitImg: HTMLImageElement;
        private nameHeading: HTMLHeadingElement;

        private build(character: Data.Character)
        {
            return <>
                { this.portraitImg = <img class="portrait" src={ character.portrait } /> as HTMLImageElement }
                { this.nameHeading = <h3>{ character.name }</h3> as HTMLHeadingElement }
                {
                    ...Object.entries(character).filter(([key, value]) => key != "name" && key != "portrait").map(([key, value]) => [
                        <label for={ key }>{ Helper.converKebabCaseToTitleCase(key) }: </label>,
                        <span innerHTML={ Helper.FormatAIText(value) } text-attribute={ value } />,
                        <button class="icon-button edit-button" title={ "Edit " + key } onclick={ (e: Event) => this.onEdit(e) }><color-icon src="img/icons/edit.svg" /></button>
                    ])
                }
            </>;
        }

        private async onEdit(e: Event)
        {
            const button = e.currentTarget as HTMLButtonElement;
            const span = button.previousElementSibling as HTMLSpanElement;
            const label = span.previousElementSibling as HTMLLabelElement;
            console.log(label.htmlFor, span.getAttribute("text"));
            const result = await Views.Dialogs.TextEdit("Edit " + label.htmlFor, span.getAttribute("text"));
            if (result)
            {
                span.setAttribute("text", result);
                span.innerHTML = Helper.FormatAIText(result);
            }
        }

        public get character(): Data.Character
        {
            const ret = {} as Data.Character;
            ret.name = this.nameHeading.textContent;
            ret.portrait = this.portraitImg.getAttribute("src");
            for (const label of this.querySelectorAll("label"))
            {
                const span = label.nextElementSibling as HTMLSpanElement;
                ret[label.htmlFor] = span.getAttribute("text");
            }
            return ret;
        }

        public set character(value: Data.Character)
        {
            this.nameHeading.textContent = value.name;
            this.portraitImg.src = value.portrait;

            for (const label of this.querySelectorAll("label"))
            {
                const span = label.nextElementSibling as HTMLSpanElement;
                const text = value[label.htmlFor];
                span.setAttribute("text", text);
                span.innerHTML = Helper.FormatAIText(text);
            }
        }
    }

    customElements.define("my-character-sheet", CharacterSheetElement);
}