namespace AI
{
    export const Logger = new class
    {
        public requestLog: RequestLogEntry[] = [];
        public loggingEnabled = true;
        public onRequestLogged: ((entry: RequestLogEntry) => void) | null = null;

        public logRequest(methodName: string, request: Message[], response: string, type: "message" | "error", startedAt: number)
        {
            const entry: RequestLogEntry = {
                methodName,
                time: new Date().toISOString(),
                duration: Date.now() - startedAt,
                request,
                response,
                type
            };

            this.requestLog.unshift(entry);
            while (this.requestLog.length > 50)
                this.requestLog.pop();

            if (this.loggingEnabled)
            {
                // CONSOLE
                console.groupCollapsed("[AI] " + methodName + " (" + entry.duration + "ms)");
                console.log("time:", entry.time);
                console.log("request:");
                for (const message of entry.request)
                    console.log("[" + message.role + "]", message.content);
                console.log(entry.type == "error" ? "error:" : "response:", entry.response);
                console.groupEnd();

                // UI
                try { this.onRequestLogged?.(entry); } catch { }
            }
        }
    }();

    export type RequestLogEntry = {
        methodName: string;
        time: string;
        duration: number;
        request: Message[];
        response: string;
        type: "message" | "error";
    };
}
