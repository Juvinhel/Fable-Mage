namespace Views.Settings.ImageAPI
{
    export function gemini(config: Partial<Data.GeminiEndpoint>)
    {
        return <div class="gemini-api">
            <div>
                <label>API Key:</label>
                <input name="api_key" type="text" value={ config.api_key ?? "" } placeholder="Gemini API key" />
            </div>
            <div>
                <label>Model:</label>
                <select name="model" value={ config.model ?? "gemini-3.1-flash-image" }>
                    <option value="gemini-3.1-flash-image">Gemini 3.1 Flash Image</option>
                    <option value="gemini-3-pro-image">Gemini 3 Pro Image</option>
                </select>
            </div>
        </div>;
    }
}