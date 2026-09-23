///<reference path="TemplatingBase.ts" />
///<reference path="Logger.ts" />

namespace AI
{
    export const Client = new class extends TemplatingBase
    {
        private async runTextRequest(methodName: string, messages: Message[], temperature: number, schema?: Schema): Promise<string>
        {
            const startedAt = Date.now();
            try
            {
                const result = await textAPI.generateInteractions(messages, temperature, schema);
                Logger.logRequest(methodName, messages, result, "message", startedAt);
                return result;
            }
            catch (error)
            {
                const message = error instanceof Error ? error.message : String(error);
                Logger.logRequest(methodName, messages, message, "error", startedAt);
                throw error;
            }
        }

        private async runImageRequest(methodName: string, prompt: string): Promise<string>
        {
            const startedAt = Date.now();
            try
            {
                const result = await imageAPI.generateImage(prompt);
                Logger.logRequest(methodName, [{ role: "user", content: prompt }], result, "message", startedAt);
                return result;
            }
            catch (error)
            {
                const message = error instanceof Error ? error.message : String(error);
                Logger.logRequest(methodName, [{ role: "user", content: prompt }], message, "error", startedAt);
                throw error;
            }
        }

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

            const result = await this.runTextRequest("advancePlot", messages, 0.8, this.plotSchema);
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

            const result = await this.runTextRequest("writePrologue", messages, 0.8, this.plotSchema);
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

            const result = await this.runTextRequest("offerChoices", messages, 0.7, this.choicesSchema);
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

            return await this.runTextRequest("summarizeProgression", messages, 0.3);
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

            const result = await this.runTextRequest("describeScene", messages, 0.8, this.imagePromptSchema);
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

            const result = await this.runTextRequest("createWorld", messages, 0.5, this.worldSchema);
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

            const result = await this.runTextRequest("describeWorld", messages, 0.8, this.imagePromptSchema);
            const obj = this.parseJSON(result);

            return obj.description;
        }

        public async extractOverview(allowedTags: string[], world: Data.World): Promise<{ description: string, selected_tags: string[], mature: boolean; }>
        {
            const prompt: string = await this.extractOverviewTemplate(allowedTags, world);

            const messages: Message[] = [
                { role: "system", content: prompt }
            ];

            const result = await this.runTextRequest("extractOverview", messages, 0.3, this.overviewSchema);
            const obj = this.parseJSON(result);
            return obj;
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

            const result = await this.runTextRequest("createPlayer", messages, 0.8, this.characterSchema);
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

            const result = await this.runTextRequest("createNPC", messages, 0.8, this.characterSchema);
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

            const result = await this.runTextRequest("updateCharacter", messages, 0.5, this.characterUpdateSchema);
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

            const result = await this.runTextRequest("describeCharacter", messages, 0.8, this.imagePromptSchema);
            const obj = this.parseJSON(result);

            return obj.description;
        }

        public async getImage(description: string): Promise<string>
        {
            const prompt = await this.getImageTemplate(description);
            return await this.runImageRequest("getImage", prompt);
        }
    }();
}