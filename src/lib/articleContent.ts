const allowedTags = new Set([
  'P',
  'BR',
  'DIV',
  'STRONG',
  'B',
  'EM',
  'I',
  'U',
  'SPAN',
  'FONT',
  'H2',
  'H3',
  'UL',
  'OL',
  'LI',
]);

const blockTags = new Set(['DIV', 'H2', 'H3', 'LI', 'OL', 'P', 'UL']);

function splitParagraphAtBreaks(children: Node[], document: Document): DocumentFragment {
  const fragment = document.createDocumentFragment();
  let paragraph = document.createElement('p');

  function flushParagraph() {
    if (paragraph.textContent?.trim() || paragraph.querySelector('br')) {
      fragment.appendChild(paragraph);
    }
    paragraph = document.createElement('p');
  }

  for (const child of children) {
    if (child instanceof Element && child.tagName.toUpperCase() === 'BR') {
      flushParagraph();
    } else {
      paragraph.appendChild(child);
    }
  }

  flushParagraph();
  return fragment;
}

function cleanNode(node: Node, document: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent ?? '');
  if (!(node instanceof Element)) return null;

  const tagName = node.tagName.toUpperCase();
  const children = [...node.childNodes]
    .map((child) => cleanNode(child, document))
    .filter((child): child is Node => child !== null);

  if (!allowedTags.has(tagName)) {
    const fragment = document.createDocumentFragment();
    children.forEach((child) => fragment.appendChild(child));
    return fragment;
  }

  if ((tagName === 'P' || tagName === 'DIV') && children.some(
    (child) => child instanceof Element && child.tagName.toUpperCase() === 'BR',
  )) {
    return splitParagraphAtBreaks(children, document);
  }

  if (tagName === 'SPAN' || tagName === 'FONT') {
    const fragment = document.createDocumentFragment();
    children.forEach((child) => fragment.appendChild(child));
    return fragment;
  }

  if (tagName === 'DIV' && children.some(
    (child) => child instanceof Element && blockTags.has(child.tagName.toUpperCase()),
  )) {
    const fragment = document.createDocumentFragment();
    children.forEach((child) => fragment.appendChild(child));
    return fragment;
  }

  const cleanElement = document.createElement(tagName === 'DIV' ? 'p' : tagName.toLowerCase());
  children.forEach((child) => cleanElement.appendChild(child));
  return cleanElement;
}

function hasVisibleContent(node: Node): boolean {
  return Boolean(node.textContent?.trim()) || (
    node instanceof Element && node.querySelector('br') !== null
  );
}

function normalizeParagraphs(body: HTMLElement, document: Document): void {
  const normalized = document.createDocumentFragment();
  let paragraph = document.createElement('p');

  function flushParagraph() {
    if (paragraph.textContent?.trim() || paragraph.querySelector('br')) {
      normalized.appendChild(paragraph);
    }
    paragraph = document.createElement('p');
  }

  for (const child of [...body.childNodes]) {
    if (child instanceof Element && child.tagName.toUpperCase() === 'BR') {
      flushParagraph();
      continue;
    }
    if (child instanceof Element && blockTags.has(child.tagName.toUpperCase())) {
      flushParagraph();
      if (hasVisibleContent(child)) normalized.appendChild(child);
    } else if (child.nodeType === Node.TEXT_NODE && !child.textContent?.trim()) {
      continue;
    } else {
      paragraph.appendChild(child);
    }
  }

  flushParagraph();
  body.replaceChildren(normalized);
}

export function sanitizeArticleContent(value: string | null | undefined): string {
  const input = value ?? '';
  if (!input) return '';

  const sourceDocument = new DOMParser().parseFromString(input, 'text/html');
  const containsHtml = /<\/?[a-z][\s\S]*>/i.test(input);
  const outputDocument = document.implementation.createHTMLDocument('');
  const sourceNodes = containsHtml
    ? [...sourceDocument.body.childNodes]
    : input.split(/\r?\n/).map((line) => {
        const paragraph = sourceDocument.createElement('p');
        paragraph.textContent = line;
        return paragraph;
      });

  sourceNodes
    .map((node) => cleanNode(node, outputDocument))
    .filter((node): node is Node => node !== null)
    .forEach((node) => outputDocument.body.appendChild(node));

  normalizeParagraphs(outputDocument.body, outputDocument);
  return outputDocument.body.innerHTML;
}

export function articleContentHasText(value: string): boolean {
  const document = new DOMParser().parseFromString(sanitizeArticleContent(value), 'text/html');
  return Boolean(document.body.textContent?.trim());
}
