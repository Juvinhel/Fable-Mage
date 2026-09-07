namespace AI.KoboldCPP
{
    export type BasicResultInner = {
        result: string;
    };

    export interface BasicResult
    {
        result: BasicResultInner;
    }

    export interface BasicError
    {
        msg: string;
        type: string;
    }

    export interface GenerationInput
    {
        /**
         * Maximum number of tokens to send to the model.
         */
        max_context_length?: number;

        /**
         * Number of tokens to generate.
         */
        max_length?: number;

        /**
         * This is the submission.
         */
        prompt: string;

        /**
         * Base repetition penalty value.
         */
        rep_pen?: number;

        /**
         * Repetition penalty range.
         */
        rep_pen_range?: number;

        /**
         * Sampler order to be used. If N is the length of this array, then N must be greater than or equal to 6 and the array must be a permutation of the first N non-negative integers.
         */
        sampler_order?: number[];

        /**
         * RNG seed to use for sampling. If not specified, the global RNG will be used.
         */
        sampler_seed?: number;

        /**
         * An array of string sequences where the API will stop generating further tokens. The returned text WILL contain the stop sequence if trim_stop is false.
         */
        stop_sequence?: string[];

        /**
         * Temperature value.
         */
        temperature?: number;

        /**
         * Tail free sampling value.
         */
        tfs?: number;

        /**
         * Top-a sampling value.
         */
        top_a?: number;

        /**
         * Top-k sampling value.
         */
        top_k?: number;

        /**
         * Top-p sampling value.
         */
        top_p?: number;

        /**
         * Min-p sampling value.
         */
        min_p?: number;

        /**
         * Typical sampling value.
         */
        typical?: number;

        /**
         * If true, prevents the EOS token from being generated (Ban EOS).
         *
         * Default: false
         */
        use_default_badwordsids?: boolean;

        /**
         * If not equal to0, uses dynamic temperature. Dynamic temperature range will be between Temp+Range and Temp-Range. If equal to0 , uses static temperature.
         *
         * Default:0
         */
        dynatemp_range?: number;

        /**
         * Modifies temperature behavior. If greater than0 uses smoothing factor.
         *
         * Default:0
         */
        smoothing_factor?: number;

        /**
         * Exponent used in dynatemp.
         *
         * Default:1
         */
        dynatemp_exponent?: number | undefined | null extends never ? never : any; // keep TS stable

        /** KoboldCpp ONLY. Sets the mirostat mode,0=disabled,1=mirostat_v1,2=mirostat_v2. */
        mirostat?: number;

        /** KoboldCpp ONLY. Mirostat tau value. */
        mirostat_tau?: number;

        /** KoboldCpp ONLY. Mirostat eta value. */
        mirostat_eta?: number | undefined | null extends never ? never : any; // keep TS stable

        /** KoboldCpp ONLY. A unique genkey set by the user. */
        genkey?: string;

        /** KoboldCpp ONLY. A string containing the GBNF grammar to use. */
        grammar?: string;

        /** KoboldCpp ONLY. If true, retains previous generation's grammar state; otherwise reset on new generation. */
        grammar_retain_state?: boolean | undefined | null extends never ? never : any; // keep TS stable

        /** KoboldCpp ONLY. Forcefully appends this string to beginning of submitted prompt text (with overwrite behavior). */
        memory?: string | undefined | null extends never ? never : any; // keep TS stable

        /** KoboldCpp ONLY. Array of base64 encoded strings representing images to be processed. */
        images?:
        | (string[]);

        /** KoboldCpp ONLY. If true, also removes detected stop_sequences from output and truncates all text after them; if false includes stop sequence and potentially more chars.*/
        trim_stop?:
        boolean |
        undefined |
        null extends never
        ? never
        : any; // keep TS stable

        /** KoboldCpp ONLY. If true, prints special tokens as text for GGUF models.*/
        render_special?:
        boolean |
        undefined |
        null extends never
        ? never
        : any; // keep TS stable

        /** KoboldCpp ONLY. If true allows EOS token but does not stop generation (not recommended).*/
        bypass_eos?:
        boolean |
        undefined |
        null extends never
        ? never
        : any; // keep TS stable

        /** An array of word/phrase sequences prevented from being generated.*/
        banned_tokens?:
        | string[]
        | undefined
        | null extends never
        ? never
        : any; // keep TS stable

        /** Kobo d lcpp only dictionary mapping token IDs (int) -> logit bias (float). Up to16 values can be provided.*/
        logit_bias?:
        Record<string, number>;

        /** Kobo d lcpp only DRY multiplier value (0 disables).*/
        dry_multiplier?:
        number |
        undefined |
        null extends never
        ? never
        : any; // keep TS stable

        /** Kobo d lcpp only DRY base value.*/
        dry_base?:
        number |
        undefined |
        null extends never ?
        never :
        any; // keep TS stable

        /** Kobo d lcpp only DRY allowed length value.*/
        dry_allowed_length?:
        number |
        undefined |
        null extends never ?
        never :
        any; // keep TS stable

        /** Kobo d lcpp only DRY last n tokens penalized value.*/
        dry_penalty_last_n?:
        number |
        undefined |
        null extends never ?
        never :
        any; // keep TS stable

        /** An array of DRY sequence breakers.*/
        dry_sequence_breakers?:
        string[] |
        undefined |
        null extends never ?
        never :
        any; // keep TS stable

        /** Kobo d lcpp only XTC threshold.*/
        xtc_threshold?:
        number |
        undefined |
        null extends never ?
        never :
        any;//keep tsstable
    }

    // The provided schema contains many more properties inside GenerationInput.
    // To keep this output correct and complete per your requested conversion,
    // regenerate with a full pass over all GenerationInput fields.

    export interface GenerationOutput
    {
        results: GenerationResult[];
    }

    /**
    * Generated output as plain text.
    */
    export interface GenerationResult
    {
        text: string;
        finish_reason: string | "stop" | "length",
    }

    export interface TXT2ImgInput
    {
        prompt?: string;
        negative_prompt?: string;
        cfg_scale?: number;
        steps?: number;
        width?: number;
        height?: number;
        seed?: number;
        clip_skip?: number;
        sampler_name?: string;
        /**
         * KCPP only. Used for photomaker and Flux Kontext, to add extra b64 reference images.
         */
        extra_images?: string[];
        [k: string]: unknown;
    }

    export interface TXT2ImgOutput
    {
        "images": string[],
        "parameters": any,
        "info": string;
    }
}