# Research Report: Mermaid Diagram Syntax

**Date:** 2026-06-06
**Topic:** Mermaid syntax for exportable use-case-style and sequence diagrams

## Findings

- Mermaid flowcharts are composed of nodes and edges; they support directional layouts and subgraphs. This fits use-case overview diagrams where actors connect to groups of system capabilities.
- Mermaid sequence diagrams represent process interactions and support explicit participants, actors, notes, activation, `alt/else`, `loop`, and optional paths. This fits detailed webapp flows.
- Mermaid syntax is strict: reserved words like lowercase `end` can break diagrams, so labels should be quoted or capitalized when needed.

## Recommended Format

- Use `flowchart LR` for use-case overview.
- Use `sequenceDiagram` for detailed flows.
- Save as standalone `.mmd` files.
- Keep each file scoped to one domain group; large diagrams become unreadable and hard to export.

## Sources

- Mermaid flowchart syntax: https://mermaid.js.org/syntax/flowchart.html
- Mermaid sequence diagram syntax: https://mermaid.js.org/syntax/sequenceDiagram
- Mermaid syntax reference: https://mermaid.js.org/intro/syntax-reference.html

## Unresolved Questions

- None for syntax. Product-level naming still needs owner review.
