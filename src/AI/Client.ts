namespace AI
{
    export const Client = new class
    {
        public async initialize()
        {
            // load templates 
            const compiler = new Durian.Template.Compiler();
            async function getTemplate(name: string): Promise<(...params: any[]) => Promise<string>>
            {
                let text: string;
                let template: Durian.Template.Template;

                try
                {
                    text = await (await fetch("templates/" + name + ".txt")).text();
                    template = compiler.build(text);
                    const f = compiler.compile(template) as AsyncFunction;
                    return async (...params: any[]) => (await f(...params)).trim();
                }
                catch (error)
                {
                    console.error("Loading Template failed:", name, error, text, template);
                }
            }

            this.getPlotTemplate = await getTemplate("plot");
            this.writeIntroductionTemplate = await getTemplate("write-introduction");
            this.getImageTemplate = await getTemplate("image");
            this.createCharacterTemplate = await getTemplate("create-character");
            this.createWorldTemplate = await getTemplate("create-world");

            async function getSchema(name: string): Promise<any>
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

            this.getPlotSchema = await getSchema("plot");
            this.createCharacterSchema = await getSchema("create-character");
            this.createWorldSchema = await getSchema("create-world");
        }

        private getPlotTemplate: (...params: any[]) => Promise<string>;
        private getPlotSchema: any;

        private writeIntroductionTemplate: (...params: any[]) => Promise<string>;

        private getImageTemplate: (...params: any[]) => Promise<string>;

        private createCharacterTemplate: (...params: any[]) => Promise<string>;
        private createCharacterSchema: any;

        private createWorldTemplate: (...params: any[]) => Promise<string>;
        private createWorldSchema: any;

        public async getPlot(
            input: string,
            previous_plot: string[],
            world: Data.World): Promise<{ plot: string, unrevealed: string, scenery: string; }>
        {
            let prompt: string = await this.getPlotTemplate(input, previous_plot, world);
            const messages: Message[] = [
                { role: "system", content: prompt },
                ...previous_plot.map(x => ({ role: "assistant", content: x } as Message)),
                { role: "user", content: input }];

            const result = await API.generateInteractions(messages, this.getPlotSchema);

            const obj = JSON.parse(result.replaceAll("```json", "").replaceAll("```", ""));
            return { plot: obj.plot, unrevealed: obj.unseen, scenery: obj.imagery };
        }

        public async getImage(description: string): Promise<string>
        {
            const prompt = await this.getImageTemplate(description);

            const result = await API.generateImage(prompt);

            return result;
        }

        public async createCharacter(
            input: string,
            world: Data.World): Promise<Data.CharacterCard>
        {
            const prompt = await this.createCharacterTemplate(input, world);

            const result = await API.generateText(prompt, this.createCharacterSchema);

            const obj = JSON.parse(result.replaceAll("```json", "").replaceAll("```", ""));
            return obj;
        }

        public async createWorld(input: string): Promise<{
            "title": string,
            "scenario": string,
            "author-style": string,
            "introduction": string,
            "focus": string,
            "protagonist": string;
        }>
        {
            const prompt = await this.createWorldTemplate(input);
            const result = await API.generateText(prompt, this.createWorldSchema);

            const obj = JSON.parse(result.replaceAll("```json", "").replaceAll("```", ""));
            return obj;
        }

        public async writeIntroduction(world: Data.World): Promise<{ plot: string, unrevealed: string, scenery: string; }>
        {
            let prompt: string = await this.writeIntroductionTemplate(world);

            const result = await API.generateText(prompt, this.getPlotSchema);

            const obj = JSON.parse(result.replaceAll("```json", "").replaceAll("```", ""));
            return { plot: obj.plot, unrevealed: obj.unseen, scenery: obj.imagery };
        }
    }();
}