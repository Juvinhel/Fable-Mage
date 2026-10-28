namespace Views.Settings
{
    export class InfoElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.id = "info-tab";
            this.className = "data-view";
            this.setAttribute("tab-header", t("settings.info"));
            this.append(this.build());
            this.load();
        }

        private versionValue: HTMLSpanElement;
        private buildTimeValue: HTMLSpanElement;

        private build()
        {
            return <>
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
            </>;
        }

        private async load()
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
    }

    customElements.define("my-info", InfoElement);
}