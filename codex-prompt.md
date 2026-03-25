Read this spec first:
/Users/jamie/.openclaw/workspace/automation/daily-codex-project-spec.md

You are building one small but real personal project from scratch in the current git repo.

Important constraints:
- Keep scope tight enough to finish in one uninterrupted session.
- Prefer zero third-party APIs.
- Do not use mocks, placeholders, TODO stubs, or fake integrations.
- The project must work locally.
- The project must include automated tests that pass.
- The project must include a robust README and a docs/ directory.
- The repo must be published to GitHub.
- If it is a static visualization or small front-end artifact, also publish it to GitHub Pages.
- Leave a `.jamie-project-meta.json` file in the repo root that matches the spec exactly.

Execution requirements:
1. Pick a worthwhile idea from the preferred themes.
2. Build the project fully.
3. Run the tests yourself and fix anything failing.
4. Create the GitHub repo with gh and push the result.
5. If GitHub Pages makes sense, enable it and include the final URL in the metadata.
6. Make sure `.jamie-project-meta.json` is truthful.
7. Print a short summary at the end with the repo URL, pages URL if any, and the test commands you ran.

GitHub publishing notes:
- Assume gh is already authenticated.
- Create a public repo unless there is a concrete reason not to.
- Use a sensible original repo name.

Do not ask for clarification. Make good choices and finish the job.
