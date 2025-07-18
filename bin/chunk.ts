import { readFileSync } from 'fs';
import { parseMarkdown } from '../src/markdownParser';
import { makeChunks } from '../src/chunk';

async function main() {
  const input = readFileSync(process.argv[2]!);
  // console.log(renderDocument(parseMarkdown(input.toString('utf8'))));

  const node = parseMarkdown(input.toString('utf8'));
  await makeChunks(node, []);

  // for ( const chunk of chunks ) {
  //   console.log(`---+++---\n${chunk}`);
  // }
}

main();