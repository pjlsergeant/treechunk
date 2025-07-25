import { DocumentNode, renderDocument } from './markdownParser';
import { Summarizer } from './summarizer/base';

export class TreeChunker {
  constructor(private summarizer: Summarizer) {}

  protected needsSummary(node: DocumentNode): boolean {
    return !!node.children.find((c) => typeof c !== 'string');
  }

  async makeChunks(
    node: DocumentNode,
    onChunk: (chunk: string, source: string) => Promise<void>,
    stack: DocumentNode[] = [],
  ): Promise<void> {
    if (this.needsSummary(node)) {
      node.summary = await this.summarizer.summarize(node, stack);
    }

    const title =
      stack.length === 0 ? node.title : stack.map((s) => s.title).join(' > ') + ' > ' + node.title;

    const summaries = [...stack, node].map((s) => s.summary).filter((s) => s?.length);

    const summary =
      summaries.length > 0
        ? `> AI-generated context:\n> ${summaries.map((s) => `- ${s}`).join('\n> ')}`
        : '';

    const textChunk = node.children.filter((c) => typeof c === 'string').join('\n\n');

    const chunk = `# ${title}\n\n${summary ? `${summary}\n\n` : ''}${textChunk}`;

    // Generate source content using renderDocument with stringChildrenOnly flag
    const source = renderDocument(node, true).trim();

    await onChunk(chunk, source);

    for (const childNode of node.children.filter((c) => typeof c !== 'string')) {
      await this.makeChunks(childNode, onChunk, [...stack, node]);
    }
  }
}

export class MockSummarizer implements Summarizer {
  async summarize(node: DocumentNode): Promise<string> {
    return `[Summary of ${node.title}]`;
  }
}
