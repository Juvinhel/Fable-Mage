namespace Views
{
    export class ImportExportElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.title = "Import / Export";
            this.append(this.build());
        }

        private storyElement: StoryElement;

        private includePlotCheckbox: HTMLInputElement;
        private includeImagesInPlotCheckbox: HTMLInputElement;

        private build()
        {
            return <>
               
            </>;
        }

        private connectedCallback()
        {
            this.storyElement = this.closest("my-story");
        }
    }

    customElements.define("my-import-export", ImportExportElement);
}