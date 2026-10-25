namespace Views.Settings.TextAPI
{
    export function koboldCPP(config: Partial<Data.KoboldCPPEndpoint>)
    {
        return <div id="koboldcpp-api">
            <label>{ t("common.url") }</label>
            <input name="url" type="text" value={ config.url ?? "" } placeholder={ t("apiSettings.koboldServerUrl") } />

            <label>{ t("apiSettings.maxLength") }</label>
            <input name="max_length" type="number" min="0" value={ config.max_length ?? "" } placeholder={ t("apiSettings.leaveBlankForAutomatic") } />

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