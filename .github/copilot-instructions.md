# Git Commit Message Guidelines

When generating or suggesting Git commit messages, you MUST strictly follow the Conventional Commits specification (v1.0.0).

## Format Structure
`<type>(<scope>): <short summary>`

`[optional body]`

`[optional footer(s)]`

## Rules
1. **Type**: Must be one of the following:
   - `feat`: A new feature for the user.
   - `fix`: A bug fix.
   - `docs`: Documentation changes only.
   - `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.).
   - `refactor`: A code change that neither fixes a bug nor adds a feature.
   - `perf`: A code change that improves performance.
   - `test`: Adding missing tests or correcting existing tests.
   - `build`: Changes that affect the build system or external dependencies.
   - `ci`: Changes to CI configuration files and scripts.
   - `chore`: Other changes that don't modify src or test files.
   - `revert`: Reverts a previous commit.

2. **Scope**: Optional, lowercase word describing the codebase section affected (e.g., `feat(auth):`, `fix(ui):`).
3. **Subject Line**:
   - Use imperative, present-tense verbs (e.g., "add", "fix", "change" — not "added" or "adds").
   - Do not capitalize the first letter.
   - Do not place a period (`.`) at the end of the subject line.
   - Keep the summary to 50 characters or fewer.

4. **Breaking Changes**:
   - Include `!` after the type/scope for breaking changes (e.g., `feat(api)!: change user endpoint`).
   - Add a `BREAKING CHANGE: <description>` footer if applicable.

## Examples
- `feat(cart): add item removal functionality`
- `fix(login): handle network timeout errors gracefully`
- `docs(readme): update installation prerequisites`
- `refactor(db): simplify user query logic`