const inlineTags = new Set(['B', 'EM', 'I', 'STRONG', 'U']);
const blockTags = new Set(['DIV', 'H2', 'H3', 'LI', 'OL', 'P', 'UL']);

export function sanitizeArticleContent(value: string | null | undefined): string {
  const input = value ?? '';
  if (!input) return '';

  const sourceDocument = new DOMParser().parseFromString(input, 'text/html');
  const outputDocument = document.implementation.createHTMLDocument('');
  const outputBody = outputDocument.body;
  let paragraph = outputDocument.createElement('p');

  function flushParagraph(): void {
    if (paragraph.textContent?.trim()) outputBody.appendChild(paragraph);
    paragraph = outputDocument.createElement('p');
  }

  function appendText(text: string, formatting: string[]): void {
    if (!text.trim() && !paragraph.textContent) return;

    let parent: HTMLElement = paragraph;
    for (const tag of formatting) {
      const wrapper = outputDocument.createElement(tag.toLowerCase());
      parent.appendChild(wrapper);
      parent = wrapper;
    }
    parent.appendChild(outputDocument.createTextNode(text));
  }

  function processNode(
    node: Node,
    formatting: string[] = [],
    keepBlockInParagraph = false,
  ): void {
    if (node.nodeType === Node.TEXT_NODE) {
      appendText(node.textContent ?? '', formatting);
      return;
    }
    if (!(node instanceof Element)) return;

    const tagName = node.tagName.toUpperCase();
    if (tagName === 'BR') {
      flushParagraph();
      return;
    }

    if (tagName === 'OL' || tagName === 'UL') {
      flushParagraph();
      const items = [...node.children].filter((child) => child.tagName.toUpperCase() === 'LI');
      items.forEach((item, index) => {
        const itemText = item.textContent?.trim() ?? '';
        const hasExistingMarker = /^(?:[-*•]|\d+[.)])\s/.test(itemText);
        if (!hasExistingMarker) {
          appendText(tagName === 'OL' ? `${index + 1}. ` : '• ', formatting);
        }
        for (const child of [...item.childNodes]) processNode(child, formatting, true);
        flushParagraph();
      });
      flushParagraph();
      return;
    }

    if (blockTags.has(tagName)) {
      if (!keepBlockInParagraph) flushParagraph();
      const childFormatting = tagName === 'H2' || tagName === 'H3'
        ? [...formatting, 'strong']
        : formatting;
      for (const child of [...node.childNodes]) {
        processNode(child, childFormatting, keepBlockInParagraph);
      }
      if (!keepBlockInParagraph) flushParagraph();
      return;
    }

    const childFormatting = inlineTags.has(tagName)
      ? [...formatting, tagName.toLowerCase()]
      : formatting;
    for (const child of [...node.childNodes]) processNode(child, childFormatting);
  }

  const containsHtml = /<\/?[a-z][\s\S]*>/i.test(input);
  if (containsHtml) {
    for (const node of [...sourceDocument.body.childNodes]) processNode(node);
  } else {
    for (const line of input.split(/\r?\n/)) {
      processNode(sourceDocument.createTextNode(line));
      flushParagraph();
    }
  }

  flushParagraph();
  return outputBody.innerHTML;
}

export function articleContentHasText(value: string): boolean {
  const sanitized = sanitizeArticleContent(value);
  const document = new DOMParser().parseFromString(sanitized, 'text/html');
  return Boolean(document.body.textContent?.trim());
}
