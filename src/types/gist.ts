import * as v from "valibot";

export const GistFileSchema = v.object({
  type: v.string(),
  raw_url: v.pipe(v.string(), v.url()),
});

export const GistSchema = v.object({
  files: v.record(v.string(), GistFileSchema),
  description: v.string(),
  created_at: v.pipe(v.string(), v.isoTimestamp()),
  updated_at: v.pipe(v.string(), v.isoTimestamp()),
});

export const GistsSchema = v.array(GistSchema);

export type GistFile = v.InferInput<typeof GistFileSchema>;
export type Gist = v.InferInput<typeof GistSchema>;
export type Gists = v.InferInput<typeof GistsSchema>;
