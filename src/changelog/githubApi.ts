import { env } from "cloudflare:workers";
import type { GitHubRelease } from "./types";

import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";


if (!env.CHANGELOG_ADDON_REPO?.length) {
  throw new Error('Define a "CHANGELOG_ADDON_REPO" environment variable.')
}

marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);

marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false,
});

export async function purgeCache() {
  const { keys } = await env.KV_CHANGELOG_ADDON.list();
  for (const key of keys) {
    await env.KV_CHANGELOG_ADDON.delete(key.name);
  }
}

export async function fetchReleases(repo: string, perPage: number = 10) {
  // if we have already cached, then just return a list of releases.
  const lastUpdate = await env.KV_CHANGELOG_ADDON.get("lastUpdate");
  if (lastUpdate) {
    const { keys } = await env.KV_CHANGELOG_ADDON.list();
    return keys
      .filter((key) => key.name.startsWith("release-"))
      .map((key) => key.name)
      .sort((a, b) => {
        return a > b ? -1 : 0;
      });
  }

  const response = await fetch(
    `https://api.github.com/repos/${env.CHANGELOG_ADDON_REPO}/releases?per_page=${perPage}`,
    {
      headers: {
        "User-Agent": "RedwoodSDK",
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
    }
  );

  await purgeCache();

  const data = await response.json<GitHubRelease[]>();
  for (const release of data) {
    const key = `release-${release.published_at.toString()}-${release.id}`;
    release.body = await marked(release.body);
    await env.KV_CHANGELOG_ADDON.put(key, JSON.stringify(release));
  }

  await env.KV_CHANGELOG_ADDON.put("lastUpdate", new Date().toISOString(), {
    expirationTtl: 60_000, // 60 minutes
  });

  return data.map((release) => `release-${release.id}`);
}
