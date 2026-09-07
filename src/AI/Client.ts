namespace AI
{
    export const Client = new class
    {
        public async initialize()
        {
            // load templates 
            const compiler = new Durian.Template.Compiler();

            async function getTemplate(name: string): Promise<AsyncFunction>
            {
                let text: string;
                let template: Durian.Template.Template;

                try
                {
                    text = await (await fetch("templates/" + name + ".txt")).text();
                    template = compiler.build(text);
                    return compiler.compile(template) as AsyncFunction;
                }
                catch (error)
                {
                    console.error("Loading Template failed:", name, error, text, template);
                }
            }

            this.getPlotTemplate = await getTemplate("plot");
            this.getImageTemplate = await getTemplate("image");
            this.createCharacterTemplate = await getTemplate("create-character");
            this.createStoryTemplate = await getTemplate("create-story");

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
            this.createStorySchema = await getSchema("create-story");
        }

        private getPlotTemplate: AsyncFunction;
        private getPlotSchema: any;

        private getImageTemplate: AsyncFunction;

        private createCharacterTemplate: AsyncFunction;
        private createCharacterSchema: any;

        private createStoryTemplate: AsyncFunction;
        private createStorySchema: any;

        public async getPlot(
            input: string,
            previous_plot: string[],
            world: Data.World): Promise<{ plot: string, hidden: string, image: string; }>
        {
            let prompt: string = await this.getPlotTemplate(input, previous_plot, world);

            const result = await API.generateText(prompt, this.getPlotSchema);

            //TEST
            //const system =

            let user_input = "";
            prompt = prompt.replace(/\<user_input\>(.*?)\<\/user_input\>/ms, (substring, group) => { user_input = group; return ""; });

            prompt = prompt.replace(/\<previous_plot\>(.*?)\<\/previous_plot\>/ms, "");

            const messages: Message[] = [{ role: "system", content: prompt }, ...previous_plot.map(x => ({ role: "assistant", content: x } as Message)), { role: "user", content: user_input }];
            console.log("m", messages);
            const r = await API.generateInteractions(messages, this.getPlotSchema);
            console.log("r", r);
            //await API.generateInteractions();

            const obj = JSON.parse(result.replaceAll("```json", "").replaceAll("```", ""));
            return { plot: obj.plot, hidden: obj.unseen, image: obj.imagery };
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

        public async createStory(input: string): Promise<{
            "title": "string",
            "scenario": "string",
            "author-style": "string",
            "introduction": "string",
            "protagonist": "string";
        }>
        {
            const prompt = await this.createStoryTemplate(input);
            const result = await API.generateText(prompt, this.createStorySchema);

            const obj = JSON.parse(result.replaceAll("```json", "").replaceAll("```", ""));
            return obj;
        }
    }();
}