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
                    <div onchildrenchanged={ (e: Event) => { if ((e.currentTarget as HTMLElement).children.length <= 1) (e.currentTarget as HTMLElement).appendChild(this.playerCharacterCard = new CharacterCardElement()); } }>
                        <label>Player:</label>
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
                    <button class="create-new-world" title="Create a new world using AI" onclick={ () => this.onCreateWorldUsingAI() }><color-icon src="img/icons/ai.svg" /><span>Create a new world using AI</span></button>
                    <button class="write-introduction" title="Write an introduction to your world using AI" onclick={ () => this.onWriteIntroductionUsingAI() }><color-icon src="img/icons/ai.svg" /><span>Write an introduction to your world using AI</span></button>
                    <button class="delete-world" title="Delete current world" onclick={ () => this.onDeleteWorld() }><color-icon src="img/icons/delete.svg" /><span>Delete current world</span></button>
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

                const character = await AI.Client.createCharacter(result, world);

                this.npcCardList.appendChild(new CharacterCardElement(character));
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        private async onCreateWorldUsingAI()
        {
            try
            {
                const result = await Dialogs.TextEdit("World Description", "");
                if (!result) return;

                await this.onDeleteWorld();

                const world = {} as Data.World;
                const output = await AI.Client.createWorld(result);
                world.title = output.title;
                world["author-style"] = output["author-style"];
                world.scenario = output.scenario;

                const player = await AI.Client.createCharacter(output.protagonist, { title: world.title, "author-style": world["author-style"], scenario: world.scenario, npcs: [], player: null });
                world.player = player;

                this.storyElement.importWorld(world);

                const tabControl = this.closest("tab-control") as HTMLTabControl;
                tabControl.selectedIndex = 1;
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        private async onWriteIntroductionUsingAI()
        {
            try
            {
                const world = this.exportWorld();

                const story = world as Data.Story;
                const introduction = await AI.Client.writeIntroduction(story);
                const introductionImage = await AI.Client.getImage(introduction.scenery);
                const plot: Data.Plot = [{ input: "Write an introduction.", text: introduction.plot, unrevealed: introduction.unrevealed, scenery: introduction.scenery, image: introductionImage }];

                this.storyElement.importPlot(plot);

                const tabControl = this.closest("tab-control") as HTMLTabControl;
                tabControl.selectedIndex = 0;
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        private async onDeleteWorld()
        {
            this.storyElement.importStory({ title: "", "author-style": "", scenario: "", player: { name: "", appearance: "", personality: "", background: "" }, npcs: [], plot: [] });
        }

        public exportWorld(): Data.World
        {
            const story: Data.World = {
                "title": this.titleInput.value.trim(),
                "author-style": this.authorStyleInput.value.trim().trimRight("."),
                "scenario": this.scenarioInput.value.trim().trimRight("."),
                "player": this.playerCharacterCard.character,
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
            if (data.npcs) for (const npc of data.npcs)
                this.npcCardList.append(new CharacterCardElement(npc));
        }
    }

    customElements.define("my-world", WorldElement);
}