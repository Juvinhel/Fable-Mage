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

        private languageComboSelect: HTMLComboSelect;
        private textAPISelect: HTMLSelectElement;
        private imageAPISelect: HTMLSelectElement;

        private build()
        {
            return <>
                <div>
                    <div>
                        <label>Language:</label>
                        { this.languageComboSelect = <combo-select placeholder="Language" allowSearch={ false } options={ [
                            { title: "English", value: "English" },
                            { title: "German", value: "German" }] }
                            value="English" /> as HTMLComboSelect }
                    </div>
                    <div>
                        <label>TextAPI:</label>
                        { this.textAPISelect = <select onchange={ () => this.textAPIChange() }>
                            <option value="KoboldCPP">KoboldCPP</option>
                            <option value="Gemini">Gemini</option>
                        </select> as HTMLSelectElement }
                    </div>
                    <div>
                        <label>ImageAPI:</label>
                        { this.imageAPISelect = <select onchange={ () => this.imageAPIChange() }>
                            <option value="KoboldCPP">KoboldCPP</option>
                            <option value="Stable Diffusion">Stable Diffusion</option>
                        </select> as HTMLSelectElement }
                    </div>
                </div>

                <div class="anchor" />

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
            this.languageComboSelect.value = App.config.language ?? "English";

            for (const option of this.textAPISelect.querySelectorAll("option"))
                option.selected = option.value == App.config.textAPI.name;
            this.textAPIChange();

            for (const option of this.imageAPISelect.querySelectorAll("option"))
                option.selected = option.value == App.config.imageAPI.name;
            this.imageAPIChange();
        }

        private textAPIChange()
        {
            const apiName = this.textAPISelect.value;

            this.textAPISelect.nextElementSibling?.remove();
            switch (apiName)
            {
                case "KoboldCPP":
                    this.textAPISelect.after(this.koboldCPPTextAPI(App.config.textAPI as any));
                    break;
                case "Gemini":
                    this.textAPISelect.after(this.geminiTextAPI(App.config.textAPI as any));
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
                    this.imageAPISelect.after(this.koboldCPPImageAPI(App.config.imageAPI as any));
                    break;
                case "Stable Diffusion":
                    this.imageAPISelect.after(this.stableDiffusionAPI(App.config.imageAPI as any));
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
                    <label>Temperature:</label>
                    <input name="temperature" type="number" min="0" max="2" step="0.1" value={ config.temperature ?? "0.7" } />
                </div>
                <div>
                    <label>Max Content Size:</label>
                    <input name="textGenerationMaxLength" type="number" min="0" step="1" value={ config.textGenerationMaxLength ?? "" } />
                </div>
            </div>;
        }

        private geminiTextAPI(config: Partial<Data.GeminiEndpoint>)
        {
            return <div class="gemini-api">
                <div>
                    <label>API Key:</label>
                    <input name="api_key" type="text" value={ config.api_key ?? "" } />
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

        private stableDiffusionAPI(config: Partial<Data.StableDiffusionEndpoint>)
        {
            return <div class="stable-diffusion-api">
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

        private async onSave()
        {
            await this.save();
        }

        public async save()
        {
            try
            {
                const textAPIConfig = this.getConfig(this.textAPISelect.nextElementSibling as HTMLElement);
                let textAPI: AI.TextAPI;
                try
                {
                    textAPIConfig.name = this.textAPISelect.value;
                    textAPI = AI.createTextAPI(textAPIConfig);
                    await textAPI.check();
                }
                catch (error)
                {
                    throw new Error("Something went wrong with your text api config!");
                }

                const imageAPIConfig = this.getConfig(this.imageAPISelect.nextElementSibling as HTMLElement);
                let imageAPI: AI.ImageAPI;
                try
                {
                    imageAPIConfig.name = this.imageAPISelect.value;
                    imageAPI = AI.createImageAPI(imageAPIConfig);
                    await imageAPI.check();
                }
                catch (error)
                {
                    throw new Error("Something went wrong with your image api config!");
                }

                App.config.language = this.languageComboSelect.value;
                App.config.textAPI = textAPIConfig;
                App.config.imageAPI = imageAPIConfig;
                Data.saveConfig(App.config);

                AI.textAPI = textAPI;
                AI.imageAPI = imageAPI;

                UI.Dialog.message({ title: "Seetings Saved!", text: "Your settings have been saved." });
            }
            catch (error)
            {
                Views.navigate("Settings");
                UI.Dialog.error(error);
            }
        }

        private onCancel()
        {
            this.load();
        }
    }

    customElements.define("my-settings", SettingsElement);
}

