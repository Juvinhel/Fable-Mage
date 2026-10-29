namespace Data
{
    export type ImageStyle = {
        name: string;
        prefix: string;
        suffix: string;
    };

    export const BuiltInImageStyles: ImageStyle[] = [
        {
            name: "Anime",
            prefix: "Ultra-detailed, full body anime illustration in the style of high-end modern Japanese digital art (inspired by artists like Sui Ishida, Shigenori Soejima, Sakimichan, P. A. Works, Jeff Koons, and high-polish gacha-game key art):",
            suffix: "Apply an anime rendering style with smooth and gentle gradients, realistic lighting, gradient cel-shading blended with subtle painterly highlights. Overall style: Hyper-polished, high-resolution anime realism, vibrant color palette, soft and diffuse natural lighting, expressive faces with iridescent eyes, flowing hair and fabric, depth-of-field effects, thick linework blended with soft edges and soft outlines. The final image should look like a professional Pixiv illustration of an anime or JRPG character.",
        },
        {
            name: "Anime - Retro",
            prefix: "989 anime OVA drawn in the artstyle of Kenichi Sonoda:",
            suffix: "great detail",
        },
        {
            name: "Pseudorealistic CGI",
            prefix: "Unreal Engine 5 rendered hyper-realistic medium close-up upper-body image of",
            suffix: "Unreal Engine 5 rendered hyper-realistic image. The character has a dynamic pose and is shown with exquisite beauty. The image is beautiful with rich shading, silky texture, and a smooth highly polished finish. The color palette is vibrant, luminous and iridescent, with extremes of light and shade, high saturation, and an ethereal glow. IWUpscaleFaceSmooth"
        },
        {
            name: "Photorealistic - Beautiful",
            prefix: "Highly attractive, sexy medium close-up photograph of",
            suffix: "IWBeautiful IWBeautiful2 Smooth, flawless skin and a perfect face. Looking at the viewer. IWUpscaleFaceSmooth",
        },
        {
            name: "Vector Art",
            prefix: "Detailed vector art, cel shaded:",
            suffix: "thick outlines, western comic style",
        },
        {
            name: "Comic Book",
            prefix: "Comic book illustration of",
            suffix: "Western animation in the style of Jim Lee, Greg Capullo. Heavily inked outlines and cross-hatching style with vibrant cel-shaded coloring. Inked shadows, chiaroscuro shadows. Dramatic lighting and contrasts. Realistic facial features.",
        }
    ];
}