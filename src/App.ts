class App
{
    public static async Start()
    {
        await this.startServiceWorker();

        this.config = await Data.loadConfig();
        await AI.Client.initialize();

        document.body.prepend(Views.Nav());
        Views.navigate("Home");

        await this.initAI();
    }

    private static async startServiceWorker()
    {
        try
        {
            if ("serviceWorker" in navigator)
            {
                const registration = await navigator.serviceWorker.register("sw.js");
                let refreshing = false;

                navigator.serviceWorker.addEventListener("controllerchange", () =>
                {   // new server worker was installed and activated
                    if (!refreshing && confirm("A new version of the app is available. Do you want to reload?\nMake sure to save your story or world to the disk first!"))
                    {
                        window.location.reload();
                        refreshing = true;
                    }
                });

                await registration.update();
            }
        } catch { }
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
            for (const button of element.querySelectorAll("button, input, select, textarea, multi-select, combo-select, auto-correct-text-area, semantic-version-input") as NodeListOf<any>)
                button.disabled = true;
            for (const button of element.querySelectorAll("img") as NodeListOf<any>)
                button.classList.toggle("disabled", true);
        }
    }

    public static stopThinking()
    {
        for (const element of [Views.homeElement, Views.storyElement, Views.worldElement, Views.settingsElement])
        {
            for (const indicator of element.querySelectorAll(".thinking-indicator"))
                indicator.classList.toggle("show", false);
            for (const button of element.querySelectorAll("button, input, select, textarea, multi-select, combo-select, auto-correct-text-area, semantic-version-input") as NodeListOf<any>)
                button.disabled = false;
            for (const button of element.querySelectorAll("img") as NodeListOf<any>)
                button.classList.toggle("disabled", false);
        }
    }
}