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
            this.load();
        }

        private async load(page = 0)
        {
            try
            {
                const api = new Data.Nexus.API(App.config);
                const result = await api.getWorlds({
                    title: this.titleInput.value,
                    tags: this.tagsInput.checkedOptions.map(x => x.value),
                    mature: this.matureFilterInput.checked,
                    limit: this.pageSize,
                    offset: page * this.pageSize
                });
                this.page = Math.max(0, page);

                this.listElement.clearChildren();
                for (const item of result.worlds)
                {
                    this.listElement.append(<div class="world" onclick={ async () =>
                    {
                        const json = await api.getWorldFile(item);
                        navigate("World");
                        worldElement.import(json);
                    } }>
                        <h3 title={ item.title }>{ item.title }</h3>
                        <img src={ item.cover?.[0]?.signedPath ? new URL("/" + item.cover[0].signedPath.replace("\\\\", "/").toString(), App.config.nexusURL) : null } />
                        <ul class="tag-list" title={ item.tags.join("; ") }>{ item.tags.map(x => <li>{ x.trim() }</li>) }</ul>
                        <div class="username">{ item.username }</div>
                        <div class="description">{ item.description }</div>
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