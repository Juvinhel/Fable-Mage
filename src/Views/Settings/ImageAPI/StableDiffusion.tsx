namespace Views.Settings.ImageAPI
{
    export function stableDiffusion(config: Partial<Data.StableDiffusionEndpoint>)
    {
        return <div id="stable-diffusion-api">
            <label>{ t("common.url") }</label>
            <input name="url" type="text" value={ config.url ?? "" } placeholder={ t("apiSettings.stableDiffusionUrl") } />

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