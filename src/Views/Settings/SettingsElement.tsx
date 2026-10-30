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

        private textAPISelect: APISelectElement;
        private imageAPISelect: APISelectElement;
        private languageAPISelect: APISelectElement;
        private translationAPISelect: APISelectElement;

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
                                            { App.config.customImageStyles?.map(style => <option value={ style.name } data-prefix={ style.prefix } data-suffix={ style.suffix }>{ style.name }</option>) }
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
                    <div id="services-tab" class="data-view" tab-header={ t("settings.services") }>
                        <div class="property-list">
                            <label>{ t("settings.textApi") }</label>
                            <div>
                                { this.textAPISelect = <select is="api-select">
                                    <option value="AnythingLLM" render={ Views.Settings.TextAPI.anythingLLM }>AnythingLLM</option>
                                    <option value="Gemini" render={ Views.Settings.TextAPI.gemini }>Gemini</option>
                                    <option value="KoboldCPP" render={ Views.Settings.TextAPI.koboldCPP }>KoboldCPP</option>
                                    <option value="LMStudio" render={ Views.Settings.TextAPI.lmStudio }>LM Studio</option>
                                </select> as APISelectElement }
                            </div>

                            <label>{ t("settings.imageApi") }</label>
                            <div>
                                { this.imageAPISelect = <select is="api-select">
                                    <option value="None">{ t("common.none") }</option>
                                    <option value="AnythingLLM" render={ Views.Settings.ImageAPI.anythingLLM }>AnythingLLM</option>
                                    <option value="ComfyUI" render={ Views.Settings.ImageAPI.comfyUI }>ComfyUI</option>
                                    <option value="Gemini" render={ Views.Settings.ImageAPI.gemini }>Gemini</option>
                                    <option value="KoboldCPP" render={ Views.Settings.ImageAPI.koboldCPP }>KoboldCPP</option>
                                    <option value="Stable Diffusion" render={ Views.Settings.ImageAPI.stableDiffusion }>Stable Diffusion</option>
                                </select> as APISelectElement }
                            </div>

                            <label>{ t("settings.languageApi") }</label>
                            <div>
                                { this.languageAPISelect = <select is="api-select">
                                    <option value="None">{ t("common.none") }</option>
                                    <option value="LanguageTool" render={ Views.Settings.LanguageAPI.languageTool }>LanguageTool</option>
                                </select> as APISelectElement }
                            </div>

                            <label>{ t("settings.translationApi") }</label>
                            <div>
                                { this.translationAPISelect = <select is="api-select">
                                    <option value="None">{ t("common.none") }</option>
                                    <option value="LibreTranslate" render={ Views.Settings.TranslationAPI.libreTranslate }>LibreTranslate</option>
                                </select> as APISelectElement }
                            </div>
                        </div>

                        <div class="anchor" />

                        <div class="actions">
                            <button title={ t("settings.connection-test") } onclick={ () => this.onCheck() }><color-icon src="img/icons/connection-test.svg" /><span>{ t("settings.connection-test") }</span></button>
                            <span />
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

            this.textAPISelect.load(App.config.textAPI);
            this.imageAPISelect.load(App.config.imageAPI);
            this.languageAPISelect.load(App.config.languageAPI);
            this.translationAPISelect.load(App.config.translationAPI);
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

                const textAPIConfig = this.textAPISelect.save();
                const textAPI = Services.createTextAPI(textAPIConfig);

                const imageAPIConfig = this.imageAPISelect.save();
                const imageAPI = imageAPIConfig ? Services.createImageAPI(imageAPIConfig) : null;

                const languageAPIConfig = this.languageAPISelect.save();
                const languageAPI = languageAPIConfig ? Services.createLanguageAPI(languageAPIConfig) : null;

                const translationAPIConfig = this.translationAPISelect.save();
                const translationAPI = translationAPIConfig ? Services.createTranslationAPI(translationAPIConfig) : null;

                const languageChanged = this.localeSelect.value != (App.config.language ?? "");
                App.config.language = this.localeSelect.value || undefined;
                App.config.imageStyle = this.imageStyleSelect.value || undefined;
                App.config.customImageStyles = this.customImageStyles.length == 0 ? undefined : this.customImageStyles;
                App.config.summaryInterval = this.summaryIntervalInput.value === "" ? undefined : this.summaryIntervalInput.valueAsNumber;

                App.config.textAPI = textAPIConfig;
                App.config.imageAPI = imageAPIConfig;
                App.config.languageAPI = languageAPIConfig;
                App.config.translationAPI = translationAPIConfig;

                await Data.saveConfig(App.config);

                Services.textAPI = textAPI;
                Services.imageAPI = imageAPI;
                Services.languageAPI = languageAPI;
                Services.translationAPI = translationAPI;

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

        private async onCheck()
        {
            const textAPIConfig = this.textAPISelect.save();
            let textAPI: Services.TextAPI;
            try
            {
                textAPIConfig.name = this.textAPISelect.value;
                textAPI = Services.createTextAPI(textAPIConfig);
                await textAPI.check();
            }
            catch (error)
            {
                console.error(error);
                throw new Error(t("app.textApiConfigError"));
            }

            const imageAPIConfig = this.imageAPISelect.save();
            let imageAPI: Services.ImageAPI | undefined;
            try
            {
                if (imageAPIConfig)
                {
                    imageAPIConfig.name = this.imageAPISelect.value;
                    imageAPI = Services.createImageAPI(imageAPIConfig);
                    await imageAPI?.check();
                }
            }
            catch (error)
            {
                console.error(error);
                throw new Error(t("app.imageApiConfigError"));
            }

            const languageAPIConfig = this.languageAPISelect.save();
            let languageAPI: Services.LanguageAPI | undefined;
            try
            {
                if (languageAPIConfig)
                {
                    languageAPIConfig.name = this.languageAPISelect.value as "LanguageTool";
                    languageAPI = Services.createLanguageAPI(languageAPIConfig);
                    await languageAPI?.check();
                }
            }
            catch (error)
            {
                console.error(error);
                throw new Error(t("app.languageApiConfigError"));
            }

            const translationAPIConfig = this.translationAPISelect.save();
            let translationAPI: Services.TranslationAPI | undefined;
            try
            {
                if (translationAPIConfig)
                {
                    translationAPIConfig.name = this.translationAPISelect.value as "LibreTranslate";
                    translationAPI = Services.createTranslationAPI(translationAPIConfig);
                    await translationAPI?.check();
                }
            }
            catch (error)
            {
                console.error(error);
                throw new Error(t("app.translationApiConfigError"));
            }

            UI.Dialog.message({ title: t("settings.checkedServicesTitle"), text: t("settings.checkedServicesMessage") });
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
