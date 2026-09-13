namespace Data
{
    export type World =
        {
            title: string;
            "author-style": string;
            scenario: string;
            focus: string;
            stats?: Stat[];
            player: CharacterCard;
            npcs?: CharacterCard[];
        };

    export type CharacterCard = {
        name: string;
        appearance: string;
        personality: string;
        traits: string;
        background: string;
        [key: string]: string;
    };
}