namespace Views.Settings
{
    export class SettingsElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());

            this.load();
            this.loadInfo();
        }

        private textAPISelect: HTMLSelectElement;
        private imageAPISelect: HTMLSelectElement;
        private versionValue: HTMLSpanElement;
        private buildTimeValue: HTMLSpanElement;

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
                                    <option value="LMStudio">LM Studio</option>
                                </select> as HTMLSelectElement }
                            </div>
                            <div>
                                <label>ImageAPI:</label>
                                { this.imageAPISelect = <select onchange={ () => this.imageAPIChange() }>
                                    <option value="AnythingLLM">AnythingLLM</option>
                                    <option value="ComfyUI">ComfyUI</option>
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
                    <div class="info-tab" tab-header="Info">
                        <div>
                            <label>Version:</label>
                            { this.versionValue = <span>Loading...</span> as HTMLSpanElement }
                        </div>
                        <div>
                            <label>Build time:</label>
                            { this.buildTimeValue = <span>Loading...</span> as HTMLSpanElement }
                        </div>
                        <div>
                            <label>Developer:</label>
                            <span>Juvinhel</span>
                        </div>
                        <div>
                            <label>Repository:</label>
                            <a href="https://github.com/Juvinhel/Fable-Mage" target="_blank" rel="noopener noreferrer">GitHub</a>
                        </div>
                        <p>Found a bug? Please report it on the <a href="https://github.com/Juvinhel/Fable-Mage/issues" target="_blank" rel="noopener noreferrer">GitHub issues page</a>.</p>
                    </div>
                </tab-control>
            </>;
        }

        private async loadInfo()
        {
            try
            {
                const response = await fetch("manifest.json");
                if (!response.ok)
                    throw new Error(`Unable to load app manifest (${ response.status }).`);

                const manifest = await response.json() as { version?: string; "build-date"?: string; };
                this.versionValue.textContent = manifest.version ?? "Unknown";
                const buildDate = manifest["build-date"] ? new Date(manifest["build-date"]) : undefined;
                this.buildTimeValue.textContent = buildDate && !Number.isNaN(buildDate.getTime()) ? buildDate.toLocaleString() : "Unknown";
            }
            catch (error)
            {
                console.error(error);
                this.versionValue.textContent = "Unavailable";
                this.buildTimeValue.textContent = "Unavailable";
            }
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
                    this.textAPISelect.after(Views.Settings.TextAPI.koboldCPP(App.config.textAPI as Partial<Data.KoboldCPPEndpoint>));
                    break;
                case "Gemini":
                    this.textAPISelect.after(Views.Settings.TextAPI.gemini(App.config.textAPI as Partial<Data.GeminiEndpoint>));
                    break;
                case "AnythingLLM":
                    this.textAPISelect.after(Views.Settings.TextAPI.anythingLLM(App.config.textAPI as Partial<Data.AnythingLLMEndpoint>));
                    break;
                case "LMStudio":
                    this.textAPISelect.after(Views.Settings.TextAPI.lmStudio(App.config.textAPI as Partial<Data.LMStudioEndpoint>));
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
                    this.imageAPISelect.after(Views.Settings.ImageAPI.koboldCPP(App.config.imageAPI as Partial<Data.KoboldCPPEndpoint>));
                    break;
                case "Gemini":
                    this.imageAPISelect.after(Views.Settings.ImageAPI.gemini(App.config.imageAPI as Partial<Data.GeminiEndpoint>));
                    break;
                case "AnythingLLM":
                    this.imageAPISelect.after(Views.Settings.ImageAPI.anythingLLM(App.config.imageAPI as Partial<Data.AnythingLLMEndpoint>));
                    break;
                case "ComfyUI":
                    this.imageAPISelect.after(Views.Settings.ImageAPI.comfyUI(App.config.imageAPI as Partial<Data.ComfyUIEndpoint>));
                    break;
                case "None":
                    break;
                case "Stable Diffusion":
                    this.imageAPISelect.after(Views.Settings.ImageAPI.stableDiffusion(App.config.imageAPI as Partial<Data.StableDiffusionEndpoint>));
                    break;
            }
        }

        private getConfig(apiElement: HTMLElement): any
        {
            const ret: { [key: string]: string; } = {};

            for (const element of apiElement.querySelectorAll<HTMLElement>("input[name], select[name], combo-select[name]"))
            {
                const input = element as HTMLInputElement;
                const name = element.getAttribute("name");

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
