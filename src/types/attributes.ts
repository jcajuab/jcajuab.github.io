import * as v from "valibot";

export const AttributesSchema = v.object({
  title: v.string(),
  slug: v.string(),
  description: v.string(),
  tags: v.array(v.string()),
});

export type Attributes = v.InferInput<typeof AttributesSchema>;
