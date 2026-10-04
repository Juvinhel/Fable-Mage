interface DOMPurify
{
    sanitize(html: string): string;
}

declare const DOMPurify: DOMPurify;