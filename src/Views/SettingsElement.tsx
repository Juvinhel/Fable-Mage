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
                    <label>Endpoint:</label>
                    <input type="text" value={ App.config.endpoint }
                        onkeyup={ (e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault; (e.currentTarget as HTMLElement).blur(); } } }
                        onblur={ (e: Event) => App.config.endpoint = (e.currentTarget as HTMLInputElement).value } />
                </div>

                <div>
                    <label>Username:</label>
                    <input type="text" value={ App.config.username ?? "" }
                        onkeyup={ (e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault; (e.currentTarget as HTMLElement).blur(); } } }
                        onblur={ (e: Event) =>
                        {
                            const value = (e.currentTarget as HTMLInputElement).value;
                            App.config.username = value ? value : null;
                        } } />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={ App.config.password ?? "" }
                        onkeyup={ (e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault; (e.currentTarget as HTMLElement).blur(); } } }
                        onblur={ (e: Event) =>
                        {
                            const value = (e.currentTarget as HTMLInputElement).value;
                            App.config.password = value ? value : null;
                        } } />
                </div>

                <div>
                    <label>Max Content Size:</label>
                    <input type="number" value={ App.config.textGenerationMaxLength }
                        onkeyup={ (e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault; (e.currentTarget as HTMLElement).blur(); } } }
                        onblur={ (e: Event) => App.config.textGenerationMaxLength = parseInt((e.currentTarget as HTMLInputElement).value) } />
                </div>
            </>;
        }
    }

    customElements.define("my-settings", SettingsElement);
}

