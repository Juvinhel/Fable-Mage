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
            await Views.worldElement.open();
            await Views.worldElement.startStory();
        }

        private async onLoadStory()
        {
            Views.navigate("Story");
            await Views.storyElement.open();
        }
    }

    customElements.define("my-home", HomeElement);
};