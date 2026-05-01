function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

/**
 * Assemble a full HTML document for the sandboxed preview iframe.
 */
export function buildPreviewDocument(
  html: string,
  css: string,
  js: string,
  cdnUrls: string[],
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${linkTags}
  <style>${safeCss}</style>
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
