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
        id: number;
        title: string;
        description: string;
        username: string;
        userid: string;
        tags: string[];
        version: string;
        mature: boolean;
        coverUrl?: string;
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
        data: string;
    };

    export type WorldFilters = {
        title?: string;
        tags?: string[];
        mature?: boolean;
        userid?: string;
        limit?: number;
        offset?: number;
    };

    export type WorldResult = {
        worlds: WorldRecord[];
        next: string | null;
    };
}