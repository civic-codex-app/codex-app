import { readFileSync, writeFileSync } from 'fs';

const svg = readFileSync('/Users/nick/Downloads/usa.svg', 'utf8');

// Extract viewBox
const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
console.log('viewBox:', viewBoxMatch?.[1]);

// Extract all path elements - the SVG has multiline path elements
// Match each <path ... /> block
const pathBlocks = svg.match(/<path[^>]*?\/>/gs) || [];
console.log('Total path blocks:', pathBlocks.length);

const paths = {};
for (const block of pathBlocks) {
  const idMatch = block.match(/id="US-([A-Z]{2})"/);
  const dMatch = block.match(/d="([^"]+)"/);
  if (idMatch && dMatch) {
    paths[idMatch[1]] = dMatch[1].trim();
  }
}

console.log('States extracted:', Object.keys(paths).length);
console.log('States:', Object.keys(paths).sort().join(', '));

// Write as JSON
writeFileSync('/Users/nick/Documents/Codex App/scripts/state-paths.json', JSON.stringify(paths, null, 2));
console.log('Written to scripts/state-paths.json');
