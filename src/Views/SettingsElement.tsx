namespace Views
{
    export class SettingsElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.title = "Settings";
            this.append(this.build());
        }

        private build()
        {
            return <>
                <div>
                    <div>
                        <label>Username:</label>
                        <input type="text" value={ App.config.TextAPI.username ?? "" }
                            onkeyup={ (e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault; (e.currentTarget as HTMLElement).blur(); } } }
                            onblur={ (e: Event) =>
                            {
                                const value = (e.currentTarget as HTMLInputElement).value;
                                App.config.TextAPI.username = value ? value : null;
                                App.config.ImageAPI.username = value ? value : null;
                            } } />
                    </div>
                    <div>
                        <label>Password:</label>
                        <input type="password" value={ App.config.TextAPI.password ?? "" }
                            onkeyup={ (e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault; (e.currentTarget as HTMLElement).blur(); } } }
                            onblur={ (e: Event) =>
                            {
                                const value = (e.currentTarget as HTMLInputElement).value;
                                App.config.TextAPI.password = value ? value : null;
                                App.config.ImageAPI.password = value ? value : null;
                            } } />
                    </div>

                    <div>
                        <label>Max Content Size:</label>
                        <input type="number" value={ App.config.TextAPI.textGenerationMaxLength }
                            onkeyup={ (e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault; (e.currentTarget as HTMLElement).blur(); } } }
                            onblur={ (e: Event) => App.config.TextAPI.textGenerationMaxLength = parseInt((e.currentTarget as HTMLInputElement).value) } />
                    </div>
                </div>

                <div />
            </>;
        }
    }

    customElements.define("my-settings", SettingsElement);
}

