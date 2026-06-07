# Research Report: Mermaid Diagram Refresh

**Date:** 2026-06-06  
**Topic:** Mermaid syntax for webapp use-case-style and sequence diagrams

## Findings

- Mermaid `flowchart` supports nodes, edges, direction, and `subgraph`; use it for use-case-style overview because Mermaid has no strict UML use-case diagram syntax in stable docs.
- Mermaid `sequenceDiagram` supports `actor`, `participant`, messages, notes, `alt/else`, `opt`, and `loop`; use it for business flow details.
- Mermaid warns about reserved syntax pitfalls such as lowercase `end`; keep labels quoted/capitalized where needed.
- Export path can remain Mermaid Live Editor or Mermaid CLI, no repo app-code change needed.

## Recommended Approach

- Keep `.mmd` source files under `docs/diagrams/mermaid/`.
- Use `flowchart LR` for the overview.
- Use one sequence file per major domain flow.
- Add dedicated rental and eKYC diagrams instead of expanding already dense files.

## Sources

- Mermaid flowchart syntax: https://mermaid.js.org/syntax/flowchart.html
- Mermaid sequence diagram syntax: https://mermaid.js.org/syntax/sequenceDiagram
- Mermaid syntax reference: https://mermaid.js.org/intro/syntax-reference.html

## Unresolved Questions

- None for syntax. Product scope still needs owner review.
