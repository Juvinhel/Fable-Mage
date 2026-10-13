namespace Views.Settings.LanguageAPI
{
    export function languageTool(config: Partial<Data.LanguageToolEndpoint>)
    {
        return <div id="languagetool-api">
            <label>Endpoint:</label>
            <input name="endpoint" type="text" value={ config.endpoint ?? "" } placeholder="LanguageTool API endpoint" />

            <label>API Key:</label>
            <input name="api_key" type="password" value={ config.api_key ?? "" } placeholder="Optional LanguageTool API key" />

            <div class="group">
                <label>Username:</label>
                <input name="username" type="text" value={ config.username ?? "" } placeholder="Optional username" />

                <label>Password:</label>
                <input name="password" type="password" value={ config.password ?? "" } placeholder="Optional password" />

                <p>Used for Basic authentication when both are provided.</p>
            </div>
        </div>;
    }
}
