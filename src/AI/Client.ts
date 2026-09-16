///<reference path="TemplatingBase.ts" />

namespace AI
{
    export const Client = new class extends TemplatingBase
    {
        public async advancePlot(
            input: string,
            summary: string,
            plot: Data.Plot,
            world: Data.World): Promise<{ plot: string; time: string; location: string; internal: string; }>
        {
            const prompt: string = await this.advancePlotTemplate(summary, plot, world);

            const messages: Message[] = [{ role: "system", content: prompt }];
            for (const plotPoint of plot)
            {
                messages.push({ role: "user", content: plotPoint.input ?? "Start Game" });
                let content = "";
                content += "Location: " + plotPoint.location + "\n";
                content += "Time: " + plotPoint.time + "\n";
                content += "Narrative: " + plotPoint.text + "\n";
                content += "Internal: " + plotPoint.internal;
                messages.push({ role: "assistant", content });
            }
            messages.push({ role: "user", content: input });

            const result = await textAPI.generateInteractions(messages, 0.8, this.plotSchema);
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

            const result = await textAPI.generateInteractions(messages, 0.8, this.plotSchema);
            const obj = this.parseJSON(result);

            return obj;
        }

        public async offerChoices(
            plot: Data.Plot,
            world: Data.World): Promise<string[]>
        {
            const prompt: string = await this.offerChoicesTemplate(plot, world);

            const messages: Message[] = [{ role: "system", content: prompt }];
            for (const plotPoint of plot)
            {
                messages.push({ role: "user", content: plotPoint.input ?? "Start Game" });
                let content = "";
                content += "Location: " + plotPoint.location + "\n";
                content += "Time: " + plotPoint.time + "\n";
                content += "Narrative: " + plotPoint.text + "\n";
                content += "Internal: " + plotPoint.internal;
                messages.push({ role: "assistant", content });
            }

            const result = await textAPI.generateInteractions(messages, 0.7, this.choicesSchema);
            const obj = this.parseJSON(result);

            return [obj["first-choice"], obj["second-choice"], obj["third-choice"]];
        }

        public async summarizeProgression(previousSummary: string, plot: Data.Plot, world: Data.World): Promise<string>
        {
            const prompt: string = await this.summarizeProgressionTemplate(previousSummary, plot.length + 1, world);
            const messages: Message[] = [{ role: "system", content: prompt }];
            for (const plotPoint of plot)
            {
                messages.push({ role: "user", content: plotPoint.input ?? "Start Game" });
                let content = "";
                content += "Location: " + plotPoint.location + "\n";
                content += "Time: " + plotPoint.time + "\n";
                content += "Narrative: " + plotPoint.text + "\n";
                content += "Internal: " + plotPoint.internal;
                messages.push({ role: "assistant", content });
            }

            const result = await textAPI.generateInteractions(messages, 0.3);
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

            const result = await textAPI.generateInteractions(messages, 0.8, this.imagePromptSchema);
            const obj = this.parseJSON(result);

            return obj.description;
        }

        public async createWorld(input: string): Promise<{
            "title": string,
            "scenario": string,
            "author-style": string,
            "rules": string,
            "protagonist": string;
        }>
        {
            const prompt = await this.createWorldTemplate();
            const messages: Message[] = [
                { role: "system", content: prompt },
                { role: "user", content: input }
            ];

            const result = await textAPI.generateInteractions(messages, 0.8, this.worldSchema);
            const obj = this.parseJSON(result);

            return obj;
        }

        public async describeWorld(world: Data.World): Promise<string>
        {
            const prompt: string = await this.describeWorldTemplate(world);

            const messages: Message[] = [
                { role: "system", content: prompt },
                { role: "user", content: world.scenario }
            ];

            const result = await textAPI.generateInteractions(messages, 0.8, this.imagePromptSchema);
            const obj = this.parseJSON(result);

            return obj.description;
        }

        public async extractTags(allowedTags: string[], world: Data.World): Promise<string[]>
        {
            const prompt: string = await this.extractTagsTemplate(allowedTags, world);

            const messages: Message[] = [
                { role: "system", content: prompt }
            ];

            const result = await textAPI.generateInteractions(messages, 0.3, this.tagsSchema);
            const obj = this.parseJSON(result);
            return obj.selected_tags;
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

            const result = await textAPI.generateInteractions(messages, 0.8, this.characterSchema);
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

            const result = await textAPI.generateInteractions(messages, 0.8, this.characterSchema);
            const obj = this.parseJSON(result);
            return obj as Data.Character;
        }

        public async updateCharacter(character: Data.Character, world: Data.World, plot: Data.Plot): Promise<Partial<Data.Character>>
        {
            const prompt = await this.updateCharacterTemplate(character, world);
            const messages: Message[] = [{ role: "system", content: prompt }];
            for (const plotPoint of plot)
            {
                messages.push({ role: "user", content: plotPoint.input ?? "Start Game" });
                let content = "";
                content += "Location: " + plotPoint.location + "\n";
                content += "Time: " + plotPoint.time + "\n";
                content += "Narrative: " + plotPoint.text + "\n";
                content += "Internal: " + plotPoint.internal;
                messages.push({ role: "assistant", content });
            }

            const result = await textAPI.generateInteractions(messages, 0.5, this.characterUpdateSchema);
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

            const result = await textAPI.generateInteractions(messages, 0.8, this.imagePromptSchema);
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

            const result = await textAPI.generateInteractions(messages, 0.3, this.memorySchema);
            const arr = this.parseJSON(result);
            return arr;
        }

        public async getImage(description: string): Promise<string>
        {
            const prompt = await this.getImageTemplate(description);
            const result = await imageAPI.generateImage(prompt);
            return result;
        }
    }();
}