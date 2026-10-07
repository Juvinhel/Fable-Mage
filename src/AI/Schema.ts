namespace AI
{
    export type Schema = {
        "$schema": "https://json-schema.org/draft-07/schema";
        "type": "object" | "array";
        "additionalProperties"?: boolean;
        "required"?: string[];
        "properties"?: ObjectProperties;
        [key: string]: any;
    };

    export type ObjectProperties = {
        [key: string]: { type: string; description?: string; };
    };
}