function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export type PreviewBuildOptions = {
  headSnippet?: string;
  htmlClass?: string;
};

const DEFAULT_VIEWPORT =
  '<meta name="viewport" content="width=device-width, initial-scale=1.0" />';

/**
 * Assemble a full HTML document for the sandboxed preview iframe.
 */
export function buildPreviewDocument(
  html: string,
  css: string,
  js: string,
  cdnUrls: string[],
  options?: PreviewBuildOptions,
): string {
  const linkTags = cdnUrls
    .filter((u) => u.toLowerCase().endsWith(".css"))
    .map((u) => `<link rel="stylesheet" href="${escapeAttr(u)}">`)
    .join("\n");

  const externalScripts = cdnUrls
    .filter((u) => !u.toLowerCase().endsWith(".css"))
    .map(
      (u) =>
        `<script src="${escapeAttr(u)}" crossorigin="anonymous"></script>`,
    )
    .join("\n");

  const safeCss = css.replace(/<\/style/gi, "<\\/style");
  const headExtra = (options?.headSnippet ?? "").trim();
  const classAttr = (options?.htmlClass ?? "").trim();
  const htmlOpen = classAttr
    ? `<html lang="en" class="${escapeAttr(classAttr)}">`
    : `<html lang="en">`;

  return `<!DOCTYPE html>
${htmlOpen}
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${linkTags}
  ${headExtra ? `${headExtra}\n  ` : ""}<style>${safeCss}</style>
</head>
<body>
${html}
${externalScripts}
<script>
try {
${js}
} catch (e) {
  console.error(e);
}
</script>
</body>
</html>`;
}

export function getViewportMetaSnippet(): string {
  return DEFAULT_VIEWPORT;
}
