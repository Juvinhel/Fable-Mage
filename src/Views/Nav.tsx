///<reference path="Story/StoryElement.tsx" />
///<reference path="World/WorldElement.tsx" />
///<reference path="SettingsElement.tsx" />

namespace Views
{
    export function Nav()
    {
        homeElement = new HomeElement();
        storyElement = new Story.StoryElement();
        worldElement = new World.WorldElement();
        settingsElement = new SettingsElement();

        return <nav>
            <button title="Home" onclick={ () => navigate("Home") }>Home</button>
            <button title="Story" onclick={ () => navigate("Story") }>Story</button>
            <button title="World" onclick={ () => navigate("World") }>World</button>
            <button title="Settings" onclick={ (e) => navigate("Settings") }>Settings</button>
            <button class="icon" onclick={ (e: Event) => toggleDropDown(e) }>
                <color-icon src="img/icons/menu.svg" />
            </button>
        </nav>;
    }

    export let homeElement: HomeElement;
    export let storyElement: Story.StoryElement;
    export let worldElement: World.WorldElement;
    export let settingsElement: SettingsElement;

    function toggleDropDown(e: Event)
    {
        const toggleButton = e.currentTarget as HTMLElement;
        const nav = toggleButton.closest("nav");
        nav.classList.toggle("responsive");
    }

    export function navigate(target: "Home" | "Story" | "World" | "Settings")
    {
        const nav = document.querySelector("nav");
        let button = nav.querySelector("button[title=\"" + target + "\"]") as HTMLButtonElement;
        let element;
        switch (target)
        {
            case "Home": element = homeElement; break;
            case "Story": element = storyElement; break;
            case "World": element = worldElement; break;
            case "Settings": element = settingsElement; break;
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