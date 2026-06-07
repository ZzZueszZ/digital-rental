# Evidence: MASTER

## 1 Research Findings

- Mermaid flowchart syntax supports nodes, edges, and subgraphs. Use this for use-case style diagrams because Mermaid has no stable built-in UML use-case diagram syntax.
- Mermaid sequenceDiagram syntax supports participants, actors, notes, loops, and alt/else branches. Use this for detailed interaction flows.
- Avoid lowercase `end` as a node label in Mermaid; quote or capitalize labels where needed.
- 2026-06-06 refresh: current code/docs include rental lifecycle and eKYC flows. Existing diagram plan/artifacts need revision, not duplicate plan.
- 2026-06-06 source index: active src scan found 559 files in `frontend/src` + `service/lenshub/src` (292 Java, 210 TSX, 55 TS, 1 YML, 1 CSS). Main use cases grouped by Guest, Customer, Staff/Admin, Super Admin, external systems.

## 2 Key Decisions

- Create one overview use-case diagram and multiple sequence diagrams grouped by business domain.
- Store generated files under `docs/diagrams/mermaid/`.
- Use `.mmd` files so Mermaid CLI, Mermaid Live Editor, or VS Code extensions can export PNG.
- Add dedicated rental/eKYC sequence coverage instead of overloading existing order/auth diagrams.
- For source usecase index, use frontend routes + services + backend controllers as evidence chain. Treat endpoint actions as evidence, but group final use cases by actor goal.

## 3 Constraints & Risks

- 16 flows are too large for one readable sequence diagram.
- Use case diagram will be approximated with `flowchart LR` and subgraphs, not strict UML notation.
- Some route names/behaviors are inferred from current docs/code and may need product owner confirmation.
