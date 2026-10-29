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
        private languageAPISelect: HTMLSelectElement;

        private localeSelect: HTMLSelectElement;
        private imageStyleSelect: HTMLSelectElement;
        private customImageStylesGroup: HTMLOptGroupElement;
        private imageStyleCloneButton: HTMLButtonElement;
        private imageStyleEditButton: HTMLButtonElement;
        private imageStyleDeleteButton: HTMLButtonElement;
        private imageStylePreviewSpan: HTMLSpanElement;
        private summaryIntervalInput: HTMLInputElement;

        private build()
        {
            return <>
                <tab-control>
                    <div id="common-tab" class="data-view" tab-header={ t("settings.common") }>
                        <div class="property-list">
                            <label>{ t("settings.language") }</label>
                            { this.localeSelect = <select>
                                <option value="">{ t("settings.browserLanguage") }</option>
                                <option value="en">{ t("settings.english") }</option>
                                <option value="de">{ t("settings.german") }</option>
                                <option value="fr">{ t("settings.french") }</option>
                            </select> as HTMLSelectElement }

                            <label>{ t("settings.imageStyle") }</label>
                            <div>
                                <div class="function-stack">
                                    { this.imageStyleSelect = <select onchange={ () => this.imageStyleChange() }>
                                        <option value="" >{ t("common.none") }</option>
                                        <optgroup label={ t("common.built-in") } >
                                            { Data.BuiltInImageStyles.sortBy(x => x.name).map(style => <option value={ style.name }>{ style.name }</option>) }
                                        </optgroup>
                                        { this.customImageStylesGroup = <optgroup label={ t("common.custom") }>
                                            { App.config.customImageStyles.map(style => <option value={ style.name } data-prefix={ style.prefix } data-suffix={ style.suffix }>{ style.name }</option>) }
                                        </optgroup> as HTMLOptGroupElement }
                                    </select> as HTMLSelectElement }
                                    <button class="icon-button" title={ t("settings.createImageStyle") } onclick={ () => this.createImageStyle() }><color-icon src="img/icons/add.svg" /></button>
                                    { this.imageStyleCloneButton = <button class="icon-button" title={ t("settings.cloneImageStyle") } onclick={ () => this.cloneImageStyle() }><color-icon src="img/icons/clone.svg" /></button> as HTMLButtonElement }
                                    { this.imageStyleEditButton = <button class="icon-button" title={ t("settings.editImageStyle") } onclick={ () => this.editImageStyle() }><color-icon src="img/icons/edit.svg" /></button> as HTMLButtonElement }
                                    { this.imageStyleDeleteButton = <button class="icon-button" title={ t("settings.deleteImageStyle") } onclick={ () => this.deleteImageStyle() }><color-icon src="img/icons/delete.svg" /></button> as HTMLButtonElement }
                                </div>
                                <p>Preview: { this.imageStylePreviewSpan = <span class="inactive" /> as HTMLSpanElement }</p>

                            </div>

                            <label>{ t("settings.summaryInterval") }</label>
                            { this.summaryIntervalInput = <input type="number" min="5" step="1" placeholder={ t("settings.defaultFive") } /> as HTMLInputElement }
                            <p>{ t("settings.summaryIntervalHelp") }</p>
                        </div>

                        <div class="anchor" />

                        <div class="actions">
                            <button title={ t("common.cancel") } onclick={ () => this.onCancel() }><color-icon src="img/icons/cancel.svg" /><span>{ t("common.cancel") }</span></button>
                            <button title={ t("common.save") } onclick={ () => this.onSave() }><color-icon src="img/icons/save.svg" /><span>{ t("common.save") }</span></button>
                            <button title={ t("common.export") } onclick={ () => this.onExport() }><color-icon src="img/icons/save.svg" /><span>{ t("common.export") }</span></button>
                            <button title={ t("common.import") } onclick={ () => this.onImport() }><color-icon src="img/icons/open.svg" /><span>{ t("common.import") }</span></button>
                        </div>
                    </div>
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
                        </div>

                        <div class="anchor" />

                        <div class="actions">
                            <button title={ t("common.cancel") } onclick={ () => this.onCancel() }><color-icon src="img/icons/cancel.svg" /><span>{ t("common.cancel") }</span></button>
                            <button title={ t("common.save") } onclick={ () => this.onSave() }><color-icon src="img/icons/save.svg" /><span>{ t("common.save") }</span></button>
                            <button title={ t("common.export") } onclick={ () => this.onExport() }><color-icon src="img/icons/save.svg" /><span>{ t("common.export") }</span></button>
                            <button title={ t("common.import") } onclick={ () => this.onImport() }><color-icon src="img/icons/open.svg" /><span>{ t("common.import") }</span></button>
                        </div>
                    </div>
                    { new NexusSettingsElement() }
                    { new InfoElement() }
                </tab-control>
            </>;
        }

        private load()
        {
            this.localeSelect.value = App.config.language ?? "";
            this.summaryIntervalInput.value = App.config.summaryInterval?.toString() ?? "";
            this.imageStyleSelect.value = App.config.imageStyle ?? "";
            this.imageStyleChange();

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

        private imageStyleChange()
        {
            this.imageStyleCloneButton.disabled = !this.selectedImageStyle;
            const isCustomStyleSelected = this.imageStyleSelect.selectedOptions[0]?.getAttribute("data-prefix") != null;
            this.imageStyleEditButton.disabled = !isCustomStyleSelected;
            this.imageStyleDeleteButton.disabled = !isCustomStyleSelected;
            this.imageStylePreviewSpan.textContent = this.selectedImageStyle?.prefix;
        }

        private get customImageStyleNames(): string[]
        {
            return this.imageStyleSelect.options.filter(option => option.getAttribute("data-prefix") != null).map(option => option.value);
        }

        private get customImageStyles(): Data.ImageStyle[]
        {
            const ret: Data.ImageStyle[] = [];
            for (const option of this.imageStyleSelect.options)
                if (option.getAttribute("data-prefix") != null)
                {
                    ret.push({
                        name: option.value,
                        prefix: option.getAttribute("data-prefix"),
                        suffix: option.getAttribute("data-suffix")
                    });
                }
            return ret;
        }

        private get selectedImageStyle(): Data.ImageStyle | undefined
        {
            const selectedOption = this.imageStyleSelect.selectedOptions[0];
            if (!selectedOption.value) return undefined;

            const builtInStyle = Data.BuiltInImageStyles.first(x => x.name == selectedOption.value);
            if (builtInStyle) return builtInStyle;

            const customStyle: Data.ImageStyle = {
                name: selectedOption.value,
                prefix: selectedOption.getAttribute("data-prefix"),
                suffix: selectedOption.getAttribute("data-suffix")
            };
            return customStyle;
        }

        private async createImageStyle()
        {
            const imageStyle = await ImageStyleEdit(
                { name: "", prefix: "", suffix: "" },
                this.customImageStyleNames,
                t("settings.createImageStyleTitle")
            );
            if (!imageStyle) return;

            const option = <option selected value={ imageStyle.name } data-prefix={ imageStyle.prefix } data-suffix={ imageStyle.suffix }>{ imageStyle.name }</option>;
            this.customImageStylesGroup.append(option);
            this.imageStyleChange();
        }

        private async cloneImageStyle()
        {
            const selectedStyle = this.selectedImageStyle;
            if (!selectedStyle) return;

            const copySuffix = t("settings.imageStyleCopySuffix");
            const name = `${ selectedStyle.name } (${ copySuffix })`;

            const imageStyle = await ImageStyleEdit(
                { ...selectedStyle, name },
                this.customImageStyleNames,
                t("settings.cloneImageStyleTitle")
            );
            if (!imageStyle) return;

            const option = <option selected value={ imageStyle.name } data-prefix={ imageStyle.prefix } data-suffix={ imageStyle.suffix }>{ imageStyle.name }</option>;
            this.customImageStylesGroup.append(option);
            this.imageStyleChange();
        }

        private async editImageStyle()
        {
            const selectedOption = this.imageStyleSelect.selectedOptions[0];
            const selectedImageStyle = this.selectedImageStyle;
            if (!selectedImageStyle || typeof selectedImageStyle == "string") return;

            const imageStyle = await ImageStyleEdit(
                selectedImageStyle,
                this.customImageStyleNames);
            if (!imageStyle) return;

            const option = <option selected value={ imageStyle.name } data-prefix={ imageStyle.prefix } data-suffix={ imageStyle.suffix }>{ imageStyle.name }</option>;
            selectedOption.replaceWith(option);
            this.imageStyleChange();
        }

        private async deleteImageStyle()
        {
            const selectedOption = this.imageStyleSelect.selectedOptions[0];
            if (!selectedOption) return;

            if (!await UI.Dialog.confirm({
                title: t("settings.deleteImageStyleTitle"),
                text: t("settings.deleteImageStyleConfirmation", { name: selectedOption.value })
            })) return;

            selectedOption.remove();
            this.imageStyleSelect.selectedIndex = 0;
            this.imageStyleChange();
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

        public async save(): Promise<boolean>
        {
            try
            {
                if (!this.summaryIntervalInput.checkValidity())
                {
                    this.summaryIntervalInput.reportValidity();
                    return false;
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

                const languageChanged = this.localeSelect.value != (App.config.language ?? "");
                App.config.language = this.localeSelect.value || undefined;
                App.config.imageStyle = this.imageStyleSelect.value || undefined;
                App.config.customImageStyles = this.customImageStyles;
                App.config.summaryInterval = this.summaryIntervalInput.value === "" ? undefined : this.summaryIntervalInput.valueAsNumber;

                App.config.textAPI = textAPIConfig;
                App.config.imageAPI = imageAPIConfig;
                App.config.languageAPI = languageAPIConfig;

                await Data.saveConfig(App.config);

                AI.textAPI = textAPI;
                AI.imageAPI = imageAPI;
                AI.languageAPI = languageAPI;

                if (languageChanged)
                {
                    window.location.reload();
                    return true;
                }

                UI.Dialog.message({ title: t("settings.savedTitle"), text: t("settings.savedMessage") });
                return true;
            }
            catch (error)
            {
                Views.navigate("Settings");
                UI.Dialog.error(error);
                return false;
            }
        }

        private onCancel()
        {
            this.load();
        }

        private onExport()
        {
            const { nexusAccount, ...config } = App.config;
            DownloadHelper.downloadData("fable-mage-config.json", config);
        }

        private async onImport()
        {
            try
            {
                const result = await UI.Dialog.upload({ multiple: false, title: t("common.import"), accept: "application/json,text/json,.json" });
                if (!result?.length)
                    return;

                const file = result.item(0);
                const importedConfig = JSON.parse(await file.text()) as Partial<Data.Config>;

                const previousConfig = App.config;
                const { nexusAccount, ...configToImport } = importedConfig;
                App.config = { ...previousConfig, ...configToImport };
                this.load();

                if (!await this.save())
                {
                    App.config = previousConfig;
                    this.load();
                }
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }
    }

    customElements.define("my-settings", SettingsElement);
}
