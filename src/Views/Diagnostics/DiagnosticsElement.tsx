namespace Views.Diagnostics
{
    export class DiagnosticsElement extends HTMLElement
    {
        constructor ()
        {
            super();

            AI.Logger.onRequestLogged = this.addEntry.bind(this);
            this.append(this.build());
        }

        private logList: HTMLDivElement;
        private loggingEnabledToggleButton: HTMLButtonElement;

        private build()
        {
            return <>
                <div class="header">
                    <div class="diagnostic-toolbar">
                        { this.loggingEnabledToggleButton = <button onclick={ () => this.toggleLogging() }>{ AI.Logger.loggingEnabled ? "Stop" : "Start" }</button> as HTMLButtonElement }
                        <button onclick={ () => this.clearLogList() }>Clear</button>
                    </div>
                </div>

                { this.logList = <div class="log-list" /> as HTMLDivElement }
            </>;
        }

        private toggleLogging()
        {
            AI.Logger.loggingEnabled = !AI.Logger.loggingEnabled;
            this.loggingEnabledToggleButton.textContent = AI.Logger.loggingEnabled ? "Stop" : "Start";
        }

        private clearLogList()
        {
            this.logList.clearChildren();
        }

        private async copyText(text: string)
        {
            await navigator.clipboard.writeText(text);
        }

        private addEntry(entry: AI.RequestLogEntry)
        {
            const request = <div class="chat-thread" /> as HTMLDivElement;
            for (const message of entry.request)
                request.appendChild(<div class={ ["chat-message", message.role] } >
                    <label>{ message.role }</label>
                    <pre>{ message.content }</pre>
                    <button class="icon-button" title="Copy message" onclick={ () => this.copyText(message.content) }><color-icon src="img/icons/clipboard.svg" /></button>
                </div>);

            const item = <details class="log-entry" open={ false }>
                <summary>
                    <strong>{ entry.methodName }</strong>
                    <span>{ entry.time }</span>
                </summary>
                <div class="log-body">
                    <div class="meta"><span>{ entry.duration } ms</span></div>
                    <div class="request-body"><label>Request</label>{ request }</div>
                    <div class="response-body"><label>Response</label>
                        <div class="chat-thread" >
                            <div class={ ["chat-message", entry.type == "error" ? "error" : "response"] }>
                                <label>{ entry.type == "error" ? "error" : "response" }</label>
                                <pre>{ entry.response }</pre>
                                <button class="icon-button" title={ "Copy " + (entry.type == "error" ? "error" : "response") } onclick={ () => this.copyText(entry.response) }><color-icon src="img/icons/clipboard.svg" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </details> as HTMLDetailsElement;

            this.logList.insertBefore(item, this.logList.firstChild);
        }
    }

    customElements.define("my-diagnostics", DiagnosticsElement);
}
