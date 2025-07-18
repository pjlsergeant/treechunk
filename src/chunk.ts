import { DocumentNode } from './markdownParser';
import { summarize } from './openaiSummarizer';

function needsSummary(node: DocumentNode) {
  return !!node.children.find((c) => typeof c !== 'string');
}

// async function summarize(node: DocumentNode) {
//   return `[Summary of ${node.title}]`;
// }

export async function makeChunks(
  node: DocumentNode,
  stack: DocumentNode[] = [],
): Promise<string[]> {
  if (needsSummary(node)) node.summary = await summarize(node, stack);

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
    childChunks.push(...(await makeChunks(childNode, [...stack, node])));
  }

  return [chunk, ...childChunks];
}
