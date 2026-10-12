namespace Views.Settings.LanguageAPI
{
    export function languageTool(config: Partial<Data.LanguageToolEndpoint>)
    {
        return <div class="languagetool-api">
            <div>
                <label>Endpoint:</label>
                <input name="endpoint" type="text" value={ config.endpoint ?? "" } placeholder="LanguageTool API endpoint" />
            </div>
            <div>
                <label>API Key:</label>
                <input name="api_key" type="password" value={ config.api_key ?? "" } placeholder="Optional LanguageTool API key" />
            </div>
            <div class="group">
                <div>
                    <label>Username:</label>
                    <input name="username" type="text" value={ config.username ?? "" } placeholder="Optional username" />
                </div>
                <div>
                    <label>Password:</label>
                    <input name="password" type="password" value={ config.password ?? "" } placeholder="Optional password" />
                </div>
                <p>Used for Basic authentication when both are provided.</p>
            </div>
        </div>;
    }
}
