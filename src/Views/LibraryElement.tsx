namespace Views
{
    export class LibraryElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.title = "Library";
            this.append(this.build());
        }

        private listElement: HTMLDivElement;

        private build()
        {
            return <>
                { this.listElement = <div /> as HTMLDivElement }
            </>;
        }

        private connectedCallback()
        {
            this.load();
        }

        private async load()
        {
            const response = await fetch("https://script.google.com/macros/s/AKfycbyX-Tyw47JPPwH0fNgyI540WNGmtMIZM1QgIOay1gHeJD3avjNV8_SLnW3kTLaXXqQEVQ/exec");
            const result: { title: string; cover: string; description: string; tags: string; file: string; }[] = await response.json();

            this.listElement.clearChildren();
            for (const item of result)
            {
                this.listElement.append(<div class="template">
                    <h3>{ item.title }</h3>
                    <img src={ item.cover } />
                    <span>{ item.description }</span>
                    <ul class="tag-list">{ item.tags.split(",").map(x => <li>{ x.trim() }</li>) }</ul>
                </div>);
            }
        }
    }

    customElements.define("my-library", LibraryElement);
}