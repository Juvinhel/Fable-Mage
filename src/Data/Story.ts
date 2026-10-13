namespace Data
{
    export type Story = World & {
        plot: Plot;
    };

    export type Plot = PlotPoint[];
    export type PlotPoint = {
        input?: string;

        location: string;
        time: string;
        text: string;
        internal: string;
        choices: string[];

        scenery: string;
        image: string;
        summary?: string;
        context?: string;
        player: Character;
        npcs?: Character[];
    };
}