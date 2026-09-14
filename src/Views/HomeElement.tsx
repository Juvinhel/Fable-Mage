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

        private onCreateNewWorld()
        {
            Views.navigate("World");
            Views.worldElement.createWorldUsingAI();
        }

        private onLoadWorld()
        {
            Views.navigate("World");
            Views.worldElement.open();
        }

        private onLoadSavegame()
        {
            Views.navigate("Story");
            Views.storyElement.open();
        }
    }

    customElements.define("my-home", HomeElement);
};