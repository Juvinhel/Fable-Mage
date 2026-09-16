namespace AI
{
    export type Schema = {
        "$schema": "https://json-schema.org/draft-07/schema",
        "type": "object" | "array",
        [key: string]: any;
    };
}