namespace Views.Story
{
    export class StatsFlyOutElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());
        }

        private storyElement: StoryElement;

        private build()
        {
            return <>
            </>;
        }

        private buildCharacterCard(character: Data.Character)
        {
            return <div data-name={ character.name }>
                <h3>{ character.name }</h3>
                <img class="portrait" src={ character.portrait } />
                {
                    ...Object.entries(character).filter(([key, value]) => key != "name" && key != "portrait").map(([key, value]) => [
                        <label for={ key }>{ Helper.converKebabCaseToTitleCase(key) }</label>,
                        <span>{ value }</span>
                    ])
                }
            </div>;
        }

        private updateOrCreateCharacterCard(character: Data.Character)
        {
            let characterCard: HTMLElement;
            for (const element of this.children)
                if (element.getAttribute("data-name") == character.name)
                {
                    characterCard = element as HTMLElement;
                    break;
                }

            if (characterCard)
            {
                const img = characterCard.querySelector("img");
                img.src = character.portrait;
                for (const [key, value] of Object.entries(character))
                    if (key != "name" && key != "portrait")
                    {
                        const label = characterCard.querySelector("label[for=\"" + key + "\"]");
                        const span = label.nextElementSibling as HTMLSpanElement;
                        span.textContent = value;
                    }
            }
            else
                this.append(this.buildCharacterCard(character));
        }

        private connectedCallback()
        {
            this.storyElement = this.closest("my-story");
        }

        public reset()
        {
            this.clearChildren();
        }

        public updateCharacters(player: Data.Character, npcs: Data.Character[])
        {
            this.updateOrCreateCharacterCard(player);
            for (const npc of npcs)
                this.updateOrCreateCharacterCard(npc);
        }
    }

    customElements.define("my-stats-fly-out", StatsFlyOutElement);
}