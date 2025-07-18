import { DocumentNode } from './markdownParser';

export interface Summarizer {
  summarize(node: DocumentNode, stack: DocumentNode[]): Promise<string>;
}

export class TreeChunker {
  constructor(private summarizer: Summarizer) {}

  private needsSummary(node: DocumentNode): boolean {
    return !!node.children.find((c) => typeof c !== 'string');
  }

  async makeChunks(node: DocumentNode, stack: DocumentNode[] = []): Promise<string[]> {
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

    console.log(`---+++---\n${chunk}`);

    const childChunks: string[] = [];
    for (const childNode of node.children.filter((c) => typeof c !== 'string')) {
      childChunks.push(...(await this.makeChunks(childNode, [...stack, node])));
    }

    return [chunk, ...childChunks];
  }
}

export class MockSummarizer implements Summarizer {
  async summarize(node: DocumentNode): Promise<string> {
    return `[Summary of ${node.title}]`;
  }
}
