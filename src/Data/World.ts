namespace Data
{
    export type World =
        {
            title: string;
            "author-style": string;
            scenario: string;
            player: CharacterCard;
            npcs?: CharacterCard[];
        };

    export type CharacterCard = {
        name: string;
        appearance: string;
        personality: string;
        background: string;
        [key: string]: string;
    };
}