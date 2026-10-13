namespace Views
{
    export class HomeElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());
        }


        private build()
        {
            return <>
                <h1>Fable Mage</h1>

                <img class="background" src="img/home-cover.png" />

                <div>
                    <button title="Create new World" onclick={ () => this.onCreateNewWorld() }><color-icon src="img/icons/ai.svg" /><span>Create new World</span></button>
                    <button title="Load World" onclick={ () => this.onLoadWorld() }><color-icon src="img/icons/open.svg" /><span>Load World</span></button>
                    <button title="Start Story" onclick={ () => this.onStartStory() }><color-icon src="img/icons/play.svg" /><span>Start Story</span></button>
                    <button title="Load Story" onclick={ () => this.onLoadStory() }><color-icon src="img/icons/open.svg" /><span>Load Story</span></button>
                </div>
            </>;
        }

        private async onCreateNewWorld()
        {
            Views.navigate("World");
            await Views.worldElement.createWorldUsingAI();
        }

        private async onLoadWorld()
        {
            Views.navigate("World");
            await Views.worldElement.open();
        }

        private async onStartStory()
        {
            const result = await UI.Dialog.upload({ multiple: false, title: "Upload your world", accept: "application/json,text/json,.json" });
            if (result?.length > 0)
            {
                const file = result.item(0);
                const text = await file.text();
                const world = JSON.parse(text);
                Views.navigate("Story");
                Views.storyElement.startStory(world);
            }
        }

        private async onLoadStory()
        {
            Views.navigate("Story");
            await Views.storyElement.open();

        }
    }

    customElements.define("my-home", HomeElement);
};