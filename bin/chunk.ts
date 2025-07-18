import { readFileSync } from 'fs';
import { parseMarkdown } from '../src/markdownParser';
import { TreeChunker } from '../src/chunk';
import { OpenAISummarizer } from '../src/summarizer/openai';

async function main() {
  const input = readFileSync(process.argv[2]!);
  // console.log(renderDocument(parseMarkdown(input.toString('utf8'))));

  const node = parseMarkdown(input.toString('utf8'));
  const summarizer = new OpenAISummarizer(
    'The document has come from the Wiki page about an online crime game; all documents have, so that detail can be assumed: don\'t mention "online crime game".',
  );
  const chunker = new TreeChunker(summarizer);

  await chunker.makeChunks(node, async (chunk) => {
    console.log(`---+++---\n${chunk}`);
  });
}

main();
