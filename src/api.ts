import { GITHUB_TOKEN } from "astro:env/server";
import wretch from "wretch";

import { GIST_API_URL } from "#/constants";

export const api = wretch();

export const gistApi = wretch(GIST_API_URL, {
  headers: {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
  },
});
