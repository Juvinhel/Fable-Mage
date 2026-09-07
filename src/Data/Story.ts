namespace Data
{
    export type Story = World & { plot?: Plot; };

    export type Plot = PlotPoint[];
    export type PlotPoint = {
        text: string;
        image?: string;
        input?: string;
    };
}