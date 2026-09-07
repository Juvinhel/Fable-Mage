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
                <div>
                    <div>
                        <label>Include plot:</label>
                        { this.includePlotCheckbox = <input type="checkbox" class="include-plot-checkbox" checked={ true } /> as HTMLInputElement }
                    </div>

                    <div>
                        <label>Include images in plot:</label>
                        { this.includeImagesInPlotCheckbox = <input type="checkbox" class="include-images-in-plot-checkbox" checked={ true } /> as HTMLInputElement }
                    </div>
                </div>

                <div>
                    <button onclick={ () => this.onImportJSON() }>Import JSON</button>
                    <button onclick={ () => this.onExportJSON() }>Export JSON</button>
                </div>
            </>;
        }

        private connectedCallback()
        {
            this.storyElement = this.closest("my-story");
        }

        private onExportJSON()
        {
            const includePlot = this.includePlotCheckbox.checked;
            const includeImagesInPlot = this.includeImagesInPlotCheckbox.checked;

            const data = this.storyElement.exportStory(includePlot, includeImagesInPlot);

            DownloadHelper.downloadData(data.title + ".json", data);
        }

        private async onImportJSON()
        {
            const result = await UI.Dialog.upload({ multiple: false, title: "Upload your story", accept: "text/json" });
            if (result.length > 0)
            {
                const file = result.item(0);
                const text = await file.text();
                const data = JSON.parse(text);
                this.storyElement.importStory(data);
            }
        }
    }

    customElements.define("my-import-export", ImportExportElement);
}