namespace Views.Settings
{
    declare const google: any;

    export class NexusSettingsElement extends HTMLElement
    {
        private static readonly googleClientId = "624923338153-r82tqp7rojlj6f9k79vhvn7p46fsq7t8.apps.googleusercontent.com";

        constructor ()
        {
            super();

            this.classList.add("nexus-tab");
            this.setAttribute("tab-header", "Nexus");
            this.append(this.build());
            this.load();
        }

        private emailInput: HTMLInputElement;
        private usernameInput: HTMLInputElement;

        private build()
        {
            return <>
                <div>
                    <label>Login:</label>
                    <button onclick={ () => this.loginWithGoogle() }>Login with Google</button>
                    <button onclick={ () => this.logoutWithGoogle() }>Logout</button>
                </div>
                <div>
                    <label>Email:</label>
                    { this.emailInput = <input type="email" value={ App.config.nexusAccount?.email ?? "" } readonly /> as HTMLInputElement }
                </div>
                <div>
                    <label>Username:</label>
                    { this.usernameInput = <input type="text" value={ App.config.nexusAccount?.username ?? "" } readonly /> as HTMLInputElement }
                </div>
            </>;
        }

        private load()
        {
            this.emailInput.value = App.config.nexusAccount?.email ?? "";
            this.usernameInput.value = App.config.nexusAccount?.username ?? "";
        }

        private async loginWithGoogle()
        {
            const clientId = NexusSettingsElement.googleClientId;
            if (!clientId)
            {
                UI.Dialog.error(new Error("A Google OAuth client ID is required."));
                return;
            }

            try
            {
                await this.loadGoogleIdentityServices();
                google.accounts.id.initialize({
                    client_id: clientId,
                    callback: (response: { credential: string; }) => this.onGoogleCredential(response.credential)
                });
                google.accounts.id.prompt();
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        private async logoutWithGoogle()
        {
            try
            {
                delete App.config.nexusAccount;
                await Data.saveConfig(App.config);
                this.emailInput.value = "";
                this.usernameInput.value = "";
                UI.Dialog.message({ title: "Logged out", text: "Your Google account has been removed from this device." });
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }

        private loadGoogleIdentityServices(): Promise<void>
        {
            if (typeof google != "undefined" && google.accounts?.id)
                return Promise.resolve();

            return new Promise((resolve, reject) =>
            {
                const script = document.createElement("script");
                script.src = "https://accounts.google.com/gsi/client";
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error("Unable to load Google login."));
                document.head.append(script);
            });
        }

        private async onGoogleCredential(credential: string)
        {
            try
            {
                const encodedPayload = credential.split(".")[1];
                const payload = JSON.parse(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/")));
                if (!payload.email)
                    throw new Error("Google did not return an email address.");

                const username = payload.name ?? payload.email;
                this.emailInput.value = payload.email;
                this.usernameInput.value = username;
                App.config.nexusAccount = { provider: "Google", email: payload.email, username };
                await Data.saveConfig(App.config);
                UI.Dialog.message({ title: "Login successful", text: "Logged in as " + payload.email + "." });
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }
    }

    customElements.define("nexus-settings", NexusSettingsElement);
}