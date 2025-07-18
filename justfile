
set dotenv-load

demo FILE CONTEXT='':
    tsx bin/demo.ts {{FILE}} "{{CONTEXT}}"

scamming-demo:
    tsx bin/demo.ts demo/Scamming.md 'The document has come from the Wiki page about an online crime game; all documents have, so that detail can be assumed: don'\''t mention "online crime game".'
