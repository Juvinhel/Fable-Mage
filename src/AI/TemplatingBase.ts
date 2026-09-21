namespace AI
{
    export class TemplatingBase
    {
        public async initialize()
        {
            this.plotSchema = await this.getSchema("plot");
            this.choicesSchema = await this.getSchema("choices");
            this.imagePromptSchema = await this.getSchema("image-prompt");
            this.worldSchema = await this.getSchema("world");
            this.overviewSchema = await this.getSchema("overview");
            this.characterSchema = await this.getSchema("character");
            this.characterUpdateSchema = await this.getSchema("character-update");
            this.memorySchema = await this.getSchema("memory");

            this.advancePlotTemplate = await this.getTemplate("advance-plot");
            this.offerChoicesTemplate = await this.getTemplate("offer-choices");
            this.summarizeProgressionTemplate = await this.getTemplate("summarize-progression");
            this.writePrologueTemplate = await this.getTemplate("write-prologue");
            this.describeSceneTemplate = await this.getTemplate("describe-scene");
            this.getImageTemplate = await this.getTemplate("get-image");
            this.createWorldTemplate = await this.getTemplate("create-world");
            this.describeWorldTemplate = await this.getTemplate("describe-world");
            this.extractOverviewTemplate = await this.getTemplate("extract-overview");
            this.createPlayerTemplate = await this.getTemplate("create-player");
            this.createNPCTemplate = await this.getTemplate("create-npc");
            this.updateCharacterTemplate = await this.getTemplate("update-character");
            this.describeCharacterTemplate = await this.getTemplate("describe-character");
            this.archiveMemoryTemplate = await this.getTemplate("archive-memory");
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
                console.log(name + ":", template.code);
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
            input = input.replaceAll(/\n[^\S\r\n]+/, "\n");
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

        public imagePromptSchema: Schema;
        public describeSceneTemplate: (...params: any[]) => Promise<string>;

        public getImageTemplate: (...params: any[]) => Promise<string>;

        public worldSchema: Schema;
        public createWorldTemplate: (...params: any[]) => Promise<string>;
        public describeWorldTemplate: (...params: any[]) => Promise<string>;
        public overviewSchema: Schema;
        public extractOverviewTemplate: (...params: any[]) => Promise<string>;

        public characterSchema: Schema;
        public createPlayerTemplate: (...params: any[]) => Promise<string>;
        public createNPCTemplate: (...params: any[]) => Promise<string>;

        public characterUpdateSchema: Schema;
        public updateCharacterTemplate: (...params: any[]) => Promise<string>;

        public describeCharacterTemplate: (...params: any[]) => Promise<string>;

        public memorySchema: Schema;
        public archiveMemoryTemplate: (...params: any[]) => Promise<string>;

        public parseJSON(input: string): any
        {
            const obj = JSON.parse(input.replaceAll("```json", "").replaceAll("```", ""));
            this.cleanUpJSON(obj);
            return obj;
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