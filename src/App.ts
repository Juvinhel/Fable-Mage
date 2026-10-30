class App
{
    public static async Start()
    {
        await this.startServiceWorker();

        this.config = await Data.loadConfig();
        this.language = App.config.language || navigator.language || "en";

        await Promise.all([
            Data.Localization.loadTranslations(),
            Services.Client.initialize()
        ]);

        document.body.prepend(Views.Nav());
        Views.navigate("Home");

        await this.initServices();

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
    public static language: string;

    public static extractor;

    public static async initServices()
    {
        try
        {
            let textAPI: Services.TextAPI;
            try
            {
                textAPI = Services.createTextAPI(this.config.textAPI);
                await textAPI.check();
            }
            catch (error)
            {
                throw new Error(t("app.textApiConfigError"));
            }

            let languageAPI: Services.LanguageAPI | undefined;
            try
            {
                languageAPI = Services.createLanguageAPI(this.config.languageAPI);
                await languageAPI?.check();
            }
            catch (error)
            {
                throw new Error(t("app.languageApiConfigError"));
            }

            let translationAPI: Services.TranslationAPI | undefined;
            try
            {
                translationAPI = Services.createTranslationAPI(this.config.translationAPI);
                await translationAPI?.check();
            }
            catch (error)
            {
                throw new Error(t("app.translationApiConfigError"));
            }

            let imageAPI: Services.ImageAPI | undefined;
            try
            {
                imageAPI = Services.createImageAPI(this.config.imageAPI);
                await imageAPI?.check();
            }
            catch (error)
            {
                throw new Error(t("app.imageApiConfigError"));
            }

            Services.textAPI = textAPI;
            Services.languageAPI = languageAPI;
            Services.translationAPI = translationAPI;
            Services.imageAPI = imageAPI;
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