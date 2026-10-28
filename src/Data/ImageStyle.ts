namespace Data
{
    export type ImageStyle = {
        name: string;
        prefix: string;
        suffix: string;
    };

    export const BuiltInImageStyles: ImageStyle[] = [
        {
            name: "Pseudorealistic CGI",
            prefix: "Unreal Engine 5 rendered hyper-realistic medium close-up upper-body image of",
            suffix: "Unreal Engine 5 rendered hyper-realistic image. The character has a dynamic pose and is shown with exquisite beauty. The image is beautiful with rich shading, silky texture, and a smooth highly polished finish. The color palette is vibrant, luminous and iridescent, with extremes of light and shade, high saturation, and an ethereal glow. IWUpscaleFaceSmooth"
        }
    ];
}