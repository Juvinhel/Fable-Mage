namespace Views.Settings.ImageAPI
{
    export function stableDiffusion(config: Partial<Data.StableDiffusionEndpoint>)
    {
        return <div id="stable-diffusion-api">
            <label>URL:</label>
            <input name="url" type="text" value={ config.url ?? "" } placeholder="Stable Diffusion server URL" />

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