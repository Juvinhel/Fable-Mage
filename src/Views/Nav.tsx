///<reference path="Story/StoryElement.tsx" />
///<reference path="World/WorldElement.tsx" />
///<reference path="Diagnostics/DiagnosticsElement.tsx" />
///<reference path="Settings/SettingsElement.tsx" />

namespace Views
{
    export function Nav()
    {
        homeElement = new HomeElement();
        storyElement = new Story.StoryElement();
        worldElement = new World.WorldElement();
        nexusElement = new Nexus.NexusElement();
        settingsElement = new Settings.SettingsElement();
        diagnosticsElement = new Diagnostics.DiagnosticsElement();

        return <nav>
            <div>
                <button data-target="Home" title={ t("navigation.home") } onclick={ () => navigate("Home") }><color-icon src="img/icons/castle.svg" /><span>{ t("navigation.home") }</span></button>
                <button data-target="Story" title={ t("navigation.story") } onclick={ () => navigate("Story") }><color-icon src="img/icons/book.svg" /><span>{ t("navigation.story") }</span></button>
                <button data-target="World" title={ t("navigation.world") } onclick={ () => navigate("World") }><color-icon src="img/icons/planet.svg" /><span>{ t("navigation.world") }</span></button>
                <button data-target="Nexus" title={ t("navigation.nexus") } onclick={ (e) => navigate("Nexus") }><color-icon src="img/icons/portal.svg" /><span>{ t("navigation.nexus") }</span></button>
                <button data-target="Settings" title={ t("navigation.settings") } onclick={ (e) => navigate("Settings") }><color-icon src="img/icons/gears.svg" /><span>{ t("navigation.settings") }</span></button>
                <button data-target="Diagnostics" title={ t("navigation.diagnostics") } onclick={ (e) => navigate("Diagnostics") }><color-icon src="img/icons/stethoscope.svg" /><span>{ t("navigation.diagnostics") }</span></button>
                <button class="drop-down-button" onclick={ (e: Event) => toggleDropDown(e) }>
                    <color-icon src="img/icons/menu.svg" />
                </button>
            </div>
        </nav>;
    }

    export let homeElement: HomeElement;
    export let storyElement: Story.StoryElement;
    export let worldElement: World.WorldElement;
    export let nexusElement: Nexus.NexusElement;
    export let settingsElement: Settings.SettingsElement;
    export let diagnosticsElement: Diagnostics.DiagnosticsElement;

    function toggleDropDown(e: Event)
    {
        const toggleButton = e.currentTarget as HTMLElement;
        const nav = toggleButton.closest("nav");
        nav.classList.toggle("open");
    }

    export function navigate(target: "Home" | "Story" | "World" | "Settings" | "Nexus" | "Diagnostics")
    {
        const nav = document.querySelector("nav");
        nav.classList.remove("open");
        let button = nav.querySelector("button[data-target=\"" + target + "\"]") as HTMLButtonElement;
        let element;
        switch (target)
        {
            case "Home": element = homeElement; break;
            case "Story": element = storyElement; break;
            case "World": element = worldElement; break;
            case "Diagnostics": element = diagnosticsElement; break;
            case "Settings": element = settingsElement; break;
            case "Nexus": element = nexusElement; break;
        }

        doNavigate(button, element);
    }

    function doNavigate(sender: HTMLButtonElement, element: HTMLElement)
    {
        const nav = sender.closest("nav");
        for (const button of nav.querySelectorAll("button"))
            button.classList.toggle("active", button == sender);

        const main = document.querySelector("main");
        main.clearChildren();
        main.appendChild(element);
    }
}