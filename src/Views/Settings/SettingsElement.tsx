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
        private languageAPISelect: HTMLSelectElement;
        private imageAPISelect: HTMLSelectElement;
        private summaryIntervalInput: HTMLInputElement;
        private versionValue: HTMLSpanElement;
        private buildTimeValue: HTMLSpanElement;

        private build()
        {
            return <>
                <tab-control>
                    <div id="ai-tab" class="data-view" tab-header={ t("settings.ai") }>
                        <div class="property-list">
                            <label>{ t("settings.textApi") }</label>
                            <div>
                                { this.textAPISelect = <select onchange={ () => this.textAPIChange() }>
                                    <option value="AnythingLLM">AnythingLLM</option>
                                    <option value="Gemini">Gemini</option>
                                    <option value="KoboldCPP">KoboldCPP</option>
                                    <option value="LMStudio">LM Studio</option>
                                </select> as HTMLSelectElement }
                            </div>

                            <label>{ t("settings.imageApi") }</label>
                            <div>
                                { this.imageAPISelect = <select onchange={ () => this.imageAPIChange() }>
                                    <option value="AnythingLLM">AnythingLLM</option>
                                    <option value="ComfyUI">ComfyUI</option>
                                    <option value="Gemini">Gemini</option>
                                    <option value="KoboldCPP">KoboldCPP</option>
                                    <option value="None">{ t("common.none") }</option>
                                    <option value="Stable Diffusion">Stable Diffusion</option>
                                </select> as HTMLSelectElement }
                            </div>

                            <label>{ t("settings.languageApi") }</label>
                            <div>
                                { this.languageAPISelect = <select onchange={ () => this.languageAPIChange() }>
                                    <option value="LanguageTool">LanguageTool</option>
                                    <option value="None">{ t("common.none") }</option>
                                </select> as HTMLSelectElement }
                            </div>

                            <div class="group">
                                <label>{ t("settings.summaryInterval") }</label>
                                { this.summaryIntervalInput = <input type="number" min="5" step="1" placeholder={ t("settings.defaultFive") } /> as HTMLInputElement }
                                <p>{ t("settings.summaryIntervalHelp") }</p>
                            </div>
                        </div>

                        <div class="anchor" />

                        <div class="actions">
                            <button title={ t("common.cancel") } onclick={ () => this.onCancel() }><color-icon src="img/icons/cancel.svg" /><span>{ t("common.cancel") }</span></button>
                            <button title={ t("common.save") } onclick={ () => this.onSave() }><color-icon src="img/icons/save.svg" /><span>{ t("common.save") }</span></button>
                        </div>
                    </div>
                    { new NexusSettingsElement() }
                    <div id="info-tab" class="data-view" tab-header={ t("settings.info") }>
                        <div class="property-list">
                            <label>{ t("settings.version") }</label>
                            { this.versionValue = <span>{ t("common.loading") }</span> as HTMLSpanElement }

                            <label>{ t("settings.buildTime") }</label>
                            { this.buildTimeValue = <span>{ t("common.loading") }</span> as HTMLSpanElement }

                            <label>{ t("settings.developer") }</label>
                            <span>Juvinhel</span>

                            <label>{ t("settings.repository") }</label>
                            <a href="https://github.com/Juvinhel/Fable-Mage" target="_blank" rel="noopener noreferrer">{ t("settings.github") }</a>

                            <p>{ t("settings.reportBug") } <a href="https://github.com/Juvinhel/Fable-Mage/issues" target="_blank" rel="noopener noreferrer">{ t("settings.issuesPage") }</a>.</p>
                        </div>

                        <div class="anchor" />

                        <div />
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
                this.versionValue.textContent = manifest.version ?? t("common.unknown");
                const buildDate = manifest["build-date"] ? new Date(manifest["build-date"]) : undefined;
                this.buildTimeValue.textContent = buildDate && !Number.isNaN(buildDate.getTime()) ? buildDate.toLocaleString() : t("common.unknown");
            }
            catch (error)
            {
                console.error(error);
                this.versionValue.textContent = t("common.unavailable");
                this.buildTimeValue.textContent = t("common.unavailable");
            }
        }

        private load()
        {
            this.summaryIntervalInput.value = App.config.summaryInterval?.toString() ?? "";

            for (const option of this.textAPISelect.querySelectorAll("option"))
                option.selected = option.value == App.config.textAPI.name;
            this.textAPIChange();

            for (const option of this.imageAPISelect.querySelectorAll("option"))
                option.selected = option.value == App.config.imageAPI.name;
            this.imageAPIChange();

            for (const option of this.languageAPISelect.querySelectorAll("option"))
                option.selected = option.value == App.config.languageAPI.name;
            this.languageAPIChange();
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

        private languageAPIChange()
        {
            const apiName = this.languageAPISelect.value;

            this.languageAPISelect.nextElementSibling?.remove();
            switch (apiName)
            {
                case "LanguageTool":
                    this.languageAPISelect.after(Views.Settings.LanguageAPI.languageTool(App.config.languageAPI as Partial<Data.LanguageToolEndpoint>));
                    break;
                case "None":
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
                if (!this.summaryIntervalInput.checkValidity())
                {
                    this.summaryIntervalInput.reportValidity();
                    return;
                }

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
                    throw new Error(t("app.textApiConfigError"));
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
                    throw new Error(t("app.imageApiConfigError"));
                }

                const languageAPIConfig: Data.LanguageToolEndpoint | Data.NoneLanguageEndpoint = this.languageAPISelect.value == "None"
                    ? { name: "None" }
                    : this.getConfig(this.languageAPISelect.nextElementSibling as HTMLElement);
                let languageAPI: AI.LanguageAPI;
                try
                {
                    languageAPIConfig.name = this.languageAPISelect.value as "LanguageTool" | "None";
                    languageAPI = AI.createLanguageAPI(languageAPIConfig);
                    await languageAPI.check();
                }
                catch (error)
                {
                    console.error(error);
                    throw new Error(t("app.languageApiConfigError"));
                }

                App.config.textAPI = textAPIConfig;
                App.config.imageAPI = imageAPIConfig;
                App.config.languageAPI = languageAPIConfig;
                App.config.summaryInterval = this.summaryIntervalInput.value === "" ? undefined : this.summaryIntervalInput.valueAsNumber;
                Data.saveConfig(App.config);

                AI.textAPI = textAPI;
                AI.imageAPI = imageAPI;
                AI.languageAPI = languageAPI;

                UI.Dialog.message({ title: t("settings.savedTitle"), text: t("settings.savedMessage") });
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
