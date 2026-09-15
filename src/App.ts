class App
{
    public static async Start()
    {
        this.config = await Data.loadConfig();
        await AI.Client.initialize();

        ///@ts-ignore
        //this.extractor = await window.pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5');

        document.body.prepend(Views.Nav());
        Views.navigate("Home");

        await this.initAI();
    }

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

    public static beginThinking()
    {
        for (const element of [Views.homeElement, Views.storyElement, Views.worldElement, Views.settingsElement])
        {
            for (const indicator of element.querySelectorAll(".thinking-indicator"))
                indicator.classList.toggle("show", true);
            for (const button of element.querySelectorAll("button, input, select, textarea, multi-select, combo-select, img") as NodeListOf<any>)
                button.disabled = true;
        }
    }

    public static stopThinking()
    {
        for (const element of [Views.homeElement, Views.storyElement, Views.worldElement, Views.settingsElement])
        {
            for (const indicator of element.querySelectorAll(".thinking-indicator"))
                indicator.classList.toggle("show", false);
            for (const button of element.querySelectorAll("button, input, select, textarea, multi-select, combo-select, img") as NodeListOf<any>)
                button.disabled = false;
        }
    }
}