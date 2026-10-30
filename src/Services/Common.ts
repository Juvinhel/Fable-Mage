namespace Services
{
    export async function readServerSentEvents(response: Response, onData: (data: string) => void): Promise<void>
    {
        const reader = response.body?.getReader();
        if (!reader) throw new Error("The response did not include a readable stream.");

        const decoder = new TextDecoder();
        let buffer = "";
        const dispatch = (event: string) =>
        {
            const data = event.split("\n")
                .filter(line => line.startsWith("data:"))
                .map(line => line.slice(5).replace(/^ /, ""))
                .join("\n");
            if (data) onData(data);
        };

        try
        {
            while (true)
            {
                const { done, value } = await reader.read();
                buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
                let boundary: number;
                while ((boundary = buffer.indexOf("\n\n")) >= 0)
                {
                    dispatch(buffer.slice(0, boundary));
                    buffer = buffer.slice(boundary + 2);
                }
                if (done)
                {
                    if (buffer) dispatch(buffer);
                    break;
                }
            }
        }
        catch (error)
        {
            await reader.cancel();
            throw error;
        }
        finally
        {
            reader.releaseLock();
        }
    }
}