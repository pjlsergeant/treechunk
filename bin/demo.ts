import { readFileSync, writeFileSync } from 'fs';
import { marked } from 'marked';
import { parseMarkdown, DocumentNode } from '../src/markdownParser';
import { TreeChunker } from '../src/chunk';
import { OpenAISummarizer } from '../src/summarizer/openai';

interface ChunkMapping {
  chunk: string;
  sourceContent: string;
}

// Collect chunks and map them to source content
async function collectChunkMappings(
  chunker: TreeChunker,
  node: DocumentNode,
): Promise<ChunkMapping[]> {
  const mappings: ChunkMapping[] = [];
  let chunkCount = 0;

  await chunker.makeChunks(node, async (chunk, source) => {
    chunkCount++;
    console.log(`Processing chunk ${chunkCount}...`);
    mappings.push({
      chunk: chunk,
      sourceContent: source,
    });
  });

  console.log(`Processed ${chunkCount} chunks`);
  return mappings;
}

function generateHTML(filename: string, mappings: ChunkMapping[], documentContext: string): string {
  const rows = mappings
    .map(
      (mapping, index) => `
    <tr>
      <td>
        <div class="chunk-num">Source ${index + 1}</div>
        ${marked(mapping.sourceContent)}
      </td>
      <td>
        <div class="chunk-num">Chunk ${index + 1}</div>
        ${marked(mapping.chunk)}
      </td>
    </tr>
  `,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>TreeChunk Demo: ${filename}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 20px; }
    h1 { color: #333; }
    .context-box { background: #f0f0f0; border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .context-box h2 { margin-top: 0; font-size: 1.1em; }
    .context-box p { margin: 0; font-style: italic; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 15px; vertical-align: top; }
    th { background: #f5f5f5; font-weight: bold; }
    td { width: 50%; }
    .chunk-num { color: #666; font-size: 0.9em; margin-bottom: 10px; }
    pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
    blockquote { border-left: 3px solid #ddd; padding-left: 10px; color: #666; }
  </style>
</head>
<body>
  <h1>TreeChunk Demo: ${filename}</h1>
  <div class="context-box">
    <h2>Document Context</h2>
    <p>${documentContext || 'No document context provided'}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Source Content</th>
        <th>Generated Chunk</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;
}

async function main() {
  const filename = process.argv[2];
  const documentContext = process.argv[3] || '';

  if (!filename) {
    console.error('Usage: tsx bin/demo.ts <markdown-file> [document-context]');
    console.error('Example: tsx bin/demo.ts document.md "This is technical documentation"');
    process.exit(1);
  }

  try {
    const input = readFileSync(filename, 'utf8');
    const node = parseMarkdown(input);

    const summarizer = new OpenAISummarizer(documentContext);
    const chunker = new TreeChunker(summarizer);

    console.log('Generating chunks...');
    const mappings = await collectChunkMappings(chunker, node);

    const html = generateHTML(filename, mappings, documentContext);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = `/tmp/treechunk-demo-${timestamp}.html`;

    writeFileSync(outputPath, html);
    console.log(`Demo saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
