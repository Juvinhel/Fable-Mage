namespace Views.Settings.TextAPI
{
    export function gemini(config: Partial<Data.GeminiEndpoint>)
    {
        return <div class="gemini-api">
            <div>
                <label>API Key:</label>
                <input name="api_key" type="password" value={ config.api_key ?? "" } placeholder="Gemini API key" />
            </div>
            <div>
                <label>Model:</label>
                <select name="model" value={ config.model ?? "gemini-3.8-flash" }>
                    <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
                    <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
                    <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                </select>
            </div>
        </div>;
    }
}