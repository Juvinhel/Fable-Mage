namespace AI
{
    export class TemplatingBase
    {
        public async initialize()
        {
            this.plotSchema = await this.getSchema("plot");
            this.choicesSchema = await this.getSchema("choices");
            this.worldSchema = await this.getSchema("world");
            this.metadataSchema = await this.getSchema("metadata");
            this.characterSchema = await this.getSchema("character");
            this.characterUpdateSchema = await this.getSchema("character-update");

            this.advancePlotTemplate = await this.getTemplate("advance-plot");
            this.offerChoicesTemplate = await this.getTemplate("offer-choices");
            this.summarizeProgressionTemplate = await this.getTemplate("summarize-progression");
            this.writePrologueTemplate = await this.getTemplate("write-prologue");
            this.describeSceneTemplate = await this.getTemplate("describe-scene");
            this.getImageTemplate = await this.getTemplate("get-image");

            this.createScenarioTemplate = await this.getTemplate("create-scenario");
            this.createWorldTemplate = await this.getTemplate("create-world");
            this.describeWorldTemplate = await this.getTemplate("describe-world");
            this.createMetadataTemplate = await this.getTemplate("create-metadata");

            this.createPlayerTemplate = await this.getTemplate("create-player");
            this.createNPCTemplate = await this.getTemplate("create-npc");
            this.updateCharacterTemplate = await this.getTemplate("update-character");
            this.describeCharacterTemplate = await this.getTemplate("describe-character");
        }

        private compiler = new Durian.Template.Compiler();
        private async getTemplate(name: string): Promise<(...params: any[]) => Promise<string>>
        {
            let text: string;
            let template: Durian.Template.Template;

            try
            {
                text = await (await fetch("templates/" + name + ".txt")).text();
                template = this.compiler.build(text);
                const f = this.compiler.compile(template) as AsyncFunction;
                return async (...params: any[]) => this.sanitizePrompt(await f(...params));
            }
            catch (error)
            {
                console.error("Loading Template failed:", name, error, text, template);
            }
        }

        private sanitizePrompt(input: string): string
        {
            input = input.trim();
            input = input.replaceAll(/[ \t]+$/gm, "");
            input = input.replaceAll(/\n{2,}<\//, "\n</");
            while (input.includes("\n\n\n"))
                input = input.replace("\n\n\n", "\n\n");
            return input;
        }

        private async getSchema(name: string): Promise<Schema>
        {
            try
            {
                return await (await fetch("templates/" + name + ".json")).json();
            }
            catch (error)
            {
                console.error("Loading Schema failed:", name, error);
            }
        }

        public plotSchema: Schema;
        public advancePlotTemplate: (...params: any[]) => Promise<string>;
        public writePrologueTemplate: (...params: any[]) => Promise<string>;

        public choicesSchema: Schema;
        public offerChoicesTemplate: (...params: any[]) => Promise<string>;

        public summarizeProgressionTemplate: (...params: any[]) => Promise<string>;

        public describeSceneTemplate: (...params: any[]) => Promise<string>;

        public getImageTemplate: (...params: any[]) => Promise<string>;

        public createScenarioTemplate: (...params: any[]) => Promise<string>;
        public worldSchema: Schema;
        public createWorldTemplate: (...params: any[]) => Promise<string>;
        public describeWorldTemplate: (...params: any[]) => Promise<string>;
        public metadataSchema: Schema;
        public createMetadataTemplate: (...params: any[]) => Promise<string>;

        public characterSchema: Schema;
        public createPlayerTemplate: (...params: any[]) => Promise<string>;
        public createNPCTemplate: (...params: any[]) => Promise<string>;

        public characterUpdateSchema: Schema;
        public updateCharacterTemplate: (...params: any[]) => Promise<string>;

        public describeCharacterTemplate: (...params: any[]) => Promise<string>;

        public removeThinkingSteps(text: string): string
        {
            return text.replace(/<think[^>\s]*>[\s\S]*?<\/think[^>\s]*>/g, "").trim();
        }

        public parseJSON(input: string): any
        {
            function parse(text: string): any
            {
                const fixedJson = text.replace(/,\s*([}\]])/g, "$1");
                return JSON.parse(fixedJson);
            }

            let json = input.trim();
            try
            {
                const obj = parse(json);
                this.cleanUpJSON(obj);
                return obj;
            }
            catch { }

            const jsonBlocks = [...input.matchAll(/```json\s*([\s\S]*?)```/gi)];
            const finalBlock = jsonBlocks[jsonBlocks.length - 1];
            if (finalBlock && !input.slice(finalBlock.index + finalBlock[0].length).trim())
                json = finalBlock[1].trim();
            else
            {
                let extractedJSON: string;
                for (let index = input.length - 1; index >= 0; index--)
                {
                    if (input[index] != "{" && input[index] != "[") continue;
                    const candidate = input.slice(index).trim();
                    try
                    {
                        parse(candidate);
                        extractedJSON = candidate;
                        break;
                    }
                    catch
                    {
                        const repairedCandidate = this.escapeUnescapedQuotes(candidate);
                        try
                        {
                            parse(repairedCandidate);
                            extractedJSON = repairedCandidate;
                            break;
                        }
                        catch { }
                    }
                }
                json = extractedJSON ?? input.replaceAll("```json", "").replaceAll("```", "").trim();
            }

            let obj: any;
            try
            {
                obj = parse(json);
            }
            catch
            {
                obj = parse(this.escapeUnescapedQuotes(json));
            }
            this.cleanUpJSON(obj);
            return obj;
        }

        private escapeUnescapedQuotes(input: string): string
        {
            let output = "";
            let inString = false;
            for (let index = 0; index < input.length; index++)
            {
                const character = input[index];
                if (character == "\\" && inString && index + 1 < input.length)
                {
                    output += character + input[++index];
                    continue;
                }
                if (character != '"')
                {
                    output += character;
                    continue;
                }
                if (!inString)
                {
                    inString = true;
                    output += character;
                    continue;
                }

                let next = index + 1;
                while (/\s/.test(input[next] ?? "")) next++;
                if (next == input.length || ",]}:".includes(input[next]))
                {
                    inString = false;
                    output += character;
                }
                else
                    output += "\\\"";
            }
            return output;
        }

        private cleanUpJSON(obj: any)
        {
            // remove whitespace on string properties
            for (const [key, value] of Object.entries(obj))
            {
                if (!value) continue;
                if (typeof value === "string")
                    obj[key] = value.trim();
                if (typeof value === "object")
                    this.cleanUpJSON(value);
            }
        }
    }
}