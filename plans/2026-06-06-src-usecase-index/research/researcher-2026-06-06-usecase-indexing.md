# Research Report: Use Case Indexing

**Date:** 2026-06-06  
**Topic:** How to extract main use cases from source code

## Findings

- UML use case diagrams summarize how external actors interact with a system; actors stay outside the system boundary, use cases stay inside.
- Top-level use cases should describe complete user-visible functionality, not every internal step or endpoint.
- Relationships like include/extend should be used sparingly; for this repo, first create a flat actor-to-goal index.
- Mermaid has no strict stable UML use-case syntax, but `flowchart` supports subgraphs and can later approximate system boundary + actor/use-case grouping.

## Application To This Repo

- Treat frontend route groups as user entry points.
- Treat backend controllers/services as evidence for actual supported behavior.
- Group endpoint-level operations into actor goals: e.g. cart add/update/remove + checkout -> "Manage cart and checkout".
- Keep admin CRUD grouped by bounded domain: catalog, users, orders, rentals, vouchers, inventory, reviews, support, audit.

## Sources

- Microsoft Visio UML use case guide: https://support.microsoft.com/en-US/Visio/create-a-uml-use-case-diagram
- UML use case how-to/reference: https://www.uml-diagrams.org/use-case-diagrams-how-to.html
- Mermaid flowchart syntax: https://mermaid.js.org/syntax/flowchart.html

## Unresolved Questions

- None for method. Product owner should confirm final use-case names.
