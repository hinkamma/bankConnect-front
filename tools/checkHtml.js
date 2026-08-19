const fs = require('fs');
const path = require('path');
const file = process.argv[2];
if (!file) {
  console.error('Usage: node checkHtml.js <file>');
  process.exit(2);
}
const text = fs.readFileSync(file, 'utf8');
const tagRegex = /<\/?([a-zA-Z0-9-]+)([^>]*)>/g;
const selfClosingRegex = /<\s*([a-zA-Z0-9-]+)([^>]*)\/\s*>$/;
const voidElements = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
let match;
const stack = [];
const errors = [];
let idx = 0;
while ((match = tagRegex.exec(text)) !== null) {
  idx++;
  const full = match[0];
  const tag = match[1].toLowerCase();
  const rest = match[2] || '';
  const isClosing = full.startsWith('</');
  const isSelfClosing = /\/$/.test(full) || selfClosingRegex.test(full) || voidElements.has(tag);
  if (isClosing) {
    if (stack.length === 0) {
      errors.push(`Unmatched closing </${tag}> at index ${match.index}`);
    } else {
      const top = stack.pop();
      if (top.tag !== tag) {
        errors.push(`Tag mismatch: expected </${top.tag}> but found </${tag}> at index ${match.index}`);
      }
    }
  } else if (!isSelfClosing) {
    // opening tag
    stack.push({ tag, index: match.index });
  }
}
if (stack.length) {
  stack.forEach(s => errors.push(`Unclosed <${s.tag}> opened at index ${s.index}`));
}
if (errors.length === 0) {
  console.log('No tag balance errors found.');
} else {
  console.log('Tag balance issues:');
  errors.forEach(e => console.log(' - ' + e));
  process.exit(1);
}
