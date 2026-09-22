namespace Data.Nexus
{
    export type QueryResult<T> = {
        records: {
            id: number;
            fields: T;
        }[];
        next: string | null;
        nestedNext: any;
    };

    export type RecordResult<T> = {
        records: {
            id: number;
            fields: T;
        }[];
    };

    export type WorldRecord = {
        title: string;
        description: string;
        username: string;
        userid: string;
        tags: string[];
        version: string;
        mature: boolean;
        coverUrl?: string;
        fileUrl?: string;
    };

    export type WorldUpload = {
        title: string;
        description: string;
        username: string;
        userid: string;
        tags: string[];
        version: string;
        mature: boolean;
        cover: Blob;
        file: Blob;
    };

    export type WorldFilters = {
        title?: string;
        tags?: string[];
        mature?: boolean;
        limit?: number;
        offset?: number;
    };

    export type WorldResult = {
        worlds: WorldRecord[];
        next: string | null;
    };
}