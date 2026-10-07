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

        private connectedCallback()
        {
            this.storyElement = this.closest("my-story");
        }

        public get characters(): Data.Character[]
        {
            const ret: Data.Character[] = [];
            for (const characterCard of this.contentContainer.querySelectorAll("my-character-stats") as NodeListOf<CharacterStatsElement>)
                ret.push(characterCard.character);
            return ret;
        }

        public set characters(list: Data.Character[])
        {
            while (list.length < this.contentContainer.children.length) this.contentContainer.lastChild.remove();

            for (let i = 0; i < list.length; ++i)
            {
                let characterCard = this.contentContainer.children[i] as CharacterStatsElement;
                if (!characterCard)
                {
                    characterCard = new CharacterStatsElement(list[i]);
                    this.contentContainer.insertAt(i, characterCard);
                }
                else
                    characterCard.character = list[i];
            }
        }

        public reset()
        {
            this.contentContainer.clearChildren();
        }
    }

    customElements.define("my-stats-fly-out", StatsFlyOutElement);
}