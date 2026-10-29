namespace Views.Settings.ImageAPI
{
    export function koboldCPP(config: Partial<Data.KoboldCPPEndpoint>)
    {
        return <div id="koboldcpp-api">
            <label>{ t("common.url") }</label>
            <input name="url" type="text" value={ config.url ?? "http://localhost:5001" } placeholder={ t("apiSettings.koboldServerUrl") } />

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