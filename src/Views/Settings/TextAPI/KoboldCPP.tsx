namespace Views.Settings.TextAPI
{
    export function koboldCPP(config: Partial<Data.KoboldCPPEndpoint>)
    {
        return <div id="koboldcpp-api">
            <label>URL:</label>
            <input name="url" type="text" value={ config.url ?? "" } placeholder="KoboldCPP server URL" />

            <label>Max Length:</label>
            <input name="max_length" type="number" min="0" value={ config.max_length ?? "" } placeholder="Leave blank for automatic calculation." />

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