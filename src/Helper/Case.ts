namespace Helper
{
    export function convertKebabCaseToPascalCase(input: string): string
    {
        return input.replace(/(^\w|-\w)/g, clearAndUpper);
    }
    function clearAndUpper(text)
    {
        return text.replace(/-/, "").toUpperCase();
    }

    export function convertPascalCaseToKebabCase(input: string): string
    {
        return input.replace(/([a-z0–9])([A-Z])/g, "$1-$2").toLowerCase();
    }

    export function converKebabCaseToTitleCase(input: string): string
    {
        return input
            .split(/[\s-]+/g)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    }

    export function convertTitleCaseToKebabCase(input: string): string
    {
        return input.split(/[\s-]+/g).map(word => word.toLowerCase()).join("-");
    }
}