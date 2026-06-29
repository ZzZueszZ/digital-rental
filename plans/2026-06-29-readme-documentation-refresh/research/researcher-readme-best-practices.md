# Research Report: README Best Practices

**Date:** 2026-06-29
**Research Question:** What should LensHub README files include so new developers can understand and run each project quickly?

## Executive Summary

READMEs should be landing pages, not full manuals. For this repo, root README should explain monorepo shape and first-run path; project READMEs should cover purpose, prerequisites, env, commands, integration points, and troubleshooting.

## Key Findings

### README as entry point

- GitHub Docs describes READMEs as a repository landing page that explains what the project does, why useful, how to start, where to get help, and who maintains it.
- Source: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes

### README as welcome mat

- The Turing Way frames README as the first document readers use to orient themselves in a project.
- Source: https://the-turing-way.netlify.app/project-design/project-repo/project-repo-readme

### Write for task flow

- Google technical writing guidance emphasizes audience, clear structure, and concise task-focused docs.
- Source: https://developers.google.com/tech-writing

## Recommendations

1. Root README: explain product, architecture, repo map, quick start order, and source-of-truth docs.
2. Frontend README: replace create-next-app boilerplate with LensHub-specific setup, env, scripts, route map, and build notes.
3. Backend README: create project-specific Java/Spring setup, env, DB/Redis/MinIO, tests, Docker, production notes.
4. AI KYC README: rewrite existing mojibake content with clean UTF-8 or ASCII Vietnamese-free English; preserve useful endpoint/run/test details.

## Alternatives Considered

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Long root README only | Easy to find everything | Duplicates project details; hard maintain | Reject |
| Project READMEs only | Close to code | No monorepo onboarding | Reject |
| Root overview + focused project READMEs | Clear entry + local detail | Requires cross-link discipline | Choose |

## Unresolved Questions

- None.
