import { describe, it, expect } from 'vitest';
import { parseMarkdown, DocumentNode } from './markdownParser';

// Helper function to simplify DocumentNode structure for testing
function simplifyNode(node: DocumentNode): any[] {
  const result: any[] = [];

  // Add title with appropriate # symbols for depth
  if (node.title !== null) {
    const prefix = node.depth === 0 ? '' : '#'.repeat(node.depth) + ' ';
    result.push(prefix + node.title);
  }

  // Collect text content
  const textContent = node.children.filter((child): child is string => typeof child === 'string');
  if (textContent.length > 0) {
    result.push(textContent);
  }

  // Recursively process child nodes
  const childNodes = node.children.filter(
    (child): child is DocumentNode => typeof child !== 'string',
  );
  for (const child of childNodes) {
    result.push(simplifyNode(child));
  }

  return result;
}

describe('markdownParser', () => {
  it('parses simple structure with headings and content', () => {
    const input = `
## Title

Hey there
Good looking

## Sub-title 1

- it's good
- to talk

## Sub-title 2

about things`;

    const parsed = parseMarkdown(input);
    const simplified = simplifyNode(parsed);

    expect(simplified).toEqual([
      'Title',
      ['Hey there\nGood looking'],
      ['## Sub-title 1', ["- it's good\n- to talk"]],
      ['## Sub-title 2', ['about things']],
    ]);
  });

  it('handles nested heading structures with depth changes', () => {
    const input = `
# Main Title

Top level content

## Section 1

Section 1 content

### Subsection 1.1

Deep content 1.1

### Subsection 1.2

Deep content 1.2

## Section 2

Section 2 content

### Subsection 2.1

Content 2.1

#### Deep section

Very deep content

### Subsection 2.2

Back to level 3`;

    const parsed = parseMarkdown(input);
    const simplified = simplifyNode(parsed);

    expect(simplified).toEqual([
      'Main Title',
      ['Top level content'],
      [
        '## Section 1',
        ['Section 1 content'],
        ['### Subsection 1.1', ['Deep content 1.1']],
        ['### Subsection 1.2', ['Deep content 1.2']],
      ],
      [
        '## Section 2',
        ['Section 2 content'],
        ['### Subsection 2.1', ['Content 2.1'], ['#### Deep section', ['Very deep content']]],
        ['### Subsection 2.2', ['Back to level 3']],
      ],
    ]);
  });

  it('handles heading depth jumps and content before first heading', () => {
    const input = `This is content before any heading

It should be attached to the root

## Main Title

Main content

#### Subsection (skipped h3)

Jumped straight to h4

### Back to h3

Now at h3 level

##### Very deep (skipped h4)

Jumped from h3 to h5

### Another h3

Back to h3 level`;

    const parsed = parseMarkdown(input);
    const simplified = simplifyNode(parsed);

    expect(simplified).toEqual([
      'Main Title',
      ['This is content before any heading', 'It should be attached to the root', 'Main content'],
      ['#### Subsection (skipped h3)', ['Jumped straight to h4']],
      [
        '### Back to h3',
        ['Now at h3 level'],
        ['##### Very deep (skipped h4)', ['Jumped from h3 to h5']],
      ],
      ['### Another h3', ['Back to h3 level']],
    ]);
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      const input = '';
      const parsed = parseMarkdown(input);
      const simplified = simplifyNode(parsed);

      expect(simplified).toEqual([]);
    });

    it('handles only whitespace', () => {
      const input = '   \n\n   \t\n   ';
      const parsed = parseMarkdown(input);
      const simplified = simplifyNode(parsed);

      expect(simplified).toEqual([]);
    });

    it('handles content with no headings', () => {
      const input = `This is just text
No headings here

Another paragraph
- A list item
- Another item`;

      const parsed = parseMarkdown(input);
      const simplified = simplifyNode(parsed);

      expect(simplified).toEqual([
        [
          'This is just text\nNo headings here',
          'Another paragraph\n',
          '- A list item\n- Another item',
        ],
      ]);
    });

    it('handles single heading with no content', () => {
      const input = '# Only Title';
      const parsed = parseMarkdown(input);
      const simplified = simplifyNode(parsed);

      expect(simplified).toEqual(['Only Title']);
    });

    it('handles multiple headings with no content', () => {
      const input = `# Title
## Section 1
### Subsection
## Section 2`;

      const parsed = parseMarkdown(input);
      const simplified = simplifyNode(parsed);

      expect(simplified).toEqual(['Title', ['## Section 1', ['### Subsection']], ['## Section 2']]);
    });
  });
});
