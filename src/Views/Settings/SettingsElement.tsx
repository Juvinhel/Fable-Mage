namespace Views.Settings
{
    export class SettingsElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());

            this.load();
        }

        private textAPISelect: HTMLSelectElement;
        private imageAPISelect: HTMLSelectElement;

        private build()
        {
            return <>
                <tab-control>
                    <div class="ai-tab" tab-header="AI">
                        <div>
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
                                    <option value="Gemini">Gemini</option>
                                    <option value="Stable Diffusion">Stable Diffusion</option>
                                </select> as HTMLSelectElement }
                            </div>
                        </div>

                        <div class="anchor" />

                        <div>
                            <button title="Cancel" onclick={ () => this.onCancel() }><color-icon src="img/icons/cancel.svg" /><span>Cancel</span></button>
                            <button title="Save" onclick={ () => this.onSave() }><color-icon src="img/icons/save.svg" /><span>Save</span></button>
                        </div>
                    </div>
                    { new NexusSettingsElement() }
                </tab-control>
            </>;
        }

        private load()
        {
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
                case "Gemini":
                    this.imageAPISelect.after(this.geminiImageAPI(App.config.imageAPI as any));
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
            </div>;
        }

        private geminiTextAPI(config: Partial<Data.GeminiEndpoint>)
        {
            return <div class="gemini-api">
                <div>
                    <label>API Key:</label>
                    <input name="api_key" type="text" value={ config.api_key ?? "" } />
                </div>
                <div>
                    <label>Model:</label>
                    <select name="model" value={ config.model ?? "gemini-3.8-flash" }>
                        <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
                        <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
                        <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    </select>
                </div>
            </div>;
        }

        private geminiImageAPI(config: Partial<Data.GeminiEndpoint>)
        {
            return <div class="gemini-api">
                <div>
                    <label>API Key:</label>
                    <input name="api_key" type="text" value={ config.api_key ?? "" } />
                </div>
                <div>
                    <label>Model:</label>
                    <select name="model" value={ config.model ?? "gemini-3.1-flash-image" }>
                        <option value="gemini-3.1-flash-image">Gemini 3.1 Flash Image</option>
                        <option value="gemini-3-pro-image">Gemini 3 Pro Image</option>
                    </select>
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

