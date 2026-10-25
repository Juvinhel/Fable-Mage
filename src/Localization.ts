let translations: Record<string, unknown> = {};
let currentLocale = "en";

async function loadTranslations(): Promise<void>
{
    const languageTag = navigator.language.toLowerCase();
    const subtags = languageTag.split("-");
    const candidates = [languageTag];
    const regionIndex = subtags.findIndex((part, index) =>
        index > 0 && (/^[a-z]{2}$/.test(part) || /^\d{3}$/.test(part)));

    if (regionIndex >= 0)
    {
        subtags.splice(regionIndex, 1);
        candidates.push(subtags.join("-"));
    }

    const scriptIndex = subtags.findIndex((part, index) => index > 0 && /^[a-z]{4}$/.test(part));
    if (scriptIndex >= 0)
    {
        subtags.splice(scriptIndex, 1);
        candidates.push(subtags.join("-"));
    }

    if (!candidates.includes("en"))
        candidates.push("en");

    for (const locale of candidates)
    {
        const response = await fetch("locales/" + locale + ".json");
        if (!response.ok) continue;

        currentLocale = locale;
        translations = await response.json();
        return;
    }

    throw new Error("Failed to load the default English translations.");
}

function t(key: string, values?: Record<string, string | number>): string
{
    const resolve = (source: Record<string, unknown>): unknown =>
    {
        let value: unknown = source;

        for (const part of key.split("."))
        {
            if (typeof value !== "object" || value === null || !Object.prototype.hasOwnProperty.call(value, part))
                return undefined;

            value = (value as Record<string, unknown>)[part];
        }

        return value;
    };

    const translation = resolve(translations);
    if (typeof translation !== "string")
    {
        console.warn("Missing translation for key \"" + key + "\" in locale \"" + currentLocale + "\".");
        return key;
    }

    return values
        ? translation.replace(/\{(\w+)\}/g, (placeholder, name: string) => String(values[name] ?? placeholder))
        : translation;
}
