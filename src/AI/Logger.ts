namespace AI
{
    export const Logger = new class
    {
        public requestLog: RequestLogEntry[] = [];
        public loggingEnabled = true;

        public setLoggingEnabled(enabled: boolean)
        {
            this.loggingEnabled = enabled;
            for (const element of document.querySelectorAll("my-diagnostics") as NodeListOf<any>)
            {
                if (typeof element.refresh == "function")
                    element.refresh();
            }
        }

        public clearRequestLog()
        {
            this.requestLog.length = 0;
            for (const element of document.querySelectorAll("my-diagnostics") as NodeListOf<any>)
            {
                if (typeof element.refresh == "function")
                    element.refresh();
            }
        }

        public logRequest(methodName: string, request: Message[], response: string, startedAt: number)
        {
            if (!this.loggingEnabled)
                return;

            const entry: RequestLogEntry = {
                methodName,
                time: new Date().toISOString(),
                durationMs: Date.now() - startedAt,
                request,
                response
            };

            this.requestLog.unshift(entry);
            while (this.requestLog.length > 50)
                this.requestLog.pop();

            console.groupCollapsed("[AI] " + methodName + " (" + entry.durationMs + "ms)");
            console.log("time:", entry.time);
            console.log("request:");
            for (const message of entry.request)
                console.log("[" + message.role + "]", message.content);
            console.log("response:", entry.response);
            console.groupEnd();

            for (const element of document.querySelectorAll("my-diagnostics") as NodeListOf<any>)
            {
                if (typeof element.refresh == "function")
                    element.refresh();
            }
        }
    }();
    
    export type RequestLogEntry = {
        methodName: string;
        time: string;
        durationMs: number;
        request: Message[];
        response: string;
    };
}
