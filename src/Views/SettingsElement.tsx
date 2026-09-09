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

        private textAPISelect: HTMLSelectElement;
        private imageAPISelect: HTMLSelectElement;

        private build()
        {
            return <>
                <div>
                    <div>
                        <label>TextAPI:</label>
                        { this.textAPISelect = <select onchange={ () => this.textAPIChange() }>
                            <option value="KoboldCPP">KoboldCPP</option>
                        </select> as HTMLSelectElement }
                    </div>
                    <div>
                        <label>ImageAPI:</label>
                        { this.imageAPISelect = <select onchange={ () => this.imageAPIChange() }>
                            <option value="KoboldCPP">KoboldCPP</option>
                            <option value="Diffusion">Diffusion</option>
                        </select> as HTMLSelectElement }
                    </div>
                </div>

                <div>
                    <button title="Cancel" onclick={ () => this.onCancel() }><color-icon src="img/icons/cancel.svg" /><span>Cancel</span></button>
                    <button title="Save" onclick={ () => this.onSave() }><color-icon src="img/icons/save.svg" /><span>Save</span></button>
                </div>
            </>;
        }

        private connectedCallback()
        {
            this.load();
        }

        private load()
        {
            for (const option of this.textAPISelect.querySelectorAll("option"))
                option.selected = option.value == App.config.TextAPI.name;
            this.textAPIChange();

            for (const option of this.imageAPISelect.querySelectorAll("option"))
                option.selected = option.value == App.config.ImageAPI.name;
            this.imageAPIChange();
        }

        private textAPIChange()
        {
            const apiName = this.textAPISelect.value;

            this.textAPISelect.nextElementSibling?.remove();
            switch (apiName)
            {
                case "KoboldCPP":
                    this.textAPISelect.after(this.koboldCPPTextAPI(App.config.TextAPI));
                    break;
            }
        }

        private imageAPIChange()
        {
            const apiName = this.imageAPISelect.value;

            this.imageAPISelect.nextElementSibling?.remove();
            switch (apiName)
            {
                case "KoboldCPP":
                    this.imageAPISelect.after(this.koboldCPPImageAPI(App.config.ImageAPI as any));
                    break;
                case "Diffusion":
                    this.imageAPISelect.after(this.diffusionImageAPI(App.config.ImageAPI as any));
                    break;
            }
        }

        private koboldCPPTextAPI(config: Partial<Data.KoboldCPPEndpoint>)
        {
            return <div class="koboldcpp-api">
                <div>
                    <label>URL:</label>
                    <input name="url" type="text" value={ config.url ?? "" } />
                </div>
                <div>
                    <label>Username:</label>
                    <input name="username" type="text" value={ config.username ?? "" } />
                </div>
                <div>
                    <label>Password:</label>
                    <input name="password" type="password" value={ config.password ?? "" } />
                </div>
                <div>
                    <label>Max Content Size:</label>
                    <input name="textGenerationMaxLength" type="number" min="0" step="1" value={ config.textGenerationMaxLength ?? "" } />
                </div>
            </div>;
        }

        private koboldCPPImageAPI(config: Partial<Data.KoboldCPPEndpoint>)
        {
            return <div class="koboldcpp-api">
                <div>
                    <label>URL:</label>
                    <input name="url" type="text" value={ config.url ?? "" } />
                </div>
                <div>
                    <label>Username:</label>
                    <input name="username" type="text" value={ config.username ?? "" } />
                </div>
                <div>
                    <label>Password:</label>
                    <input name="password" type="password" value={ config.password ?? "" } />
                </div>
            </div>;
        }

        private diffusionImageAPI(config: Partial<Data.DiffusionEndpoint>)
        {
            return <div class="diffusion-api">
                <div>
                    <label>URL:</label>
                    <input name="url" type="text" value={ config.url ?? "" } />
                </div>
                <div>
                    <label>Username:</label>
                    <input name="username" type="text" value={ config.username ?? "" } />
                </div>
                <div>
                    <label>Password:</label>
                    <input name="password" type="password" value={ config.password ?? "" } />
                </div>
            </div>;
        }

        private getConfig(apiElement: HTMLElement): any
        {
            const ret: { [key: string]: string; } = {};

            for (const label of apiElement.querySelectorAll("label"))
            {
                const input = label.nextElementSibling as HTMLInputElement;

                let value: any;
                if (input.type == "number")
                    value = parseFloat(input.value);
                else
                    value = input.value;
                ret[input.name] = value;
            }
            return ret;
        }

        private onSave()
        {
            const textAPIConfig = this.getConfig(this.textAPISelect.nextElementSibling as HTMLElement);
            textAPIConfig.name = this.textAPISelect.value;
            App.config.TextAPI = textAPIConfig;

            const imageAPIConfig = this.getConfig(this.imageAPISelect.nextElementSibling as HTMLElement);
            imageAPIConfig.name = this.imageAPISelect.value,
                App.config.ImageAPI = imageAPIConfig;

            Data.saveConfig(App.config);
        }

        private onCancel()
        {
            this.load();
        }
    }

    customElements.define("my-settings", SettingsElement);
}

