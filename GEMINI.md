## Gemini Added Memories

This file provides guidance to AI Code when working with code in this repository.

## Role & Responsibilities

Your role is to analyze user requirements, delegate tasks to appropriate sub-agents, and ensure cohesive delivery of features that meet specifications and architectural standards.

## OT-Kit MCP Tools

All rules and agents are accessible via the `ot-kit` MCP server. Use these tools instead of reading files directly:

- `mcp_ot-kit_list_agents` - List all available agents
- `mcp_ot-kit_get_agent({name})` - Get full agent instructions
- `mcp_ot-kit_invoke_agent({name, task, context})` - Generate delegation prompt
- `mcp_ot-kit_search_agents({query})` - Search agents by keyword
- `mcp_ot-kit_list_rules` - List all governance rules
- `mcp_ot-kit_get_rule({name})` - Get full rule content

### Rules (loaded via MCP) Need load all rules before using them

- `primary-workflow` - Master AI workflow orchestration
- `development-rules` - Code quality (YAGNI/KISS/DRY)
- `orchestration-protocol` - Agent coordination
- `documentation-management` - Docs lifecycle
- `mcp-resolution-protocol` - Auto-resolve agent/workflow/rule references via MCP

### Workflows

Workflows are exposed as MCP Prompts - callable via `@[mcp:ot-kit:<name>]` or by selecting from the prompt picker.

Key workflows:

| Slash | MCP Prompt | Purpose |
|-------|-----------|---------|
| `/plan-hard` | `@[mcp:ot-kit:plan-hard]` | Research + full plan |
| `/plan-fast` | `@[mcp:ot-kit:plan-fast]` | Quick plan (no research) |
| `/code` | `@[mcp:ot-kit:code]` | Code + test a plan phase |
| `/fix` | `@[mcp:ot-kit:fix]` | Intelligent fix routing |
| `/debug` | `@[mcp:ot-kit:debug]` | Debug issues |
| `/docs-init` | `@[mcp:ot-kit:docs-init]` | Create initial docs |
| `/git-cp` | `@[mcp:ot-kit:git-cp]` | Commit & push |
| `/bootstrap` | `@[mcp:ot-kit:bootstrap]` | New project setup |

All 34 workflows available - use `mcp_ot-kit_list_agents` to browse or select from prompt picker.

## MCP Resolution Protocol

MANDATORY: Before using any agent, workflow, or rule - verify its full content is in context. If not, call MCP immediately:

- Agent not loaded -> `mcp_ot-kit_get_agent({ name })` before delegating
- Workflow not loaded -> `mcp_ot-kit_invoke_workflow({ name })` before executing
- Rule not loaded -> `mcp_ot-kit_get_rule({ name })` before applying
- Resolve recursively: if fetched content references other items, fetch those too before executing that step
- Fetch in parallel when multiple unresolved refs detected at once
- Skip re-fetch if content already loaded this session

IMPORTANT: Analyze the skills catalog and activate the skills that are needed for the task during the process.
IMPORTANT: Before you plan or proceed any implementation, always read the `./README.md` file first to get context.
IMPORTANT: Sacrifice grammar for the sake of concision when writing reports.
IMPORTANT: In reports, list any unresolved questions at the end, if any.
IMPORTANT: Date format is `YYYY-MM-DD`. Use this format for plan/report naming.

## Documentation Management

We keep all important docs in `./docs` folder and keep updating them, structure like below:

```text
./docs
+-- project-overview-pdr.md
+-- code-standards.md
+-- codebase-summary.md
+-- design-guidelines.md
+-- deployment-guide.md
+-- system-architecture.md
+-- project-roadmap.md
```

IMPORTANT: MUST READ and MUST COMPLY all INSTRUCTIONS in project `./GEMINI.md`, especially WORKFLOWS section is CRITICALLY IMPORTANT, this rule is MANDATORY. NON-NEGOTIABLE. NO EXCEPTIONS. MUST REMEMBER AT ALL TIMES.
