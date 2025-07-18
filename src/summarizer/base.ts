import { DocumentNode } from '../markdownParser';

export interface Summarizer {
  summarize(node: DocumentNode, stack: DocumentNode[]): Promise<string>;
}

export abstract class BaseSummarizer implements Summarizer {
  constructor(protected documentContext: string = '') {}

  async summarize(node: DocumentNode, stack: DocumentNode[] = []): Promise<string> {
    const content = this.getTextContent(node);

    if (!content.trim()) {
      return '';
    }

    const titlePath = this.buildTitlePath(node, stack);
    const contextSummary = this.buildContextSummary(stack);
    const isRoot = stack.length === 0;

    const prompt = this.createPrompt(content, titlePath, contextSummary, isRoot);

    return this.getSummaryText(prompt);
  }

  protected getTextContent(node: DocumentNode): string {
    const directText = node.children.filter((c) => typeof c === 'string').join('\n\n');
    return directText;
  }

  protected buildTitlePath(node: DocumentNode, stack: DocumentNode[]): string {
    return stack.length === 0
      ? (node.title ?? '')
      : [...stack.map((s) => s.title), node.title].join(' > ');
  }

  protected buildContextSummary(stack: DocumentNode[]): string {
    const summaries = stack.map((s) => s.summary).filter((s) => s?.length);

    if (summaries.length === 0) return '';

    return summaries.map((s) => `* ${s}`).join('\n');
  }

  protected createPrompt(
    content: string,
    titlePath: string,
    contextSummary: string,
    isRoot: boolean,
  ): string {
    const basePrompt = `I am chunking a document for use in a RAG system. Each document is being split into increasingly narrow sections, and I am trying to provide a small amount of context about where each chunk has come from.

One way I am doing this is showing the full title path:

"Article title > Section title > Sub-section title"

I will also provide a summary of all the text at each section.

This will be prepended to the sub-section text.`;

    const instructionParagraph = isRoot
      ? `I would like you to provide two very, very short sentences; one describing the topic of the articles, and the other presenting the key facts provided in the article, that can be combined with the title to provide some context. It should be as useful as possible to provide an overall context to include with the chunk. Present these sentences together on the same line. It does not need to be detail-heavy, each section will have more detail added. You should focus on the beginning of the document: the first few paragraphs will likely provide the best source for a summary.${this.documentContext ? ' ' + this.documentContext : ''}`
      : `I would like you to provide a very, very short sentence describing the key facts provided in this section, that can be combined with the title to provide some context. It should be as useful as possible to provide an overall context to include with the chunk. It does not need to be detail-heavy, each section will have more detail added. You should focus on the beginning of the section: the first few paragraphs will likely provide the best source for a summary.${this.documentContext ? ' ' + this.documentContext : ''} I have provided the context from running this process in the parent sections to help guide you.`;

    return `${basePrompt}

${instructionParagraph}

Title: ${titlePath}

${
  contextSummary
    ? `AI-generated context summary:

${contextSummary}

`
    : ''
}Content:

${content}`;
  }

  protected abstract getSummaryText(prompt: string): Promise<string>;
}
