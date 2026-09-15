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
                    <button onclick={ () => this.onLoadSavegame() }><span>Load Savegame</span></button>
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

        private async onLoadSavegame()
        {
            Views.navigate("Story");
            await Views.storyElement.open();
        }
    }

    customElements.define("my-home", HomeElement);
};