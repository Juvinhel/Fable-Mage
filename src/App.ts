class App
{
    public static async Start()
    {
        await loadTranslations();
        await this.startServiceWorker();

        this.config = await Data.loadConfig();
        await AI.Client.initialize();

        document.body.prepend(Views.Nav());
        Views.navigate("Home");

        await this.initAI();

        this.thinkingObserver.observe(document.querySelector("main"), { childList: true, subtree: true });
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
                    if (!refreshing && confirm(t("app.reloadPrompt")))
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
                throw new Error(t("app.textApiConfigError"));
            }

            let languageAPI: AI.LanguageAPI;
            try
            {
                languageAPI = AI.createLanguageAPI(this.config.languageAPI);
                await languageAPI.check();
            }
            catch (error)
            {
                throw new Error(t("app.languageApiConfigError"));
            }

            let imageAPI: AI.ImageAPI;
            try
            {
                imageAPI = AI.createImageAPI(this.config.imageAPI);
                await imageAPI.check();
            }
            catch (error)
            {
                throw new Error(t("app.imageApiConfigError"));
            }

            AI.textAPI = textAPI;
            AI.languageAPI = languageAPI;
            AI.imageAPI = imageAPI;
        }
        catch (error)
        {
            UI.Dialog.error(error);
            Views.navigate("Settings");
        }
    }

    private static isThinking = false;
    public static beginThinking()
    {
        this.isThinking = true;
        for (const element of [Views.homeElement, Views.storyElement, Views.worldElement, Views.settingsElement])
        {
            if (!element)
                continue;

            this.setThinking(element, true);
        }
    }

    public static stopThinking()
    {
        this.isThinking = false;

        for (const element of [Views.homeElement, Views.storyElement, Views.worldElement, Views.settingsElement])
        {
            if (!element)
                continue;

            this.setThinking(element, false);
        }
    }

    private static setThinking(element: Element, value: boolean)
    {
        for (const indicator of element.querySelectorAll(".thinking-indicator"))
            indicator.classList.toggle("show", value);
        for (const button of element.querySelectorAll("button, input, select, textarea, multi-select, combo-select, auto-correct-text-area, semantic-version-input") as NodeListOf<any>)
            button.disabled = value;
        for (const button of element.querySelectorAll("img") as NodeListOf<any>)
            button.classList.toggle("disabled", value);
    }

    private static thinkingObserver = new MutationObserver((mutations) =>
    {
        mutations.forEach((mutation) =>
        {
            mutation.addedNodes.forEach((node) =>
            {
                if (node instanceof Element)
                {
                    this.setThinking(node, this.isThinking);
                }
            });
        });
    });
}