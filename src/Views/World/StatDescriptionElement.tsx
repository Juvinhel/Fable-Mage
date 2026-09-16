namespace Views.World
{
    export class StatDescriptionElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.title = "Settings";
            this.append(this.build());
        }

        private nameInput: HTMLInputElement;
        private descriptionInput: HTMLTextAreaElement;

        private build()
        {
            return <>
                { this.nameInput = <input class="stat-name" type="text" placeholder="Name" onblur={ () => this.onBlur() } /> as HTMLInputElement }
                { this.descriptionInput = <textarea class="stat-description single-line" type="text" placeholder="Description, include range and impact on the character." /> as HTMLTextAreaElement }
                <div class="functions">
                    <button class="icon-button delete-button" onclick={ () => this.onDelete() }><color-icon src="img/icons/delete.svg" /></button>
                </div>
            </>;
        }

        public get name(): string { return Helper.convertTitleCaseToKebabCase(this.nameInput.value.trim()); }
        public set name(value: string) { this.nameInput.value = Helper.converKebabCaseToTitleCase(value) ?? ""; }

        public get description(): string { return this.descriptionInput.value.trim(); }
        public set description(value: string) { this.descriptionInput.value = value ?? ""; }

        private oldName = "";
        private async onBlur()
        {
            const newName = this.nameInput.value = this.nameInput.value.trim();
            if (this.oldName != newName)
            {
                const event = new Event("namechange", { bubbles: true });
                event["old-name"] = this.oldName;
                event["new-name"] = newName;
                this.dispatchEvent(event);
            }
            this.oldName = newName;
        }

        private async onDelete()
        {
            if (await UI.Dialog.confirm({ text: "Are you sure you want to delete this stat?", title: "Delete stat?" }))
                this.remove();
        }
    }

    customElements.define("my-stat-description", StatDescriptionElement);
}

