import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const userCreateSchema = z.object({
    name: z.string().min(4).max(20),
    password: z.string().min(4).max(50),
    agreement: z.boolean()
});

const userLoginSchema = z.object({
    name: z.string().min(4).max(20),
    password: z.string().min(4).max(50),
});


const userCreateJsonSchema = zodToJsonSchema(userCreateSchema);
const userLoginJsonSchema = zodToJsonSchema(userLoginSchema);

export {userCreateSchema, userCreateJsonSchema, userLoginSchema, userLoginJsonSchema}