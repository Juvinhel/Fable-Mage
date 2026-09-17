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

        private build()
        {
            return <>
                { this.listElement = <div class="list" /> as HTMLDivElement }
            </>;
        }

        private connectedCallback()
        {
            this.load();
        }

        private async load()
        {
            const response = await fetch(App.config.nexusURL, {
                headers: {
                    "xc-token": App.config.nexusToken
                }
            });
            const result: QueryResult<WorldRecord> = await response.json();

            this.listElement.clearChildren();
            for (const item of result.records.map(x => x.fields))
            {
                this.listElement.append(<div class="world" onclick={ async () =>
                {
                    const url = new URL("/" + item.file[0].path.replace("\\\\", "/"), App.config.nexusURL).toString();
                    const response = await fetch(url, {
                        headers: {
                            "xc-token": App.config.nexusToken
                        }
                    });
                    const json = await response.json();
                    navigate("World");
                    worldElement.import(json);
                } }>
                    <h3 title={ item.title }>{ item.title }</h3>
                    <img src={ item.cover[0].signedPath ? new URL("/" + item.cover[0].signedPath.replace("\\\\", "/").toString(), App.config.nexusURL) : null } />
                    <ul class="tag-list" title={ item.tags.join("; ") }>{ item.tags.map(x => <li>{ x.trim() }</li>) }</ul>
                </div>);
            }
        }
    }

    type QueryResult<T> = {
        "records": [
            {
                "id": number,
                "fields": T;
            }];
        "nestedNext": any;
    };

    type WorldRecord = {
        title: string; tags: string[]; version: string;
        cover: [{ path: string; signedPath: string; }];
        file: [{ path: string; signedPath: string; }];
    };

    customElements.define("my-nexus", NexusElement);
}