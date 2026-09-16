namespace AI
{
    export const Client = new class
    {
        public async initialize()
        {
            this.plotSchema = await this.getSchema("plot");
            this.choicesSchema = await this.getSchema("choices");
            this.imagePromptSchema = await this.getSchema("image-prompt");
            this.worldSchema = await this.getSchema("world");
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
            this.createPlayerTemplate = await this.getTemplate("create-player");
            this.createNPCTemplate = await this.getTemplate("create-npc");
            this.updateCharacterTemplate = await this.getTemplate("update-character");
            this.describeCharacterTemplate = await this.getTemplate("create-npc");
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

        private plotSchema: any;
        private advancePlotTemplate: (...params: any[]) => Promise<string>;
        private writePrologueTemplate: (...params: any[]) => Promise<string>;

        private choicesSchema: any;
        private offerChoicesTemplate: (...params: any[]) => Promise<string>;

        private summarizeProgressionTemplate: (...params: any[]) => Promise<string>;

        private imagePromptSchema: any;
        private describeSceneTemplate: (...params: any[]) => Promise<string>;

        private getImageTemplate: (...params: any[]) => Promise<string>;

        private worldSchema: any;
        private createWorldTemplate: (...params: any[]) => Promise<string>;
        private describeWorldTemplate: (...params: any[]) => Promise<string>;

        private characterSchema: any;
        private createPlayerTemplate: (...params: any[]) => Promise<string>;
        private createNPCTemplate: (...params: any[]) => Promise<string>;

        private characterUpdateSchema: any;
        private updateCharacterTemplate: (...params: any[]) => Promise<string>;

        private describeCharacterTemplate: (...params: any[]) => Promise<string>;

        private memorySchema: any;
        private archiveMemoryTemplate: (...params: any[]) => Promise<string>;

        public async advancePlot(
            input: string,
            summary: string,
            plot: Data.Plot,
            world: Data.World): Promise<{ plot: string; time: string; location: string; internal: string; }>
        {
            const prompt: string = await this.advancePlotTemplate(plot, world);

            const messages: Message[] = [{ role: "system", content: prompt }];
            if (summary)
                messages.push({ role: "assistant", content: "Summary of older turns:" + summary });
            for (const plotPoint of plot)
            {
                let content = "";
                content += "Location: " + plotPoint.location + "\n";
                content += "Time: " + plotPoint.time + "\n";
                content += "Narrative: " + plotPoint.text + "\n";
                content += "Internal: " + plotPoint.internal;
                messages.push({ role: "assistant", content });
            }
            messages.push({ role: "user", content: input });

            const result = await textAPI.generateInteractions(messages, this.plotSchema);
            const obj = this.parseJSON(result);
            return obj;
        }

        public async writePrologue(input: string,
            world: Data.World): Promise<{ plot: string; time: string; location: string; internal: string; }>
        {
            const prompt: string = await this.writePrologueTemplate(world);

            const messages: Message[] = [
                { role: "system", content: prompt },
                { role: "user", content: input }];

            const result = await textAPI.generateInteractions(messages, this.plotSchema);
            const obj = this.parseJSON(result);

            return obj;
        }

        public async offerChoices(
            plot: Data.Plot,
            world: Data.World): Promise<string[]>
        {
            const prompt: string = await this.offerChoicesTemplate(plot, world);

            const messages: Message[] = [
                { role: "system", content: prompt },
                ...plot.slice(-3).map(x => ({
                    role: "assistant",
                    content: "Location: " + x.location + "\nTime: " + x.time + "\nNarrative:\n" + x.text
                }) as Message)
            ];

            const result = await textAPI.generateInteractions(messages, this.choicesSchema);
            const obj = this.parseJSON(result);

            return [obj["first-choice"], obj["second-choice"], obj["third-choice"]];
        }

        public async summarizeProgression(previousSummary: string, plot: Data.Plot, world: Data.World): Promise<string>
        {
            const prompt: string = await this.summarizeProgressionTemplate(plot.length + 1, world);
            const messages: Message[] = [{ role: "system", content: prompt }];
            if (previousSummary)
                messages.push({ role: "assistant", content: "Summary of older turns:" + previousSummary });
            for (const plotPoint of plot)
            {
                let content = "";
                content += "Location: " + plotPoint.location + "\n";
                content += "Time: " + plotPoint.time + "\n";
                content += "Narrative: " + plotPoint.text + "\n";
                content += "Internal: " + plotPoint.internal;
                messages.push({ role: "user", content });
            }

            const result = await textAPI.generateInteractions(messages);
            return result;
        }

        public async describeScene(
            scene: string,
            world: Data.World): Promise<string>
        {
            const prompt: string = await this.describeSceneTemplate(world);

            const messages: Message[] = [
                { role: "system", content: prompt },
                { role: "user", content: scene }
            ];

            const result = await textAPI.generateInteractions(messages, this.imagePromptSchema);
            const obj = this.parseJSON(result);

            return obj.description;
        }

        public async getImage(description: string): Promise<string>
        {
            const prompt = await this.getImageTemplate(description);
            const result = await imageAPI.generateImage(prompt);
            return result;
        }

        public async createWorld(input: string): Promise<{
            "title": string,
            "scenario": string,
            "author-style": string,
            "focus": string,
            "protagonist": string;
        }>
        {
            const prompt = await this.createWorldTemplate();
            const messages: Message[] = [
                { role: "system", content: prompt },
                { role: "user", content: input }
            ];

            const result = await textAPI.generateInteractions(messages, this.worldSchema);
            const obj = this.parseJSON(result);
            return obj as any;
        }

        public async describeWorld(world: Data.World): Promise<string>
        {
            const prompt: string = await this.describeWorldTemplate(world);

            const messages: Message[] = [
                { role: "system", content: prompt },
                { role: "user", content: world.scenario }
            ];

            const result = await textAPI.generateInteractions(messages, this.imagePromptSchema);
            const obj = this.parseJSON(result);

            return obj.description;
        }

        public async createPlayer(
            input: string,
            world: Data.World): Promise<Data.Character>
        {
            const prompt = await this.createPlayerTemplate(world);
            const messages: Message[] = [
                { role: "system", content: prompt },
                { role: "user", content: input }
            ];

            const result = await textAPI.generateInteractions(messages, this.characterSchema);
            const obj = this.parseJSON(result);
            return obj as Data.Character;
        }

        public async createNPC(
            input: string,
            world: Data.World): Promise<Data.Character>
        {
            const prompt = await this.createNPCTemplate(world);
            const messages: Message[] = [
                { role: "system", content: prompt },
                { role: "user", content: input }
            ];

            const result = await textAPI.generateInteractions(messages, this.characterSchema);
            const obj = this.parseJSON(result);
            return obj as Data.Character;
        }

        public async updateCharacter(character: Data.Character, world: Data.World, plot: Data.Plot): Promise<Partial<Data.Character>>
        {
            const prompt = await this.updateCharacterTemplate(character, world);
            const messages: Message[] = [
                { role: "system", content: prompt },
            ];
            for (const plotPoint of plot)
            {
                let content = "";
                content += "Narrative: " + plotPoint.text + "\n";
                content += "Internal: " + plotPoint.internal;
                messages.push({ role: "user", content });
            }

            const result = await textAPI.generateInteractions(messages, this.characterUpdateSchema);
            const obj = this.parseJSON(result) as Partial<Data.Character>;

            return Object.fromEntries(Object.entries(obj).map(([key, value]) => [Helper.convertPascalCaseToKebabCase(key), value]));
        }

        public async describeCharacter(character: Data.Character): Promise<string>
        {
            const prompt: string = await this.describeCharacterTemplate(character);

            const messages: Message[] = [
                { role: "system", content: prompt },
                { role: "user", content: character.appearance }
            ];

            const result = await textAPI.generateInteractions(messages, this.imagePromptSchema);
            const obj = this.parseJSON(result);

            return obj.description;
        }

        public async archiveMemory(
            plotPoint: Data.PlotPoint): Promise<{ category: string; summary: string; keywords: string; internal: boolean; content: string; }[]>
        {
            const prompt: string = await this.archiveMemoryTemplate();

            let content = "";
            content += "Narrative: " + plotPoint.text + "\n";
            content += "Internal: " + plotPoint.internal;
            const messages: Message[] = [
                { role: "system", content: prompt },
                { role: "user", content }
            ];

            const result = await textAPI.generateInteractions(messages, this.memorySchema);
            const arr = this.parseJSON(result);
            return arr;
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