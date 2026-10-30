namespace Views.Components
{
    export class LanguageSpan extends HTMLSpanElement
    {
        constructor ()
        {
            super();
        }

        private internal_text: string;
        public get text(): string
        {
            return this.internal_text;
        }

        public set text(text: string)
        {
            this.internal_text = text;
            console.log("t", text);

            if (Services.translationAPI && !App.language.startsWith("en"))
                Services.Client.translate(text, "en", App.language.splitFirst("-")[0]).then(translatedText => this.innerHTML = Helper.FormatAIText(translatedText));
            else
                this.textContent = text;
        }
    }

    customElements.define("language-span", LanguageSpan, { extends: "span" });
}