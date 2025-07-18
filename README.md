# TreeChunk

Hierarchical markdown chunking for RAG systems with AI-generated summaries

## WHAT?

Splits markdown documents into self-contained chunks that contain (hopefully) enough contextual information about what part of the document contained the chunk that it's useful for generation.

**There's a static demo of this in action here: [sgnt.ai/treechunk-demo](https://sgnt.ai/treechunk-demo)**.

## Synopsis

Command line:

```bash
OPENAI_API_KEY=etc
tsx bin/demo.ts ./demo/Scamming.md "The document has come from the Wiki for an online crime game"
```

Programmatic:

```typescript
import { TreeChunker } from 'treechunk';
import { OpenAISummarizer } from 'treechunk/summarizer/openai';

const summarizer = new OpenAISummarizer('Technical documentation context');
const chunker = new TreeChunker(summarizer);

await chunker.makeChunks(documentNode, async (chunk) => {
  console.log(chunk);
});
```

## API

### TreeChunker
- `new TreeChunker(summarizer)` - Create chunker with a summarizer
- `makeChunks(node, onChunk, stack?)` - Process document, calling onChunk for each chunk

### Summarizers
- `new OpenAISummarizer(context?, apiKey?)` - OpenAI implementation
  - `context`: Optional string added to prompts
  - `apiKey`: Optional, defaults to OPENAI_API_KEY env var

### Parser
- `parseMarkdown(markdown)` - Parse markdown into DocumentNode tree
- `renderDocument(node)` - Convert DocumentNode back to markdown

## License

MIT.

If you use this, port this, whatever, I'd love it if you gave this project a shout-out.

## Author

Peter Sergeant pete@[sgnt.ai](https://sgnt.ai/)
