namespace Views.Settings.ImageAPI
{
    export function koboldCPP(config: Partial<Data.KoboldCPPEndpoint>)
    {
        return <div class="koboldcpp-api">
            <div>
                <label>URL:</label>
                <input name="url" type="text" value={ config.url ?? "" } placeholder="KoboldCPP server URL" />
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
                <p>Only needed when the endpoint is behind a reverse proxy using Basic authentication.</p>
            </div>
        </div>;
    }
}