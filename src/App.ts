class App
{
    public static async Start()
    {
        this.config = await Data.loadConfig();
        await AI.Client.initialize();

        document.addEventListener("visibilitychange", App.visibilityChange);

        const main = document.querySelector("main");
        main.appendChild(this.storyElement = new Views.StoryElement());

        const story = localStorage.get<Data.Story>("current-story") ?? await (await fetch("templates/sample-story.json")).json();
        this.storyElement.importStory(story);
    }

    private static visibilityChange = function (this: typeof App, event: Event)
    {
        if (document.visibilityState == "hidden")
        {
            Data.saveConfig(this.config);

            try
            {
                const currentStory = this.storyElement.exportStory(true, true);
                localStorage.set("current-story", currentStory);
            } catch { }
        }
    }.bind(this);

    public static config: Data.Config;
    private static storyElement: Views.StoryElement;;
}