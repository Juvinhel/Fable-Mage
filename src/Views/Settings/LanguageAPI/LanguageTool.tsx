namespace Views.Settings.LanguageAPI
{
    export function languageTool(config: Partial<Data.LanguageToolEndpoint>)
    {
        return <div id="languagetool-api">
            <label>Url:</label>
            <input name="url" type="text" value={ config.url ?? "" } placeholder="LanguageTool API url. Leave blank for default public url." />

            <label>API Key:</label>
            <input name="api_key" type="password" value={ config.api_key ?? "" } placeholder="Optional LanguageTool API key" />

            <div class="group">
                <label>Username:</label>
                <input name="username" type="text" value={ config.username ?? "" } placeholder="Optional username" />

                <label>Password:</label>
                <input name="password" type="password" value={ config.password ?? "" } placeholder="Optional password" />

                <p>Only needed when the endpoint is behind a reverse proxy using Basic authentication.</p>
            </div>
        </div>;
    }
}
