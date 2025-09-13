import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const roundCreateSchema = z.object({
    duration: z.number().min(60).max(300),
    cooldown: z.number().min(10).max(60),
    startAt: z.date(),
});


const roundCreateJsonSchema = zodToJsonSchema(roundCreateSchema)

export {roundCreateSchema, roundCreateJsonSchema}