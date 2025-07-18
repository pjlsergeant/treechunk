# Development Preferences

## Testing Philosophy
- **DSL approach**: Create helper functions that simplify test data structures for readability
- **Direct testing over mocking**: Test actual logic, not side effects (e.g., the testable subclass pattern)
- **Minimal but effective**: Don't over-test (like testing regex engines or every whitespace variation)
- **Debug properly**: Print full output when debugging test failures, don't make assumptions

## Code Design
- **Simple and direct**: When given options, prefer the simplest approach
- **Flexibility through simplicity**: Like making the document context just a raw string parameter
- **Class-based when it aids testing**: Refactoring to classes for dependency injection
- **Keep things where they belong**: Don't create index files when not needed

## Development Approach
- **Don't waste time on formatting**: Let the formatter handle it
- **Use real implementations**: No MockSummarizer for demos - use the real thing
- **Make tools usable**: Command-line args for flexibility, not hard-coded values
- **Focus on what matters**: Skip boilerplate tests, focus on critical paths

# Project Context

## Project Overview
- **What it does**: Splits markdown documents into contextual chunks for RAG systems while preserving document hierarchy
- **Key feature**: Uses AI to generate summaries for parent sections, accumulating context as it goes deeper

## Architecture Quick Reference
- `markdownParser.ts` - Parses markdown into hierarchical DocumentNode tree
- `TreeChunker` class - Orchestrates the chunking process with callbacks
- `BaseSummarizer` abstract class - Handles prompt building, subclasses implement the LLM call
- `OpenAISummarizer` - Default implementation using OpenAI

## Key Design Decisions
- Chunks are generated depth-first with accumulated parent summaries
- Summarizer is injected for flexibility (can swap LLM providers)
- Document context is configurable per use case
- Callback-based chunking for memory efficiency

## Testing Patterns
- `simplifyNode()` for markdown parser tests
- `TestableTreeChunker` for exposing protected methods
- `simplifyChunk()` for chunk structure tests