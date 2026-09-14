namespace Data
{
    export type World =
        {
            title: string;
            cover: string;
            "author-style": string;
            scenario: string;
            focus: string;
            stats?: Stat[];
            player: CharacterCard;
            npcs?: CharacterCard[];
            prologue?: Prologue;
        };

    export type CharacterCard = {
        name: string;
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