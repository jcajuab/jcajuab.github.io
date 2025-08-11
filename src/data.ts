import { isEqual, toDate } from "date-fns";
import fm from "front-matter";
import removeMd from "remove-markdown";
import { match, P } from "ts-pattern";
import * as v from "valibot";

import { api, gistApi } from "#/api";
import { AttributesSchema } from "#/types/attributes";
import { GistsSchema } from "#/types/gist";
import { estimateReadingTime } from "#/utils";

/**
 * INFO: What identifies a gist blog?
 * 1) A gist with a description that starts with "#blog",
 * 2) which contains a single markdown file,
 * 3) that includes frontmatter with the properties title, slug, description, and tags,
 * 4) and does not have a title in the content (e.g., "# Title"); the title comes from the frontmatter instead.
 */

const gists = v.parse(GistsSchema, await gistApi.get().json());

const files = gists
  .filter(({ description }) => description?.toLowerCase().startsWith("#blog"))
  .flatMap(({ files, created_at, updated_at }) => {
    const file = Object.values(files)[0];

    const createdAt = toDate(created_at);
    const updatedAt = toDate(updated_at);

    const finalUpdatedAt = match(updatedAt)
      .with(isEqual(createdAt, updatedAt), () => null)
      .otherwise(() => updatedAt);

    return match(file)
      .with({ type: "text/markdown", raw_url: P.select("url") }, ({ url }) => [
        {
          url,
          createdAt,
          updatedAt: finalUpdatedAt,
        },
      ])
      .otherwise(() => []);
  });

const responses = await Promise.allSettled(
  files.map(async ({ url, createdAt, updatedAt }) => ({
    markdown: await api.get(url).text(),
    createdAt,
    updatedAt,
  })),
);

export const blogs = responses
  .filter((promise) => promise.status === "fulfilled")
  .map((result) => result.value)
  .map(({ markdown, createdAt, updatedAt }) => {
    const { body, attributes } = fm(markdown);

    const estimatedReadingTime = estimateReadingTime(removeMd(body));
    const parsedAttributes = v.parse(AttributesSchema, attributes);

    return {
      body,
      metadata: {
        ...parsedAttributes,
        estimatedReadingTime,
        createdAt,
        updatedAt,
      },
    };
  })
  .sort(
    (a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime(),
  );

export type Blogs = typeof blogs;
