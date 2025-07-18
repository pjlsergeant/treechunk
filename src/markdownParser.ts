import { marked } from 'marked';

export type DocumentNode = {
  title: string | null;
  summary: string | null;
  children: DocumentNodeOrText[];
  depth: number;
};

export type DocumentNodeOrText = DocumentNode | string;

export function renderDocument(node: DocumentNodeOrText): string {
  if (typeof node === 'string') return node;
  let title: string;

  if (node.depth === 0) {
    title = '# ' + node.title;
  } else {
    title = `\n\n${'#'.repeat(node.depth || 1)} ${node.title}`;
  }

  return title + '\n\n' + node.children.map((o) => renderDocument(o)).join('\n\n');
}

export function parseMarkdown(markdown: string): DocumentNode {
  const tokens = marked.lexer(markdown);

  // Build document tree
  const root: DocumentNode = {
    title: null,
    summary: null,
    children: [],
    depth: 0,
  };

  const stack: DocumentNode[] = [root];
  let cursor = root;

  for (const token of tokens) {
    if (token.type === 'heading') {
      if (!token.depth) throw new Error('Token without depth');

      // Special-case the first heading
      if (!root.title) {
        root.title = token.text!;
      } else {
        // Work out where we are
        while (true) {
          if (stack.length === 0 || stack.at(-1)!.depth < token.depth) {
            if (stack.length === 0) {
              cursor = root;
              stack.push(root);
            } else {
              cursor = stack.at(-1)!;
            }

            const newBlock: DocumentNode = {
              title: token.text!,
              summary: null,
              depth: token.depth,
              children: [],
            };

            cursor.children.push(newBlock);
            cursor = newBlock;
            stack.push(newBlock);

            break;
          } else {
            stack.pop();
          }
        }
      }
    }
    // Anything other than a heading
    else {
      if (token.raw.match(/\S/)) cursor.children.push(token.raw);
    }
  }

  return root;
}
