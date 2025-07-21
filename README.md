# TreeChunk

Contextual, hierarchical markdown chunking for RAG systems

## WHAT?

Splits markdown documents into self-contained chunks that contain (hopefully) enough contextual information about what part of the document contained the chunk that it's useful for generation.

**There's a static demo of this in action here: [sgnt.ai/treechunk-demo](https://sgnt.ai/treechunk-demo)**.

## Synopsis

Programmatic:

```typescript
import { TreeChunker } from 'treechunk';
import { OpenAISummarizer } from 'treechunk/summarizer/openai';

const summarizer = new OpenAISummarizer('Technical documentation context');
const chunker = new TreeChunker(summarizer);

await chunker.makeChunks(documentNode, async (chunk, source) => {
  console.log(chunk); // The enriched chunk with context
  console.log(source); // The original markdown source for this section
});
```

Build a demo HTML page:

```bash
OPENAI_API_KEY=etc
tsx bin/demo.ts ./demo/Scamming.md "The document has come from the Wiki for an online crime game"
```

## API

### TreeChunker

- `new TreeChunker(summarizer)` - Create chunker with a summarizer
- `makeChunks(node, onChunk, stack?)` - Process document, calling onChunk for each chunk
  - `onChunk: (chunk: string, source: string) => Promise<void>` - Callback receives:
    - `chunk`: The enriched chunk with hierarchical title and AI-generated context
    - `source`: The original markdown source for this section

### Summarizers

- `new OpenAISummarizer(context?, apiKey?)` - OpenAI implementation
  - `context`: Optional string added to prompts
  - `apiKey`: Optional, defaults to OPENAI_API_KEY env var

### Parser

- `parseMarkdown(markdown)` - Parse markdown into DocumentNode tree
- `renderDocument(node)` - Convert DocumentNode back to markdown

## Prior Art / See Also

This was an independent -- but not novel -- discovery, by which I mean I built it and then went to try and find out what other people who'd also built it called theirs. It brings together the following ideas:

- Document structure-based chunking, eg: [LangChain's MarkdownHeaderTextSplitter](https://python.langchain.com/api_reference/text_splitters/markdown/langchain_text_splitters.markdown.MarkdownHeaderTextSplitter.html)
- Contextual Retrieval (see [this Anthropic article for a similar take](https://www.anthropic.com/news/contextual-retrieval))

# Todo / Next steps

- Expand out the demo
- Add raw chunk and location data to callback (low priority, as I don't need this)

## License

**MIT**

If you use this, port this, whatever, I'd love it if you gave this project a shout-out.

## Author

Peter Sergeant pete@[sgnt.ai](https://sgnt.ai/)

This was built for [Torn](https://www.torn.com/3613560), whose Wiki the "Scamming" article is taken.
