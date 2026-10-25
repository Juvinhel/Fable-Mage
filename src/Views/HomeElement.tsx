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
                    <button title={ t("home.createWorld") } onclick={ () => this.onCreateNewWorld() }><color-icon src="img/icons/ai.svg" /><span>{ t("home.createWorld") }</span></button>
                    <button title={ t("home.loadWorld") } onclick={ () => this.onLoadWorld() }><color-icon src="img/icons/open.svg" /><span>{ t("home.loadWorld") }</span></button>
                    <button title={ t("home.startStory") } onclick={ () => this.onStartStory() }><color-icon src="img/icons/play.svg" /><span>{ t("home.startStory") }</span></button>
                    <button title={ t("home.loadStory") } onclick={ () => this.onLoadStory() }><color-icon src="img/icons/open.svg" /><span>{ t("home.loadStory") }</span></button>
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
            const result = await UI.Dialog.upload({ multiple: false, title: t("dialogs.uploadWorld"), accept: "application/json,text/json,.json" });
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