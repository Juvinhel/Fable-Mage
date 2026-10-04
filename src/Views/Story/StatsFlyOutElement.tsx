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
        private contentContainer: HTMLElement;

        private build()
        {
            return this.contentContainer = <div /> as HTMLElement;
        }

        private buildCharacterCard(character: Data.Character)
        {
            return <div data-name={ character.name }>
                <img class="portrait" src={ character.portrait } />
                <h3>{ character.name }</h3>
                {
                    ...Object.entries(character).filter(([key, value]) => key != "name" && key != "portrait").map(([key, value]) => [
                        <label for={ key }>{ Helper.converKebabCaseToTitleCase(key) }: </label>,
                        <span>{ Helper.FormatAIText(value) }</span>
                    ])
                }
            </div>;
        }

        private connectedCallback()
        {
            this.storyElement = this.closest("my-story");
        }

        public get characters(): Data.Character[]
        {
            const ret: Data.Character[] = [];
            for (const characterCard of this.contentContainer.children)
            {
                const name = characterCard.querySelector("h3").textContent;
                const portrait = characterCard.querySelector("img").getAttribute("src");

                const character: Data.Character = { name, portrait } as any;
                for (const label of characterCard.querySelectorAll("label"))
                {
                    const span = label.nextElementSibling as HTMLSpanElement;
                    character[label.htmlFor] = span.textContent;
                }
                ret.push(character);
            }
            return ret;
        }

        public set characters(list: Data.Character[])
        {
            while (list.length < this.contentContainer.children.length) this.contentContainer.lastChild.remove();

            for (let i = 0; i < list.length; ++i)
            {
                let characterCard = this.contentContainer.children[i];
                if (!characterCard)
                {
                    characterCard = this.buildCharacterCard(list[i]) as HTMLElement;
                    this.contentContainer.append(characterCard);
                }
                else
                {
                    const heading = characterCard.querySelector("h3");
                    heading.textContent = list[i].name;
                    const img = characterCard.querySelector("img");
                    img.src = list[i].portrait;
                    for (const label of characterCard.querySelectorAll("label"))
                    {
                        const span = label.nextElementSibling as HTMLSpanElement;
                        span.textContent = list[i][label.htmlFor];
                    }
                }
            }
        }

        public reset()
        {
            this.contentContainer.clearChildren();
        }
    }

    customElements.define("my-stats-fly-out", StatsFlyOutElement);
}