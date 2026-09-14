namespace Views
{
    export function Nav()
    {
        return <nav>
            <button title="Home" onclick={ () => navigate("Home") }>Home</button>
            <button title="World" onclick={ () => navigate("World") }>World</button>
            <button title="Settings" onclick={ (e) => navigate("Settings") }>Settings</button>
            <button class="icon" onclick={ (e: Event) => toggleDropDown(e) }>
                <color-icon src="img/icons/menu.svg" />
            </button>
        </nav>;
    }

    function toggleDropDown(e: Event)
    {
        const toggleButton = e.currentTarget as HTMLElement;
        const nav = toggleButton.closest("nav");
        nav.classList.toggle("responsive");
    }

    export function navigate(target: "Home" | "World" | "Settings")
    {
        const nav = document.querySelector("nav");
        let button = nav.querySelector("button[title=\"" + target + "\"]") as HTMLButtonElement;
        let element;
        switch (target)
        {
            case "Home": element = new PlotElement(); break;
            case "World": element = new WorldElement(); break;
            case "Settings": element = new SettingsElement(); break;
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