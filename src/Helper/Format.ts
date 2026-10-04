namespace Helper
{
    export function FormatAIText(text: string): string
    {
        text = text.replaceAll(/(?<![a-zA-Z])'|'(?![a-zA-Z])/g, '"');
        text = marked.parse(text);
        text = DOMPurify.sanitize(text);
        return text;
    }
}