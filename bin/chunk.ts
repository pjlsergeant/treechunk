import { readFileSync } from 'fs';
import { parseMarkdown } from '../src/markdownParser';
import { TreeChunker } from '../src/chunk';
import { OpenAISummarizer } from '../src/openaiSummarizer';

async function main() {
  const input = readFileSync(process.argv[2]!);
  // console.log(renderDocument(parseMarkdown(input.toString('utf8'))));

  const node = parseMarkdown(input.toString('utf8'));
  const summarizer = new OpenAISummarizer();
  const chunker = new TreeChunker(summarizer);

  await chunker.makeChunks(node, []);

  // for ( const chunk of chunks ) {
  //   console.log(`---+++---\n${chunk}`);
  // }
}

main();
