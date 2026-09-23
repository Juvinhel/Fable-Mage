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

        private build()
        {
            return <>
                <div class="header">
                    <div class="diagnostic-toolbar">
                        <button onclick={ () => this.toggleLogging() }>{ AI.Logger.loggingEnabled ? "Stop" : "Start" }</button>
                        <button onclick={ () => this.clearLogList() }>Clear</button>
                    </div>
                </div>

                { this.logList = <div class="log-list" /> as HTMLDivElement }
            </>;
        }

        private toggleLogging()
        {
            AI.Logger.loggingEnabled = !AI.Logger.loggingEnabled;
        }

        private clearLogList()
        {
            this.logList.clearChildren();
        }

        private addEntry(entry: AI.RequestLogEntry)
        {
            console.log("L", entry);
            const request = <div class="chat-thread" /> as HTMLDivElement;
            for (const message of entry.request)
                request.appendChild(<div class={ ["chat-message", message.role] } >
                    <label>{ message.role }</label>
                    <pre>{ message.content }</pre>
                </div>);

            const item = <details class="log-entry" open={ false }>
                <summary>
                    <strong>{ entry.methodName }</strong>
                    <span>{ entry.time }</span>
                </summary>
                <div class="log-body">
                    <div class="meta"><span>{ entry.durationMs } ms</span></div>
                    <div class="request-body"><label>Request</label>{ request }</div>
                    <div class="response-body"><label>Response</label><pre>{ entry.response }</pre></div>
                </div>
            </details> as HTMLDetailsElement;

            this.logList.insertBefore(item, this.logList.firstChild);
        }
    }

    customElements.define("my-diagnostics", DiagnosticsElement);
}
