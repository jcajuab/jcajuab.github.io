import fm from "front-matter"
import { match } from "ts-pattern"
import * as v from "valibot"

import { api, gistApi } from "#/api"
import { AttributesSchema } from "#/types/attributes"
import { GistsSchema } from "#/types/gist"

/**
 * INFO: What identifies a gist blog?
 * 1) A gist blog should contain a description of "#blog."
 * 2) It should contain only one markdown file.
 * 3) Lastly, the markdown file should include frontmatter with the blog’s title, slug, description, and tags.
 */

const gists = v.parse(GistsSchema, await gistApi.get().json())

const files = gists
  .filter((gist) => gist.description?.toLowerCase().startsWith("#blog")) // 1
  .flatMap((gist) => {
    const file = Object.values(gist.files)[0] // 2
    return match(file.type)
      .with("text/markdown", () => [
        {
          url: file.raw_url,
          createdAt: new Date(gist.created_at),
          updatedAt: new Date(gist.updated_at),
        },
      ])
      .otherwise(() => [])
  })

const responses = await Promise.allSettled(
  files.map(async ({ url, createdAt, updatedAt }) => ({
    text: await api.get(url).text(),
    createdAt,
    updatedAt,
  })),
)

export const blogs = responses
  .filter((promise) => promise.status === "fulfilled")
  .map((result) => result.value)
  .map(({ text, createdAt, updatedAt }) => {
    const parsed = fm(text)
    const attributes = v.parse(AttributesSchema, parsed.attributes)

    return {
      ...parsed,
      attributes,
      metadata: { createdAt, updatedAt },
    }
  })
  .sort(
    (a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime(),
  )
