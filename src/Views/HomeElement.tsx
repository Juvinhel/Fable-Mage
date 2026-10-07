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
                    <button onclick={ () => this.onCreateNewWorld() }><span>Create new World</span></button>
                    <button onclick={ () => this.onLoadWorld() }><span>Load World</span></button>
                    <button onclick={ () => this.onStartStory() }><span>Start Story</span></button>
                    <button onclick={ () => this.onLoadStory() }><span>Load Story</span></button>
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