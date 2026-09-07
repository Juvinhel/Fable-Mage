namespace API
{
    export const AI = new class
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
            this.createNPCTemplate = await getTemplate("create-npc");
        }

        private getPlotTemplate: AsyncFunction;
        public async getPlot(
            input: string,
            previous_plot: string[],
            world: Data.World): Promise<{ plot: string, hidden: string, image: string; }>
        {
            const url = App.config.endpoint + "/api/v1/generate";
            const grammar = "char ::= [^\"\\\\\\x7F\\x00-\\x1F] | [\\\\] ([\"\\\\bfnrt] | \"u\" [0-9a-fA-F]{4})\nimagery-kv ::= \"\\\"imagery\\\"\" space \":\" space string\nplot-kv ::= \"\\\"plot\\\"\" space \":\" space string\nroot ::= \"{\" space plot-kv \",\" space unseen-kv \",\" space imagery-kv space \"}\"\nspace ::= | \" \" | \"\\n\"{1,2} [ \\t]{0,20}\nstring ::= \"\\\"\" char* \"\\\"\"\nunseen-kv ::= \"\\\"unseen\\\"\" space \":\" space string";

            let prompt = await this.getPlotTemplate(input, previous_plot, world);
            console.log("getPlot (prompt)", prompt);

            const authorization = App.config.username && App.config.password ? btoa(App.config.username + ":" + App.config.password) : null;
            const body: API.KoboldCPP.GenerationInput = {
                prompt,
                grammar,
                smoothing_factor: 0,
                max_length: App.config.textGenerationMaxLength,
            };

            const response = await fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        "Authorization": "Basic " + authorization
                    }
                });

            const output: API.KoboldCPP.GenerationOutput = await response.json();
            console.log("getPlot (output)", output);

            let result = output.results[0];
            if (result.finish_reason == "length") throw new Error("The max_length of request was to low!");

            const obj = JSON.parse(result.text.replaceAll("```json", "").replaceAll("```", ""));

            return { plot: obj.plot, hidden: obj.unseen, image: obj.imagery };
        }

        private getImageTemplate: AsyncFunction;
        public async getImage(description: string): Promise<string>
        {
            const url = App.config.endpoint + "/sdapi/v1/txt2img";

            const prompt = await this.getImageTemplate(description);
            console.log("createImage (prompt)", prompt);

            const authorization = App.config.username && App.config.password ? btoa(App.config.username + ":" + App.config.password) : null;
            const body: API.KoboldCPP.TXT2ImgInput = {
                prompt: prompt,
                negative_prompt: "",
                steps: 20,
                cfg_scale: 7.5,
                width: 512,
                height: 512,
                sd_model_checkpoint: "",
                sampler_name: "default",
            };

            const response = await fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        "Authorization": "Basic " + authorization
                    }
                });

            const output: API.KoboldCPP.TXT2ImgOutput = await response.json();
            console.log("createImage (output)", output);

            const base64 = output.images[0];

            return base64;
        }

        private createNPCTemplate: AsyncFunction;
        public async createNPC(
            input: string,
            world: Data.World): Promise<Data.CharacterCard>
        {
            const url = App.config.endpoint + "/api/v1/generate";
            const grammar = "appearance-kv ::= \"\\\"appearance\\\"\" space \":\" space string\nbackstory-kv ::= \"\\\"backstory\\\"\" space \":\" space string\nchar ::= [^\"\\\\\\x7F\\x00-\\x1F] | [\\\\] ([\"\\\\bfnrt] | \"u\" [0-9a-fA-F]{4})\nname-kv ::= \"\\\"name\\\"\" space \":\" space string\npersonality-kv ::= \"\\\"personality\\\"\" space \":\" space string\nroot ::= \"{\" space name-kv \",\" space appearance-kv \",\" space personality-kv \",\" space backstory-kv space \"}\"\nspace ::= | \" \" | \"\\n\"{1,2} [ \\t]{0,20}\nstring ::= \"\\\"\" char* \"\\\"\"";

            let prompt = await this.createNPCTemplate(input, world);
            console.log("createNPC (prompt)", prompt);

            const authorization = App.config.username && App.config.password ? btoa(App.config.username + ":" + App.config.password) : null;
            const body: API.KoboldCPP.GenerationInput = {
                prompt,
                grammar,
                smoothing_factor: 0,
                max_length: App.config.textGenerationMaxLength,
            };

            const response = await fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        "Authorization": "Basic " + authorization
                    }
                });

            const output: API.KoboldCPP.GenerationOutput = await response.json();
            console.log("createNPC (output)", output);

            let result = output.results[0];
            if (result.finish_reason == "length") throw new Error("The max_length of request was to low!");

            const obj = JSON.parse(result.text.replaceAll("```json", "").replaceAll("```", ""));

            return obj;
        }

        public async getAmbientImage(
            plot: string[],
            world: Data.World): Promise<{ image: string; }>
        {
            const url = App.config.endpoint + "/api/v1/generate";

            let prompt = "";

            prompt += "<rules>\n";
            prompt += "You are an are an artist visualizing the following scene.\n";
            prompt += "</rules>\n";

            prompt += "<task>\n";
            prompt += "Describe the scene in vivid detail so an image generation ai can use it.\n";
            prompt += "Use around 50 to 100 words.\n";
            prompt += "</task>\n";

            prompt += "<world_scenario>\n";
            prompt += world.scenario + ".\n";
            prompt += "</world_scenario>\n";

            //prompt += "<character>\n";
            //prompt += this.readCharacterCard(world.player);
            //prompt += "</character>\n";
            //
            //for (const npcCard of world.npcs)
            //{
            //    prompt += "<character>\n";
            //    prompt += this.readCharacterCard(npcCard);
            //    prompt += "</character>\n";
            //}

            prompt += "<scene>\n";
            for (const plotPoint of plot)
                prompt += plotPoint + "\n\n";
            prompt += "</scene>\n";
            console.log("getAmbientImage description (prompt)", prompt);

            const authorization = App.config.username && App.config.password ? btoa(App.config.username + ":" + App.config.password) : null;
            const body: API.KoboldCPP.GenerationInput = {
                prompt,
                smoothing_factor: 0,
                max_length: App.config.textGenerationMaxLength,
            };

            const response = await fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        "Authorization": "Basic " + authorization
                    }
                });

            const output: API.KoboldCPP.GenerationOutput = await response.json();
            console.log("getAmbientImage description (output)", output);

            return null;
        }
    }();
}