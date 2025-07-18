import { describe, it, expect } from 'vitest';
import { TreeChunker, MockSummarizer } from './chunk';
import { DocumentNode, parseMarkdown, renderDocument } from './markdownParser';

// Helper function to simplify chunk structure for testing
function simplifyChunk(chunk: string): [string, string[], string] {
  const lines = chunk.split('\n');

  // Extract title (remove # prefix)
  const title = lines[0]?.replace(/^#\s+/, '') || '';

  // Extract context summaries
  const summaries: string[] = [];
  let contentStartIndex = 2; // Skip title and first empty line

  if (lines[2]?.startsWith('> AI-generated context:')) {
    contentStartIndex = 3;
    for (let i = 3; i < lines.length; i++) {
      if (lines[i]?.startsWith('> - ')) {
        summaries.push(lines[i]!.substring(4)); // Remove '> - ' prefix
      } else if (lines[i] === '') {
        contentStartIndex = i + 1;
        break;
      }
    }
  }

  // Extract content (everything after summaries)
  const content = lines.slice(contentStartIndex).join('\n').trim();

  return [title, summaries, content];
}

// Test subclass that exposes protected methods
class TestableTreeChunker extends TreeChunker {
  public needsSummary(node: DocumentNode): boolean {
    return super.needsSummary(node);
  }
}

describe('TreeChunker', () => {
  it('generates chunks with proper hierarchy and summaries', async () => {
    const mockSummarizer = new MockSummarizer();
    const chunker = new TreeChunker(mockSummarizer);
    const chunks: string[] = [];

    const doc: DocumentNode = {
      title: 'Main Document',
      summary: null,
      depth: 0,
      children: [
        'Main content here',
        {
          title: 'Section 1',
          summary: null,
          depth: 2,
          children: ['Section 1 content'],
        },
        {
          title: 'Section 2',
          summary: null,
          depth: 2,
          children: [
            'Section 2 content',
            {
              title: 'Subsection 2.1',
              summary: null,
              depth: 3,
              children: ['Deep content'],
            },
          ],
        },
      ],
    };

    await chunker.makeChunks(doc, async (chunk, _) => {
      chunks.push(chunk);
    });

    const simplified = chunks.map(simplifyChunk);

    expect(simplified).toEqual([
      ['Main Document', ['[Summary of Main Document]'], 'Main content here'],
      ['Main Document > Section 1', ['[Summary of Main Document]'], 'Section 1 content'],
      [
        'Main Document > Section 2',
        ['[Summary of Main Document]', '[Summary of Section 2]'],
        'Section 2 content',
      ],
      [
        'Main Document > Section 2 > Subsection 2.1',
        ['[Summary of Main Document]', '[Summary of Section 2]'],
        'Deep content',
      ],
    ]);
  });

  it('handles documents without nested sections', async () => {
    const mockSummarizer = new MockSummarizer();
    const chunker = new TreeChunker(mockSummarizer);
    const chunks: string[] = [];

    const doc: DocumentNode = {
      title: 'Simple Document',
      summary: null,
      depth: 0,
      children: ['First paragraph', 'Second paragraph', 'Third paragraph'],
    };

    await chunker.makeChunks(doc, async (chunk, _) => {
      chunks.push(chunk);
    });

    const simplified = chunks.map(simplifyChunk);

    expect(simplified).toEqual([
      ['Simple Document', [], 'First paragraph\n\nSecond paragraph\n\nThird paragraph'],
    ]);
  });

  it('handles empty document', async () => {
    const mockSummarizer = new MockSummarizer();
    const chunker = new TreeChunker(mockSummarizer);
    const chunks: string[] = [];

    const doc: DocumentNode = {
      title: null,
      summary: null,
      depth: 0,
      children: [],
    };

    await chunker.makeChunks(doc, async (chunk, _) => {
      chunks.push(chunk);
    });

    const simplified = chunks.map(simplifyChunk);

    expect(simplified).toEqual([['null', [], '']]);
  });

  it('source content matches renderDocument output', async () => {
    const markdown = `# Main Title

Main content here.

## Section One

Section one content.

### Subsection 1.1

Subsection content.

## Section Two

Section two content.`;

    const doc = parseMarkdown(markdown);
    const mockSummarizer = new MockSummarizer();
    const chunker = new TreeChunker(mockSummarizer);
    const sources: string[] = [];

    await chunker.makeChunks(doc, async (_, source) => {
      sources.push(source);
    });

    // Each source should match what renderDocument produces for that node with stringChildrenOnly
    const expectedSources = [
      renderDocument(doc, true).trim(),
      renderDocument(doc.children[1] as DocumentNode, true).trim(),
      renderDocument((doc.children[1] as DocumentNode).children[1] as DocumentNode, true).trim(),
      renderDocument(doc.children[2] as DocumentNode, true).trim(),
    ];

    expect(sources).toEqual(expectedSources);
  });

  it('needsSummary returns true only for nodes with child nodes', () => {
    const chunker = new TestableTreeChunker(new MockSummarizer());

    // Node with only text content - no summary needed
    const leafNode: DocumentNode = {
      title: 'Leaf Node',
      summary: null,
      depth: 2,
      children: ['Some text', 'More text', 'Even more text'],
    };

    // Node with child nodes - summary needed
    const parentNode: DocumentNode = {
      title: 'Parent Node',
      summary: null,
      depth: 2,
      children: [
        'Some text',
        {
          title: 'Child',
          summary: null,
          depth: 3,
          children: ['Child text'],
        },
      ],
    };

    // Empty node - no summary needed
    const emptyNode: DocumentNode = {
      title: 'Empty',
      summary: null,
      depth: 1,
      children: [],
    };

    expect(chunker.needsSummary(leafNode)).toBe(false);
    expect(chunker.needsSummary(parentNode)).toBe(true);
    expect(chunker.needsSummary(emptyNode)).toBe(false);
  });
});
