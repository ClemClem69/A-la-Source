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

const fontFamilies = new Set([
  'Arial',
  'Georgia',
  'Inter',
  'Playfair Display',
  'Times New Roman',
  'Verdana',
]);

const fontSizeMap: Record<string, string> = {
  '1': '12px',
  '2': '14px',
  '3': '16px',
  '4': '18px',
  '5': '24px',
  '6': '30px',
  '7': '36px',
  'xx-small': '12px',
  'x-small': '12px',
  small: '14px',
  medium: '16px',
  large: '18px',
  'x-large': '24px',
  'xx-large': '30px',
};

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

  if (tagName === 'FONT') {
    const span = document.createElement('span');
    const face = node.getAttribute('face');
    const size = node.getAttribute('size');
    if (face && fontFamilies.has(face)) span.style.fontFamily = face;
    if (size && fontSizeMap[size]) span.style.fontSize = fontSizeMap[size];
    children.forEach((child) => span.appendChild(child));
    return span;
  }

  const cleanElement = document.createElement(tagName.toLowerCase());
  if (tagName === 'SPAN') {
    const style = node.getAttribute('style') ?? '';
    for (const declaration of style.split(';')) {
      const separatorIndex = declaration.indexOf(':');
      if (separatorIndex < 0) continue;

      const property = declaration.slice(0, separatorIndex).trim().toLowerCase();
      const value = declaration.slice(separatorIndex + 1).trim().replace(/["']/g, '');
      if (property === 'font-size' && /^(?:\d{1,2}(?:\.\d{1,2})?(?:px|rem|em)|(?:xx-small|x-small|small|medium|large|x-large|xx-large))$/i.test(value)) {
        cleanElement.setAttribute('style', `font-size: ${value}`);
      } else if (property === 'font-family') {
        const family = value.split(',')[0].trim();
        if (fontFamilies.has(family)) {
          const currentStyle = cleanElement.getAttribute('style');
          cleanElement.setAttribute('style', `${currentStyle ? `${currentStyle}; ` : ''}font-family: ${family}`);
        }
      }
    }
  }
  children.forEach((child) => cleanElement.appendChild(child));
  return cleanElement;
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

  return outputDocument.body.innerHTML;
}

export function articleContentHasText(value: string): boolean {
  const document = new DOMParser().parseFromString(sanitizeArticleContent(value), 'text/html');
  return Boolean(document.body.textContent?.trim());
}
