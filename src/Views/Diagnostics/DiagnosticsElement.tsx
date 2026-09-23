namespace Views.Diagnostics
{
    export class DiagnosticsElement extends HTMLElement
    {
        private logList: HTMLDivElement;

        constructor ()
        {
            super();

            this.append(this.build());
            this.refresh();
        }

        private build()
        {
            return <>
                <h1>Diagnostics</h1>

                <div class="diagnostics-panel">
                    <div class="diagnostic-toolbar">
                        <button onclick={ () => this.toggleLogging() }>{ AI.Logger.loggingEnabled ? "Stop" : "Start" }</button>
                        <button onclick={ () => AI.Logger.clearRequestLog() }>Clear</button>
                    </div>

                    { this.logList = <div class="request-log" /> as HTMLDivElement }
                </div>
            </>;
        }

        private toggleLogging()
        {
            AI.Logger.loggingEnabled = !AI.Logger.loggingEnabled;
            this.refresh();
        }

        public refresh()
        {
            if (!this.logList)
                return;

            this.logList.clearChildren();

            if (AI.Logger.loggingEnabled)
            {
                this.logList.append(<div class="empty">Logging stopped.</div>);
                return;
            }

            const entries = AI.Logger.requestLog.slice(0, 25);
            if (!entries.length)
            {
                this.logList.append(<div class="empty">No API requests logged yet.</div>);
                return;
            }

            for (const entry of entries)
            {
                const request = <div class="chat-thread" /> as HTMLDivElement;
                for (const message of entry.request)
                {
                    const bubble = <div class={ "chat-message " + message.role } /> as HTMLDivElement;
                    bubble.append(<label>{ message.role }</label>);
                    bubble.append(<pre>{ message.content }</pre>);
                    request.appendChild(bubble);
                }

                this.logList.appendChild(<details class="request-log-entry" open={ false }>
                    <summary>
                        <strong>{ entry.methodName }</strong>
                        <span>{ entry.time }</span>
                    </summary>
                    <div class="request-log-body">
                        <div class="request-meta"><span>{ entry.durationMs } ms</span></div>
                        <div class="request-body"><div class="request-label">Request</div>{ request }</div>
                        <div class="response-body"><div class="request-label">Response</div><pre>{ entry.response }</pre></div>
                    </div>
                </details>);
            }
        }
    }

    customElements.define("my-diagnostics", DiagnosticsElement);
}
