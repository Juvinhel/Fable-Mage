namespace Views.Settings
{
    export class APISelectElement extends HTMLSelectElement
    {
        constructor ()
        {
            super();

            this.addEventListener("change", this.onChange.bind(this));
        }

        public load(apiEndpoint: Data.APIEndpoint | undefined)
        {
            this.value = apiEndpoint?.name ?? "None";
            this.currentEndpoint = apiEndpoint;

            this.currentAttachedUI?.remove();
            if (this.value != "None")
            {
                this.currentAttachedUI = this.selectedOptions[0]["render"](apiEndpoint);
                this.after(this.currentAttachedUI);
            }
        }

        public save(): Data.APIEndpoint | undefined
        {
            if (this.value == "None") return undefined;

            const ret: Data.APIEndpoint = { name: this.value };

            for (const element of this.currentAttachedUI.querySelectorAll<HTMLElement>("input[name], select[name], combo-select[name]"))
            {
                const input = element as HTMLInputElement;
                const name = element.getAttribute("name");

                let value: any;
                if (input.type == "number")
                    value = input.valueAsNumber;
                else if (input.type == "checkbox" || input.type == "radio")
                    value = input.checked;
                else
                    value = input.value;
                ret[name] = value;
            }

            return this.currentEndpoint = ret as Data.APIEndpoint;
        }

        private onChange()
        {
            this.currentAttachedUI?.remove();
            if (this.value != "None")
            {
                this.currentAttachedUI = this.selectedOptions[0]["render"](this.currentEndpoint ?? {});
                this.after(this.currentAttachedUI);
            }
        }

        private currentEndpoint: Data.APIEndpoint;
        private currentAttachedUI: HTMLElement;
    }

    customElements.define("api-select", APISelectElement, { extends: "select" });
}
