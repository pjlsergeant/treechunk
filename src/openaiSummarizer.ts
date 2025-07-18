import OpenAI from 'openai';
import { DocumentNode } from './markdownParser';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getTextContent(node: DocumentNode): string {
  const directText = node.children
    .filter(c => typeof c === 'string')
    .join('\n\n');

  return directText;
}

function buildTitlePath(node: DocumentNode, stack: DocumentNode[]): string {
  return stack.length === 0
    ? node.title ?? ''
    : [...stack.map(s => s.title), node.title].join(' > ');
}

function buildContextSummary(stack: DocumentNode[]): string {
  const summaries = stack
    .map(s => s.summary)
    .filter(s => s?.length);

  if (summaries.length === 0) return '';

  return summaries.map(s => `* ${s}`).join('\n');
}

export async function summarize(node: DocumentNode, stack: DocumentNode[] = []): Promise<string> {
  const content = getTextContent(node);

  // if ( stack.length === 0 ) console.log({node});

  if (!content.trim()) {
    return '';
  }

  const titlePath = buildTitlePath(node, stack);
  const contextSummary = buildContextSummary(stack);

  // Build the base prompt structure
  const basePrompt = `I am chunking a document for use in a RAG system. Each document is being split into increasingly narrow sections, and I am trying to provide a small amount of context about where each chunk has come from.

One way I am doing this is showing the full title path:

"Article title > Section title > Sub-section title"

I will also provide a summary of all the text at each section.

This will be prepended to the sub-section text.`;

  // Choose the appropriate instruction paragraph based on context
  const instructionParagraph = stack.length === 0
    ? `I would like you to provide two very, very short sentences; one describing the topic of the articles, and the other presenting the key facts provided in the article, that can be combined with the title to provide some context. It should be as useful as possible to provide an overall context to include with the chunk. Present these sentences together on the same line. It does not need to be detail-heavy, each section will have more detail added. You should focus on the beginning of the document: the first few paragraphs will likely provide the best source for a summary. The document has come from the Wiki page about an online crime game; all documents have, so that detail can be assumed: don't mention "online crime game".`
    : `I would like you to provide a very, very short sentence describing the key facts provided in this section, that can be combined with the title to provide some context. It should be as useful as possible to provide an overall context to include with the chunk. It does not need to be detail-heavy, each section will have more detail added. You should focus on the beginning of the section: the first few paragraphs will likely provide the best source for a summary. The document has come from the Wiki page about an online crime game; all documents have, so that detail can be assumed: don't mention "online crime game". I have provided the context from running this process in the parent sections to help guide you.`;

  // Build the complete prompt
  const prompt = `${basePrompt}

${instructionParagraph}

Title: ${titlePath}

${contextSummary ? `AI-generated context summary:

${contextSummary}

` : ''}Content:

${content}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'o4-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}