import { describe, it, expect } from 'vitest';
import { BaseSummarizer } from './base';
import { DocumentNode } from '../markdownParser';

// Test subclass that exposes protected methods and captures behavior
class TestableBaseSummarizer extends BaseSummarizer {
  public lastPrompt: string = '';
  public mockSummaryResponse: string = '[Default summary]';

  constructor(documentContext: string = '') {
    super(documentContext);
  }

  protected async getSummaryText(prompt: string): Promise<string> {
    this.lastPrompt = prompt;
    return this.mockSummaryResponse;
  }

  // Expose protected methods for testing
  public testGetTextContent(node: DocumentNode): string {
    return this.getTextContent(node);
  }

  public testBuildTitlePath(node: DocumentNode, stack: DocumentNode[]): string {
    return this.buildTitlePath(node, stack);
  }

  public testBuildContextSummary(stack: DocumentNode[]): string {
    return this.buildContextSummary(stack);
  }

  public testCreatePrompt(
    content: string,
    titlePath: string,
    contextSummary: string,
    isRoot: boolean,
  ): string {
    return this.createPrompt(content, titlePath, contextSummary, isRoot);
  }
}

describe('BaseSummarizer', () => {
  it('returns empty string for nodes with no text content', async () => {
    const summarizer = new TestableBaseSummarizer();
    const node: DocumentNode = {
      title: 'Empty Node',
      summary: null,
      depth: 1,
      children: ['  \n\t  ', { title: 'Child', summary: null, depth: 2, children: [] }],
    };

    const result = await summarizer.summarize(node);

    expect(result).toBe('');
    expect(summarizer.lastPrompt).toBe(''); // getSummaryText was never called
  });

  it('generates different prompts for root vs non-root nodes', async () => {
    const summarizer = new TestableBaseSummarizer('Test context.');

    // Create a parent-child relationship
    const childNode: DocumentNode = {
      title: 'Child Section',
      summary: null,
      depth: 2,
      children: ['Child content goes here'],
    };

    const parentNode: DocumentNode = {
      title: 'Parent Section',
      summary: 'Parent summary text',
      depth: 1,
      children: ['Parent content', childNode],
    };

    // Case 1: Empty stack (treated as root)
    await summarizer.summarize(childNode, []);
    const rootPrompt = summarizer.lastPrompt;

    // Case 2: With parent in stack (treated as non-root)
    await summarizer.summarize(childNode, [parentNode]);
    const nonRootPrompt = summarizer.lastPrompt;

    // Verify different instruction paragraphs
    expect(rootPrompt).toContain('two very, very short sentences');
    expect(rootPrompt).toContain('one describing the topic');

    expect(nonRootPrompt).toContain('a very, very short sentence');
    expect(nonRootPrompt).not.toContain('two very');
    expect(nonRootPrompt).not.toContain('one describing the topic');

    // Verify context summary only in non-root
    expect(rootPrompt).not.toContain('AI-generated context summary:');
    expect(nonRootPrompt).toContain('AI-generated context summary:');
    expect(nonRootPrompt).toContain('* Parent summary text');

    // Verify both include the custom context
    expect(rootPrompt).toContain('Test context.');
    expect(nonRootPrompt).toContain('Test context.');
  });
});
