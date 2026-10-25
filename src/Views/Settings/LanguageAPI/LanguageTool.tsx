namespace Views.Settings.LanguageAPI
{
    export function languageTool(config: Partial<Data.LanguageToolEndpoint>)
    {
        return <div id="languagetool-api">
            <label>{ t("apiSettings.languageToolUrlLabel") }</label>
            <input name="url" type="text" value={ config.url ?? "" } placeholder={ t("apiSettings.languageToolUrl") } />

            <label>{ t("common.apiKey") }</label>
            <input name="api_key" type="password" value={ config.api_key ?? "" } placeholder={ t("apiSettings.languageToolKey") } />

            <div class="group">
                <label>{ t("common.username") }</label>
                <input name="username" type="text" value={ config.username ?? "" } placeholder={ t("apiSettings.optionalUsername") } />

                <label>{ t("common.password") }</label>
                <input name="password" type="password" value={ config.password ?? "" } placeholder={ t("apiSettings.optionalPassword") } />

                <p>{ t("apiSettings.basicAuthHelp") }</p>
            </div>
        </div>;
    }
}
