namespace Views.World
{
    export class CharacterCardElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());
        }

        private nameProperty: HTMLAutoCorrectTextArea;
        private portraitImage: HTMLImageElement;
        private appearanceProperty: HTMLAutoCorrectTextArea;
        private personalityProperty: HTMLAutoCorrectTextArea;
        private skillsProperty: HTMLAutoCorrectTextArea;
        private backgroundProperty: HTMLAutoCorrectTextArea;

        private additionalPropertiesList: HTMLDivElement;

        private build()
        {
            return <>
                { this.portraitImage = <img class="portrait" onclick={ () => this.onGeneratePortrait() } /> as HTMLImageElement }
                <div class="base-property-list property-list">
                    <label>{ t("character.name") }</label>
                    { this.nameProperty = <auto-correct-text-area class="single-line" ontouchend={ TextEditTouch } lang="en-US" placeholder={ t("character.namePlaceholder") } analyze={ Services.Client.analyzeLanguage } /> as HTMLAutoCorrectTextArea }

                    <label>{ t("character.appearance") }</label>
                    { this.appearanceProperty = <auto-correct-text-area class="single-line" ontouchend={ TextEditTouch } lang="en-US" placeholder={ t("character.appearancePlaceholder") } analyze={ Services.Client.analyzeLanguage } /> as HTMLAutoCorrectTextArea }

                    <label>{ t("character.personality") }</label>
                    { this.personalityProperty = <auto-correct-text-area class="single-line" ontouchend={ TextEditTouch } lang="en-US" placeholder={ t("character.personalityPlaceholder") } analyze={ Services.Client.analyzeLanguage } /> as HTMLAutoCorrectTextArea }

                    <label for="skills">{ t("character.skills") }</label>
                    { this.skillsProperty = <auto-correct-text-area class="single-line" ontouchend={ TextEditTouch } lang="en-US" placeholder={ t("character.skillsPlaceholder") } analyze={ Services.Client.analyzeLanguage } /> as HTMLAutoCorrectTextArea }

                    <label>{ t("character.background") }</label>
                    { this.backgroundProperty = <auto-correct-text-area class="single-line" ontouchend={ TextEditTouch } lang="en-US" placeholder={ t("character.backgroundPlaceholder") } analyze={ Services.Client.analyzeLanguage } /> as HTMLAutoCorrectTextArea }
                </div>
                { this.additionalPropertiesList = <div class="additional-property-list property-list" /> as HTMLDivElement }
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

        public get skills(): string { return this.skillsProperty.value; }
        public set skills(value: string) { this.skillsProperty.value = value; }

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
                this.additionalPropertiesList.append(
                    <label for={ property }>{ Helper.converKebabCaseToTitleCase(property) }:</label>,
                    <auto-correct-text-area lang="en-US" class="single-line" ontouchend={ TextEditTouch } placeholder={ property } analyze={ Services.Client.analyzeLanguage } />);
            }

            this.import(data);
        }

        public previousGeneratePortraitPrompt: string;
        private async onGeneratePortrait()
        {
            if (this.portraitImage.classList.contains("disabled")) return;

            if (!this.previousGeneratePortraitPrompt)
                this.previousGeneratePortraitPrompt = this.appearanceProperty.value;

            const result = await Dialogs.ImageEdit(this.portraitImage.src, this.previousGeneratePortraitPrompt, t("character.describePortrait"));
            if (!result) return;

            this.previousGeneratePortraitPrompt = result.prompt;
            this.portraitImage.src = result.image;
        }

        private async onDelete()
        {
            if (await UI.Dialog.confirm({ text: t("world.deleteCharacterConfirmation"), title: t("world.deleteCharacterTitle") }))
                this.remove();
        }

        public export(): Data.Character
        {
            const ret = {} as Data.Character;
            ret.name = this.name;
            ret.portrait = this.portrait;
            ret.appearance = this.appearance;
            ret.personality = this.personality;
            ret.skills = this.skills;
            ret.background = this.background;

            for (const label of this.additionalPropertiesList.querySelectorAll("label"))
            {
                const nextInput = label.nextElementSibling as HTMLAutoCorrectTextArea;
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
            this.skills = character.skills;
            this.background = character.background;

            for (const [key, value] of Object.entries(character))
            {
                if (key == "name") continue;
                if (key == "appearance") continue;
                if (key == "personality") continue;
                if (key == "skills") continue;
                if (key == "background") continue;

                const label = this.additionalPropertiesList.querySelector("label[for=\"" + key + "\"]");
                if (label)
                {
                    const input = label.nextElementSibling as HTMLAutoCorrectTextArea;
                    input.value = value;
                }
            }
        }
    }

    customElements.define("my-character-card", CharacterCardElement);
}