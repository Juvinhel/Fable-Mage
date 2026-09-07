namespace Views
{
    export class WorldElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.title = "World";
            this.append(this.build());
        }

        private storyElement: StoryElement;

        private titleInput: HTMLTextAreaElement;
        private authorStyleInput: HTMLTextAreaElement;
        private scenarioInput: HTMLTextAreaElement;
        private playerCharacterCard: CharacterCardElement;
        private npcCardList: HTMLElement;

        private build()
        {
            return <>
                <div>
                    <label>Title:</label>
                    { this.titleInput = <textarea class="title-input single-line"
                        onkeyup={ (e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault; (e.currentTarget as HTMLElement).blur(); } } }
                        onblur={ (e: Event) => this.onTitleChanged(e) }
                        value="" /> as HTMLTextAreaElement }
                </div>
                <div>
                    <label>Author style:</label>
                    { this.authorStyleInput = <textarea class="author-style-input single-line" value="" /> as HTMLTextAreaElement }
                </div>
                <div>
                    <label>Scenario:</label>
                    { this.scenarioInput = <textarea class="scenario-input" value="" /> as HTMLTextAreaElement }
                </div>
                <div onchildrenchanged={ (e: Event) => { if ((e.currentTarget as HTMLElement).children.length <= 1) (e.currentTarget as HTMLElement).appendChild(this.playerCharacterCard = new CharacterCardElement()); } }>
                    <label>Player:</label>
                    { this.playerCharacterCard = new CharacterCardElement() }
                </div>
                <div>
                    <label>NPCs:</label>
                    <div class="functions">
                        <button class="icon-button add-npc-button" onclick={ () => this.onAddNPC() }><color-icon src="img/icons/add.svg" /></button>
                        <button class="icon-button add-npc-using-ai-button" onclick={ () => this.onAddNPCUsingAI() }><color-icon src="img/icons/ai.svg" /></button>
                    </div>
                    { this.npcCardList = <div class="npc-list list" /> as HTMLElement }
                </div>
            </>;
        }

        private connectedCallback()
        {
            this.storyElement = this.closest("my-story");
        }

        private onTitleChanged(e: Event)
        {
            if (!this.storyElement) return;

            const titleHeading = this.storyElement.querySelector(".title") as HTMLHeadingElement;
            titleHeading.textContent = this.titleInput.value.trim();
        }

        private async onAddNPC()
        {
            this.npcCardList.appendChild(new CharacterCardElement());
        }

        private async onAddNPCUsingAI()
        {
            try
            {
                const result = await Dialogs.TextEdit("Character Description", "");
                if (!result) return;

                const world = this.exportWorld();

                const character = await API.AI.createNPC(result, world);

                this.npcCardList.appendChild(new CharacterCardElement(character));
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        public exportWorld(): Data.World
        {
            const story: Data.World = {
                "title": this.titleInput.value.trim(),
                "author-style": this.authorStyleInput.value.trim().trimRight("."),
                "scenario": this.scenarioInput.value.trim().trimRight("."),
                "player": this.playerCharacterCard.character,
                "npcs": [],
            };

            const npcs = [];
            for (const npcCard of this.npcCardList.querySelectorAll("my-character-card") as NodeListOf<CharacterCardElement>)
                npcs.push(npcCard.character);
            if (npcs.length > 0) story["npcs"] = npcs;

            return story;
        }

        public importWorld(data: Data.World)
        {
            this.titleInput.value = data.title;
            this.authorStyleInput.value = data["author-style"];
            this.scenarioInput.value = data.scenario;

            const playerCard = new CharacterCardElement(data.player);
            this.playerCharacterCard.replaceWith(playerCard);
            this.playerCharacterCard = playerCard;

            this.npcCardList.clearChildren();
            for (const npc of data.npcs)
                this.npcCardList.append(new CharacterCardElement(npc));
        }
    }

    customElements.define("my-world", WorldElement);
}