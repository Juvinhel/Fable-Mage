namespace Views.Settings.TranslationAPI
{
    export function libreTranslate(config: Partial<Data.LibreTranslateEndpoint>)
    {
        return <div id="libretranslate-api">
            <label>{ t("apiSettings.libreTranslateUrlLabel") }</label>
            <input name="url" type="text" value={ config.url ?? "http://localhost:5000" } placeholder={ t("apiSettings.libreTranslateUrl") } />

            <label>{ t("common.apiKey") }</label>
            <input name="api_key" type="password" value={ config.api_key ?? "" } placeholder={ t("apiSettings.optionalApiKey") } />

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
