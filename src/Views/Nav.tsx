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
        diagnosticsElement = new Diagnostics.DiagnosticsElement();
        settingsElement = new Settings.SettingsElement();

        return <nav>
            <button title="Home" onclick={ () => navigate("Home") }>Home</button>
            <button title="Story" onclick={ () => navigate("Story") }>Story</button>
            <button title="World" onclick={ () => navigate("World") }>World</button>
            <button title="Nexus" onclick={ (e) => navigate("Nexus") }>Nexus</button>
            <button title="Diagnostics" onclick={ (e) => navigate("Diagnostics") }>Diagnostics</button>
            <button title="Settings" onclick={ (e) => navigate("Settings") }>Settings</button>
            <button class="icon" onclick={ (e: Event) => toggleDropDown(e) }>
                <color-icon src="img/icons/menu.svg" />
            </button>
        </nav>;
    }

    export let homeElement: HomeElement;
    export let storyElement: Story.StoryElement;
    export let worldElement: World.WorldElement;
    export let nexusElement: Nexus.NexusElement;
    export let diagnosticsElement: Diagnostics.DiagnosticsElement;
    export let settingsElement: Settings.SettingsElement;

    function toggleDropDown(e: Event)
    {
        const toggleButton = e.currentTarget as HTMLElement;
        const nav = toggleButton.closest("nav");
        nav.classList.toggle("responsive");
    }

    export function navigate(target: "Home" | "Story" | "World" | "Settings" | "Nexus" | "Diagnostics")
    {
        const nav = document.querySelector("nav");
        nav.classList.remove("responsive");
        let button = nav.querySelector("button[title=\"" + target + "\"]") as HTMLButtonElement;
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