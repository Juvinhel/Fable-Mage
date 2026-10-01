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
                                    <option value="AnythingLLM">AnythingLLM</option>
                                    <option value="Gemini">Gemini</option>
                                    <option value="KoboldCPP">KoboldCPP</option>
                                </select> as HTMLSelectElement }
                            </div>
                            <div>
                                <label>ImageAPI:</label>
                                { this.imageAPISelect = <select onchange={ () => this.imageAPIChange() }>
                                    <option value="AnythingLLM">AnythingLLM</option>
                                    <option value="Gemini">Gemini</option>
                                    <option value="KoboldCPP">KoboldCPP</option>
                                    <option value="None">None</option>
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
                case "AnythingLLM":
                    this.textAPISelect.after(this.anythingLLMTextAPI(App.config.textAPI as any));
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
                case "AnythingLLM":
                    this.imageAPISelect.after(this.anythingLLMTextAPI(App.config.imageAPI as any));
                    break;
                case "None":
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
                    <input name="url" type="text" value={ config.url ?? "" } placeholder="KoboldCPP server URL" />
                </div>
                <div>
                    <label>Username:</label>
                    <input name="username" type="text" value={ config.username ?? "" } placeholder="Optional username" />
                </div>
                <div>
                    <label>Password:</label>
                    <input name="password" type="password" value={ config.password ?? "" } placeholder="Optional password" />
                </div>
                <div>
                    <label>Max Length:</label>
                    <input name="max_length" type="number" min="0" value={ config.max_length ?? "" } placeholder="Leave blank for automatic calculation." />
                </div>
            </div>;
        }

        private geminiTextAPI(config: Partial<Data.GeminiEndpoint>)
        {
            return <div class="gemini-api">
                <div>
                    <label>API Key:</label>
                    <input name="api_key" type="password" value={ config.api_key ?? "" } placeholder="Gemini API key" />
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

        private anythingLLMTextAPI(config: Partial<Data.AnythingLLMEndpoint>)
        {
            return <div class="anythingllm-api">
                <div>
                    <label>URL:</label>
                    <input name="url" type="text" value={ config.url ?? "" } placeholder="AnythingLLM server URL" onblur={ (e: FocusEvent) => this.refreshAnythingLLMModels(e.currentTarget as HTMLInputElement) } />
                </div>
                <div>
                    <label>API Key:</label>
                    <input name="api_key" type="password" value={ config.api_key ?? "" } placeholder="AnythingLLM API key" onblur={ (e: FocusEvent) => this.refreshAnythingLLMModels(e.currentTarget as HTMLInputElement) } />
                </div>
                <div>
                    <label>Workspace:</label>
                    <combo-select name="workspace" type="text" value={ config.workspace ?? "" } />
                </div>
            </div>;
        }

        private async refreshAnythingLLMModels(input: HTMLInputElement)
        {
            const apiElement = input.closest(".anythingllm-api");
            const urlInput = apiElement?.querySelector<HTMLInputElement>("input[name=\"url\"]");
            const apiKeyInput = apiElement?.querySelector<HTMLInputElement>("input[name=\"api_key\"]");
            const workspaceSelect = apiElement?.querySelector("combo-select") as any;
            const url = urlInput?.value.trim();
            const apiKey = apiKeyInput?.value?.trim();
            if (!url || !apiKey) return;

            const config: Data.AnythingLLMEndpoint = {
                name: "AnythingLLM",
                url,
                api_key: apiKey,
                workspace: workspaceSelect.value
            };

            try
            {
                const models = await new AI.AnythingLLM.API(config).getModels();
                if (urlInput.value.trim() != url || apiKeyInput.value != apiKey) return;
                workspaceSelect.options = models.map(model => ({ title: model, value: model }));
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        private geminiImageAPI(config: Partial<Data.GeminiEndpoint>)
        {
            return <div class="gemini-api">
                <div>
                    <label>API Key:</label>
                    <input name="api_key" type="text" value={ config.api_key ?? "" } placeholder="Gemini API key" />
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
                    <input name="url" type="text" value={ config.url ?? "" } placeholder="KoboldCPP server URL" />
                </div>
                <div>
                    <label>Username:</label>
                    <input name="username" type="text" value={ config.username ?? "" } placeholder="Optional username" />
                </div>
                <div>
                    <label>Password:</label>
                    <input name="password" type="password" value={ config.password ?? "" } placeholder="Optional password" />
                </div>
            </div>;
        }

        private stableDiffusionAPI(config: Partial<Data.StableDiffusionEndpoint>)
        {
            return <div class="stable-diffusion-api">
                <div>
                    <label>URL:</label>
                    <input name="url" type="text" value={ config.url ?? "" } placeholder="Stable Diffusion server URL" />
                </div>
                <div>
                    <label>Username:</label>
                    <input name="username" type="text" value={ config.username ?? "" } placeholder="Optional username" />
                </div>
                <div>
                    <label>Password:</label>
                    <input name="password" type="password" value={ config.password ?? "" } placeholder="Optional password" />
                </div>
            </div>;
        }

        private getConfig(apiElement: HTMLElement): any
        {
            const ret: { [key: string]: string; } = {};

            for (const label of apiElement.querySelectorAll("label"))
            {
                const input = label.nextElementSibling as HTMLInputElement;
                const name = input.getAttribute("name");

                let value: any;
                if (input.type == "number")
                    value = input.value == "" ? undefined : parseFloat(input.value);
                else if (input.type == "checkbox" || input.type == "radio")
                    value = input.checked;
                else
                    value = input.value;
                ret[name] = value;
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
                    console.error(error);
                    throw new Error("Something went wrong with your text api config!");
                }

                const imageAPIConfig: any = this.imageAPISelect.nextElementSibling ? this.getConfig(this.imageAPISelect.nextElementSibling as HTMLElement) : {};
                let imageAPI: AI.ImageAPI;
                try
                {
                    imageAPIConfig.name = this.imageAPISelect.value;
                    imageAPI = AI.createImageAPI(imageAPIConfig);
                    await imageAPI.check();
                }
                catch (error)
                {
                    console.error(error);
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

