import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const userCreateSchema = z.object({
    name: z.string().min(4).max(20),
    password: z.string().min(4).max(50),
    agreement: z.boolean()
});


const userCreateJsonSchema = zodToJsonSchema(userCreateSchema);

export {userCreateSchema, userCreateJsonSchema}