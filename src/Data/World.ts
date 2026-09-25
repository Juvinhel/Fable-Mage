namespace Data
{
    export type World =
        {
            title: string;
            cover: string;
            version: string;
            mature: boolean;
            description: string;
            scenario: string;
            rules: string;
            stats?: Stat[];
            player: Character;
            npcs?: Character[];
            prologue?: Prologue;
            tags?: string[];
        };

    export type Character = {
        name: string;
        portrait: string;
        appearance: string;
        personality: string;
        traits: string;
        background: string;
        [key: string]: string;
    };

    export type Stat = { name: string; description: string; };

    export type Prologue = {
        location: string;
        time: string;
        text: string;
        internal: string;
    };
}