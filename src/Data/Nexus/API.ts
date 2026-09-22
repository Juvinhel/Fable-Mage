namespace Data.Nexus
{
    const worldTable = 1213471;
    const nexusURL = "https://api.baserow.io";
    const nexusToken = "Cuqsu96IEclKoIBt7kL3oD2BGxPxqkeb";

    export const API = new class
    {
        public async getWorlds(filters: WorldFilters = {}): Promise<WorldResult>
        {
            const url = new URL("/api/database/rows/table/" + worldTable + "/", nexusURL);
            url.searchParams.set("user_field_names", "true");

            const filtersJSON: BaserowFilter[] = [];
            if (filters.title?.trim())
                filtersJSON.push({ field: "title", type: "contains", value: filters.title.trim() });

            const tags = filters.tags?.map(x => x.trim()).filter(Boolean) ?? [];
            for (const tag of tags)
                filtersJSON.push({ field: "tags", type: "contains", value: tag });

            if (filters.mature != true)
                filtersJSON.push({ field: "mature", type: "equal", value: "0" });

            if (filtersJSON.length)
                url.searchParams.set("filters", JSON.stringify({ filter_type: "AND", filters: filtersJSON }));

            if (filters.limit !== undefined)
                url.searchParams.set("size", String(filters.limit));
            if (filters.offset !== undefined && filters.limit)
                url.searchParams.set("page", String(Math.floor(filters.offset / filters.limit) + 1));

            const result: BaserowListResult = await this.request(url.toString());
            return {
                worlds: result.results.map(x => this.toWorldRecord(x)),
                next: result.next
            };
        }

        public async getWorldFile(world: WorldRecord): Promise<Data.World>
        {
            if (!world.fileUrl)
                throw new Error("World does not contain a world file.");

            return await this.request(world.fileUrl);
        }

        public async createWorld(world: WorldUpload): Promise<void>
        {
            const cover = await this.uploadFile(world.cover, "cover.png");
            const file = await this.uploadFile(world.file, "world.json");
            const fields = {
                ...world,
                cover: [{ name: cover.name }],
                file: [{ name: file.name }]
            };
            const url = new URL("/api/database/rows/table/" + worldTable + "/", nexusURL);
            url.searchParams.set("user_field_names", "true");
            await this.request(url.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fields)
            });
        }

        private async uploadFile(content: Blob, filename: string): Promise<BaserowFile>
        {
            const body = new FormData();
            body.append("file", content, filename);
            return await this.request(new URL("/api/user-files/upload-file/", nexusURL).toString(), {
                method: "POST",
                body
            });
        }

        private toWorldRecord(row: BaserowWorldRow): WorldRecord
        {
            const { cover, file, ...fields } = row;
            return {
                ...fields,
                tags: this.toTags(fields.tags),
                coverUrl: this.toFileUrl(cover),
                fileUrl: this.toFileUrl(file)
            };
        }

        private toTags(tags: any): string[]
        {
            if (Array.isArray(tags))
                return tags.map(x => typeof x === "string" ? x : x.value ?? x.name).filter(Boolean);
            return typeof tags === "string" ? tags.split(",").map(x => x.trim()).filter(Boolean) : [];
        }

        private toFileUrl(files: any): string | undefined
        {
            if (!Array.isArray(files) || !files.length)
                return undefined;
            return files[0].url ?? files[0].name;
        }

        private async request<T>(url: string, options?: RequestInit): Promise<T>
        {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options?.headers,
                    "Authorization": "Token " + nexusToken
                }
            });
            if (!response.ok)
                throw new Error("Baserow request failed (" + response.status + ")");
            return await response.json();
        }
    }();

    type BaserowFile = {
        name: string;
        url: string;
    };

    type BaserowWorldRow = Omit<WorldRecord, "tags" | "coverUrl" | "fileUrl"> & {
        tags: any;
        cover: any;
        file: any;
    };

    type BaserowListResult = {
        results: BaserowWorldRow[];
        next: string | null;
    };

    type BaserowFilter = {
        field: string;
        type: string;
        value: string | boolean;
    };
}