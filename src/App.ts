class App
{
    public static async Start()
    {
        this.config = await Data.loadConfig();
        await AI.Client.initialize();

        ///@ts-ignore
        this.extractor = await window.pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5');

        document.addEventListener("visibilitychange", App.visibilityChange);

        document.body.prepend(Views.Nav());
        Views.navigate("Home");

        await this.initAI();

        //const story = localStorage.get<Data.Story>("current-story") ?? await (await fetch("templates/sample-story.json")).json();
        //this.storyElement.importStory(story);
        //
        //this.storyElement.init();
    }

    private static visibilityChange = function (this: typeof App, event: Event)
    {
        if (document.visibilityState == "hidden")
        {
            //try
            //{
            //    const currentStory = this.storyElement.exportStory(true, true);
            //    localStorage.set("current-story", currentStory);
            //} catch { }
        }
    }.bind(this);

    public static config: Data.Config;

    public static extractor;

    public static async initAI()
    {
        try
        {
            let textAPI: AI.TextAPI;
            try
            {
                textAPI = AI.createTextAPI(this.config.textAPI);
                await textAPI.check();
            }
            catch (error)
            {
                throw new Error("Something went wrong with your text api config!");
            }

            let imageAPI: AI.ImageAPI;
            try
            {
                imageAPI = AI.createImageAPI(this.config.imageAPI);
                await imageAPI.check();
            }
            catch (error)
            {
                throw new Error("Something went wrong with your image api config!");
            }

            AI.textAPI = textAPI;
            AI.imageAPI = imageAPI;
        }
        catch (error)
        {
            UI.Dialog.error(error);
            Views.navigate("Settings");
        }
    }
}