namespace AI
{
    export const Client = new class
    {
        public async initialize()
        {
            this.getPlotTemplate = await this.getTemplate("plot");
            this.writePrologueTemplate = await this.getTemplate("write-prologue");
            this.getImageTemplate = await this.getTemplate("image");
            this.createCharacterTemplate = await this.getTemplate("create-character");
            this.createWorldTemplate = await this.getTemplate("create-world");

            this.getPlotSchema = await this.getSchema("plot");
            this.createCharacterSchema = await this.getSchema("create-character");
            this.createWorldSchema = await this.getSchema("create-world");
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
            input = input.replaceAll(/\n[^\S\r\n]+/, "\n");
            input = input.replaceAll(/\n{2,}<\//, "\n</");
            while (input.includes("\n\n\n"))
                input = input.replace("\n\n\n", "\n\n");
            return input;
        }

        private async getSchema(name: string): Promise<any>
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

        private getPlotTemplate: (...params: any[]) => Promise<string>;
        private getPlotSchema: any;

        private writePrologueTemplate: (...params: any[]) => Promise<string>;

        private getImageTemplate: (...params: any[]) => Promise<string>;

        private createCharacterTemplate: (...params: any[]) => Promise<string>;
        private createCharacterSchema: any;

        private createWorldTemplate: (...params: any[]) => Promise<string>;
        private createWorldSchema: any;

        public async getPlot(
            input: string,
            plot: Data.Plot,
            world: Data.World): Promise<{ plot: string; unrevealed: string; scenery: string; }>
        {
            let prompt: string = await this.getPlotTemplate(input, plot, world);
            const result = await textAPI.generateText(prompt, this.getPlotSchema);
            const obj = this.parseJSON(result);
            return { plot: obj.plot.trim(), unrevealed: obj.unseen.trim(), scenery: obj.imagery.trim() };
        }

        public async getImage(description: string): Promise<string>
        {
            const prompt = await this.getImageTemplate(description);
            const result = await imageAPI.generateImage(prompt);
            return result;
        }

        public async createCharacter(
            input: string,
            world: Data.World): Promise<Data.CharacterCard>
        {
            const prompt = await this.createCharacterTemplate(input, world);
            const result = await textAPI.generateText(prompt, this.createCharacterSchema);
            const obj = this.parseJSON(result);
            return obj as Data.CharacterCard;
        }

        public async createWorld(input: string): Promise<{
            "title": string,
            "scenario": string,
            "author-style": string,
            "focus": string,
            "protagonist": string;
        }>
        {
            const prompt = await this.createWorldTemplate(input);
            const result = await textAPI.generateText(prompt, this.createWorldSchema);
            const obj = this.parseJSON(result);
            return obj as any;
        }

        public async writePrologue(input: string, world: Data.World): Promise<{ plot: string, unrevealed: string, scenery: string; }>
        {
            let prompt: string = await this.writePrologueTemplate(input, world);

            const result = await textAPI.generateText(prompt, this.getPlotSchema);
            const obj = this.parseJSON(result);

            return { plot: obj.plot, unrevealed: obj.unseen, scenery: obj.imagery };
        }

        private parseJSON(input: string): any
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
    }();
}