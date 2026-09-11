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
        private focusInput: HTMLTextAreaElement;
        private playerCharacterCard: CharacterCardElement;
        private npcCardList: HTMLElement;

        private build()
        {
            return <>
                <div>
                    <div>
                        <label>Title:</label>
                        { this.titleInput = <textarea class="title-input single-line"
                            onkeyup={ (e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault; (e.currentTarget as HTMLElement).blur(); } } }
                            onblur={ (e: Event) => this.onTitleChanged() }
                            ontouchend={ async (e: TouchEvent) => { await TextEditTouch(e); this.onTitleChanged(); } }
                            value="" /> as HTMLTextAreaElement }
                    </div>
                    <div>
                        <label>Author style:</label>
                        { this.authorStyleInput = <textarea class="author-style-input single-line" value="" ontouchend={ TextEditTouch } /> as HTMLTextAreaElement }
                    </div>
                    <div>
                        <label>Scenario:</label>
                        { this.scenarioInput = <textarea class="scenario-input" value="" ontouchend={ TextEditTouch } /> as HTMLTextAreaElement }
                    </div>
                    <div>
                        <label>Focus:</label>
                        { this.focusInput = <textarea class="focus-input" value="" ontouchend={ TextEditTouch } /> as HTMLTextAreaElement }
                    </div>
                    <div onchildrenchanged={ (e: Event) => { if ((e.currentTarget as HTMLElement).children.length <= 2) (e.currentTarget as HTMLElement).appendChild(this.playerCharacterCard = new CharacterCardElement()); } }>
                        <label>Player:</label>
                        <div class="functions">
                            <button class="icon-button create-player-using-ai-button" title="Create player character using AI" onclick={ () => this.onCreatePlayerUsingAI() }><color-icon src="img/icons/ai.svg" /></button>
                        </div>
                        { this.playerCharacterCard = new CharacterCardElement() }
                    </div>
                    <div>
                        <label>NPCs:</label>
                        <div class="functions">
                            <button class="icon-button add-npc-button" title="Create new npc" onclick={ () => this.onAddNPC() }><color-icon src="img/icons/add.svg" /></button>
                            <button class="icon-button add-npc-using-ai-button" title="Create new npc using AI" onclick={ () => this.onAddNPCUsingAI() }><color-icon src="img/icons/ai.svg" /></button>
                        </div>
                        { this.npcCardList = <div class="npc-list list" /> as HTMLElement }
                    </div>
                </div>

                <div>
                    <button class="create-new-world" title="Create a new world using AI" onclick={ () => this.onCreateWorldUsingAI() }><color-icon src="img/icons/ai.svg" /><span>Create new world</span></button>
                    <button class="write-prologue" title="Write a prologue to your world using AI" onclick={ () => this.onWritePrologueUsingAI() }><color-icon src="img/icons/ai.svg" /><span>Write prologue</span></button>
                    <button class="delete-world" title="Delete current world" onclick={ () => this.onDeleteWorld() }><color-icon src="img/icons/delete.svg" /><span>Delete current world</span></button>
                    <span class="thinking-indicator"><span>Thinking</span><span class="dots">...</span></span>
                </div>
            </>;
        }

        private connectedCallback()
        {
            this.storyElement = this.closest("my-story");
        }

        private onTitleChanged()
        {
            if (!this.storyElement) return;

            const titleHeading = this.storyElement.querySelector(".title") as HTMLHeadingElement;
            titleHeading.textContent = this.titleInput.value.trim();
        }

        private async onCreatePlayerUsingAI()
        {

            const result = await Dialogs.TextEdit("Character Description", "", "Describe your player character.");
            if (!result) return;

            this.storyElement.beginThinking();

            try
            {

                const world = this.exportWorld();
                const character = await AI.Client.createCharacter(result, world);

                this.playerCharacterCard.importCharacter(character);
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            this.storyElement.stopThinking();
        }

        private async onAddNPC()
        {
            this.npcCardList.appendChild(new CharacterCardElement());
        }

        private async onAddNPCUsingAI()
        {
            const result = await Dialogs.TextEdit("Character Description", "", "Describe the NPC that should be added.");
            if (!result) return;

            this.storyElement.beginThinking();

            try
            {

                const world = this.exportWorld();
                const character = await AI.Client.createCharacter(result, world);

                this.npcCardList.appendChild(new CharacterCardElement(character));
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            this.storyElement.stopThinking();
        }

        private async onCreateWorldUsingAI()
        {
            const result = await Dialogs.TextEdit("World Description", "", "Describe your scenario including lore and background story.");
            if (!result) return;

            this.storyElement.beginThinking();

            try
            {
                await this.onDeleteWorld();
                const world = {} as Data.World;
                const output = await AI.Client.createWorld(result);
                world.title = output.title;
                world["author-style"] = output["author-style"];
                world.scenario = output.scenario;
                world.focus = output.focus;

                const player = await AI.Client.createCharacter(output.protagonist, world);
                world.player = player;

                world.npcs = [];

                this.storyElement.importWorld(world);
                this.storyElement.selectTab("world");
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            this.storyElement.stopThinking();
        }

        private async onWritePrologueUsingAI()
        {
            this.storyElement.plotElement.onWritePrologueUsingAI();
        }

        private async onDeleteWorld()
        {
            this.storyElement.importStory({ title: "", "author-style": "", scenario: "", focus: "", player: { name: "", appearance: "", personality: "", traits: "", background: "" }, npcs: [], plot: [] });
        }

        public exportWorld(): Data.World
        {
            const story: Data.World = {
                "title": this.titleInput.value.trim(),
                "author-style": this.authorStyleInput.value.trim().trimRight("."),
                "scenario": this.scenarioInput.value.trim().trimRight("."),
                "focus": this.focusInput.value.trim().trimRight("."),
                "player": this.playerCharacterCard.exportCharacter(),
            };

            const npcs = [];
            for (const npcCard of this.npcCardList.querySelectorAll("my-character-card") as NodeListOf<CharacterCardElement>)
                npcs.push(npcCard.exportCharacter());
            if (npcs.length > 0) story["npcs"] = npcs;

            return story;
        }

        public importWorld(data: Data.World)
        {
            this.titleInput.value = data.title;
            this.authorStyleInput.value = data["author-style"];
            this.scenarioInput.value = data.scenario;
            this.focusInput.value = data.focus;

            const playerCard = new CharacterCardElement(data.player);
            this.playerCharacterCard.replaceWith(playerCard);
            this.playerCharacterCard = playerCard;

            this.npcCardList.clearChildren();
            if (data.npcs) for (const npc of data.npcs)
                this.npcCardList.append(new CharacterCardElement(npc));
        }
    }

    customElements.define("my-world", WorldElement);
}