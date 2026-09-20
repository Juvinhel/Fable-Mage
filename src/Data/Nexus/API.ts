namespace Data.Nexus
{
    export class API
    {
        constructor (config: Data.Config)
        {
            this.config = config;
        }

        private config: Data.Config;

        public async getWorlds(filters: WorldFilters = {}): Promise<WorldResult>
        {
            const url = new URL(this.config.nexusURL);
            const conditions: string[] = [];

            if (filters.title?.trim())
                conditions.push("(title,like,%" + filters.title.trim() + "%)");

            const tags = filters.tags?.map(x => x.trim()).filter(Boolean) ?? [];
            if (tags.length)
                conditions.push("(tags,allof," + tags.map(x => "\"" + x + "\"").join(",") + ")");

            if (filters.mature != true)
                conditions.push("(mature,is,false)");

            if (conditions.length)
                url.searchParams.set("where", conditions.join("~and"));

            if (filters.limit !== undefined)
                url.searchParams.set("limit", String(filters.limit));
            if (filters.offset !== undefined)
                url.searchParams.set("offset", String(filters.offset));

            const result: QueryResult<WorldRecord> = await this.request(url.toString());
            return {
                worlds: result.records.map(x => x.fields),
                next: result.next
            };
        }

        public async getWorldFile(world: WorldRecord): Promise<Data.World>
        {
            const path = world.file[0].path.replace("\\\\", "/");
            return await this.request(new URL("/" + path, this.config.nexusURL).toString());
        }

        public async createWorld(world: WorldUpload): Promise<void>
        {
            const fields = {
                ...world,
                cover: [],
                file: []
            };
            const result: RecordResult<WorldRecord> = await this.request(this.config.nexusURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify([{ fields }])
            });
            const record = result.records[0];

            await this.uploadAttachment(record.id, "c7o4i45wibadxdg", world.cover, "cover");
            await this.uploadAttachment(record.id, "c2zx3rla28z968w", world.file, "world.json");
        }

        private async uploadAttachment(recordId: number, fieldID: string, content: Blob, filename: string): Promise<void>
        {   // not working currently (v3 api unclear)
            const body = JSON.stringify({
                contentType: content.type,
                file: await this.blobToBase64(content),
                filename
            });

            const url = new URL(this.config.nexusURL);
            url.pathname += "/" + recordId + "/fields/" + encodeURIComponent(fieldID) + "/upload";
            await this.request(url.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body
            });
        }

        private blobToBase64(blob: Blob): Promise<string>
        {
            return new Promise((resolve, reject) =>
            {
                const reader = new FileReader();
                reader.onloadend = () =>
                {
                    // Entfernt das "data:[mime-type];base64," Präfix
                    resolve((reader.result as string).split(",")[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        };

        private async request<T>(url: string, options?: RequestInit): Promise<T>
        {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options?.headers,
                    "xc-token": this.config.nexusToken
                }
            });
            return await response.json();
        }
    }
}