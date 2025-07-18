The below README is AI-slop for now.

# TreeChunk

A hierarchical markdown chunking tool for RAG (Retrieval-Augmented Generation) systems. TreeChunk intelligently splits markdown documents into contextual chunks while preserving document structure and generating AI-powered summaries for better retrieval.

## Features

- **Hierarchical Chunking**: Maintains document structure by preserving the relationship between sections and subsections
- **AI-Powered Summaries**: Generates contextual summaries for each section using OpenAI
- **Context Preservation**: Each chunk includes the full path (e.g., "Article > Section > Subsection") and parent summaries
- **Smart Splitting**: Recursively processes nested markdown structures while keeping related content together
- **RAG-Optimized**: Designed specifically for use in retrieval-augmented generation systems

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/treechunk.git
cd treechunk

# Install dependencies
npm install
```

## Configuration

TreeChunk requires an OpenAI API key for generating summaries:

```bash
# Create a .env file
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

## Usage

### Command Line

Use the provided `justfile` command to chunk a markdown file:

```bash
just chunk path/to/your/document.md
```

This will output each chunk separated by `---+++---` markers.

### Programmatic Usage

```typescript
import { parseMarkdown } from './src/markdownParser';
import { makeChunks } from './src/chunk';

// Read and parse your markdown
const markdownContent = fs.readFileSync('document.md', 'utf8');
const documentTree = parseMarkdown(markdownContent);

// Generate chunks with AI summaries
const chunks = await makeChunks(documentTree);

// Each chunk includes:
// - Full hierarchical title path
// - AI-generated context summaries
// - The actual content
```

## How It Works

1. **Parsing**: The markdown is parsed into a hierarchical tree structure where each node represents a section with its title, content, and child sections.

2. **Summary Generation**: For sections that contain subsections, TreeChunk uses OpenAI to generate concise summaries that capture the key information.

3. **Chunking**: The tool recursively processes the tree, creating chunks that include:
   - The full title path (e.g., "Main Title > Section > Subsection")
   - Accumulated summaries from parent sections for context
   - The actual content of that section

4. **Output**: Each chunk is self-contained with enough context to be useful in isolation, making it perfect for RAG systems.

## Example Output

```markdown
# Getting Started > Installation > Prerequisites

> AI-generated context:
> - This guide covers setting up the development environment
> - Installation requires Node.js 18+ and npm

Before installing, ensure you have the following tools installed:
- Node.js (version 18 or higher)
- npm or yarn package manager
- Git for version control
```

## Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run dev

# Type checking
npm run build

# Linting
npm run lint

# Format code
npm run format
```

## License

MIT License - feel free to use this in your own projects!