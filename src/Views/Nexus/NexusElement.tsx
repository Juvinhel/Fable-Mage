namespace Views.Nexus
{
    export class NexusElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());
        }

        private listElement: HTMLDivElement;
        private previousButton: HTMLButtonElement;
        private nextButton: HTMLButtonElement;
        private pageLabel: HTMLSpanElement;
        private titleInput: HTMLInputElement;
        private tagsInput: HTMLMultiSelect;
        private matureFilterInput: HTMLInputElement;
        private ownWorldsFilterInput: HTMLInputElement;
        private page = 0;
        private pageSize = 10;

        private build()
        {
            return <>
                <details class="filters">
                    <summary>Search</summary>
                    <div class="filter-controls">
                        <div class="filter-field">
                            <label>Title:</label>
                            { this.titleInput = <input type="search" placeholder="Search by title" /> as HTMLInputElement }
                        </div>
                        <div class="filter-field">
                            <label>Tags:</label>
                            { this.tagsInput = <multi-select options={ Data.knownTags.map(x => ({ title: x.value, value: x.value })) } /> as HTMLMultiSelect }
                        </div>
                        <div class="filter-field">
                            <label>Mature:</label>
                            { this.matureFilterInput = <input type="checkbox" /> as HTMLInputElement }
                        </div>
                        <div class="filter-field">
                            <label>Only my worlds:</label>
                            { this.ownWorldsFilterInput = <input type="checkbox" /> as HTMLInputElement }
                        </div>
                        <button title="Search" onclick={ () => this.load() }>Search</button>
                    </div>
                </details>
                { this.listElement = <div class="list" /> as HTMLDivElement }
                <div class="pagination">
                    { this.previousButton = <button title="Previous page" onclick={ () => this.load(this.page - 1) }>Previous</button> as HTMLButtonElement }
                    { this.pageLabel = <span /> as HTMLSpanElement }
                    { this.nextButton = <button title="Next page" onclick={ () => this.load(this.page + 1) }>Next</button> as HTMLButtonElement }
                </div>
            </>;
        }

        private connectedCallback()
        {
            const userId = App.config.nexusAccount?.email;
            this.ownWorldsFilterInput.disabled = !userId;
            this.ownWorldsFilterInput.title = userId ? "" : "Sign in to Nexus to filter your worlds.";
            this.load();
        }

        public refresh(): Promise<void>
        {
            return this.load(this.page);
        }

        private async load(page = 0)
        {
            try
            {
                this.listElement.clearChildren();
                if(this.ownWorldsFilterInput.checked && !App.config.nexusAccount?.email) return;

                const result = await Data.Nexus.API.getWorlds({
                    title: this.titleInput.value,
                    tags: this.tagsInput.checkedOptions.map(x => x.value),
                    mature: this.matureFilterInput.checked,
                    userid: this.ownWorldsFilterInput.checked ? App.config.nexusAccount?.email : undefined,
                    limit: this.pageSize,
                    offset: page * this.pageSize
                });
                if (!result.worlds.length && page > 0)
                    return this.load(page - 1);

                this.page = Math.max(0, page);

                for (const world of result.worlds)
                {
                    this.listElement.append(<div class="world" onclick={ async () =>
                    {
                        OpenWorldDialog(world);
                    } }>
                        <h3 title={ world.title }>{ world.title }</h3>
                        <img src={ world.coverUrl ?? null } />
                        <ul class="tag-list" title={ world.tags.join("; ") }>{ world.tags.map(x => <li>{ x.trim() }</li>) }</ul>
                        <div class="username">{ world.username }</div>
                        <div class="description">{ world.description }</div>
                    </div>);
                }

                this.pageLabel.textContent = "Page " + (this.page + 1);
                this.previousButton.disabled = this.page <= 0;
                this.nextButton.disabled = !result.next;
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        }
    }

    customElements.define("my-nexus", NexusElement);
}