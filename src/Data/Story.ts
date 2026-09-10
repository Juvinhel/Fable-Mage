namespace Data
{
    export type Story = World & { plot?: Plot; };

    export type Plot = PlotPoint[];
    export type PlotPoint = {
        input?: string;
        text: string;
        internal?: string;
        scenery?: string;
        image?: string;
    };
}