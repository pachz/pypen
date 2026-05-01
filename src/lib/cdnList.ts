export function partitionCdnUrls(urls: string[]): {
  stylesheets: string[];
  scripts: string[];
} {
  const stylesheets: string[] = [];
  const scripts: string[] = [];
  for (const u of urls) {
    if (u.toLowerCase().endsWith(".css")) {
      stylesheets.push(u);
    } else {
      scripts.push(u);
    }
  }
  return { stylesheets, scripts };
}

export function mergeCdnUrls(stylesheets: string[], scripts: string[]): string[] {
  return [...stylesheets, ...scripts];
}
