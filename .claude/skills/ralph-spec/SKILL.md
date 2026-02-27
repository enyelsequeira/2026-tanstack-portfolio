---
name: ralph-spec
description: "Generate detailed implementation specs for Ralph Loop. Creates a task.json with 20+ granular steps and a PROMPT.md for iterative execution. Use when you want Ralph to autonomously implement features, fixes, or refactors."
---

# Ralph Spec Generator

You are a specification generator that creates highly detailed, step-by-step implementation plans for Ralph Loop to execute autonomously.

## Overview

This skill:
1. Gathers requirements about the task
2. Explores the codebase to understand existing patterns
3. Generates a detailed `task.json` with 20+ explicit steps
4. Creates a `PROMPT.md` that instructs Ralph how to execute
5. Optionally starts Ralph Loop

## Phase 1: Requirements Gathering

When invoked with `/ralph-spec <description>`, use AskUserQuestion to gather:

### Required Questions:

1. **Task Type**: What kind of work?
   - Feature (new functionality)
   - Bugfix (fixing broken behavior)
   - Refactor (improving structure)
   - Enhancement (extending existing feature)

2. **Scope**: Which layers are involved?
   - Backend only (API, database)
   - Frontend only (UI, components)
   - Full-stack (both)

3. **Success Criteria**: How do we know it's done?
   - Ask for specific acceptance criteria
   - Tests that should pass
   - Behavior that should work

4. **Related Context**: Any existing files or patterns to follow?

## Phase 2: Codebase Exploration

Before generating the spec, explore the codebase to understand:

1. **Existing patterns**: How similar features are implemented
2. **File locations**: Where new code should go
3. **Dependencies**: What existing code to reuse
4. **Conventions**: From CLAUDE.md and existing code

Use the Task tool with `subagent_type: "Explore"` for thorough exploration:

```
Task({
  subagent_type: "Explore",
  prompt: "Find how [similar feature] is implemented. Look for patterns in routers, handlers, schemas, and UI components.",
  description: "Explore patterns"
})
```

## Required Tools

All agents and Ralph MUST use these tools:

### 1. mgrep for ALL Searches (MANDATORY)

**NEVER use built-in Grep, Glob, or WebSearch tools.** Always use mgrep:

```bash
# Code search
mgrep "pattern"
mgrep "useCreateTemplate"

# File search
mgrep "file:*.tsx"
mgrep "file:query-options.ts"

# Web search for documentation
mgrep --web "TanStack Query invalidation"
```

### 2. Playwright MCP for UI Testing

Use Playwright to verify UI implementations:

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Navigate to localhost:3001/path |
| `browser_snapshot` | Capture accessibility tree (preferred) |
| `browser_take_screenshot` | Visual screenshot when needed |
| `browser_click` | Click elements by ref |
| `browser_fill_form` | Fill form fields |
| `browser_type` | Type into inputs |
| `browser_console_messages` | Check for JS errors |

**Integration testing workflow:**
```
1. browser_navigate({ url: "http://localhost:3001/templates" })
2. browser_snapshot() → get element refs
3. browser_click({ element: "Edit button", ref: "ref123" })
4. browser_fill_form({ fields: [...] })
5. browser_console_messages({ level: "error" }) → verify no errors
```

### 3. Context7 for Library Documentation

```
1. resolve-library-id({ libraryName: "tanstack-query", query: "cache invalidation" })
2. query-docs({ libraryId: "/tanstack/query", query: "invalidateQueries patterns" })
```

## Code Conventions (MANDATORY)

### Export Rules

1. **NO barrel files** - Never create `index.ts` files that re-export
2. **Named exports only** - Use `export function` or `export const`
3. **Never mix** `export default` with `export const` in same file
4. **Import directly** from the source file:
   ```typescript
   // GOOD
   import { useCreateTemplate } from "./hooks/use-mutations";
   import { templateFoldersOptions } from "./queries/query-options";

   // BAD - no barrel imports
   import { useCreateTemplate } from "./hooks";
   ```

### Frontend Feature Folder Structure

Follow the pattern from `apps/web/src/components/templates/`:

```
feature-name/
├── components/                    # Sub-components
│   ├── simple-component.tsx       # Simple components at root
│   └── complex-component/         # Complex components in folders
│       └── complex-component.tsx
├── hooks/
│   └── use-mutations.ts           # All mutation hooks
├── queries/
│   ├── query-options.ts           # Query option factories
│   └── use-queries.ts             # Query hooks
├── types.ts                       # Types and interfaces
├── utils.ts                       # Utility functions
├── constants.ts                   # Constants (if needed)
├── feature-view.tsx               # Main component
└── feature-view.module.css        # Styles
```

### Query/Mutation Patterns

**Query options** (`queries/query-options.ts`):
```typescript
import { orpc } from "@/utils/orpc";

export function featureListOptions(params: { id?: number }) {
  return orpc.feature.list.queryOptions({
    input: { id: params.id },
  });
}
```

**Query hooks** (`queries/use-queries.ts`):
```typescript
import { useQuery } from "@tanstack/react-query";
import { featureListOptions } from "./query-options";

export function useFeatureList(params?: { id?: number }) {
  return useQuery(featureListOptions({ id: params?.id }));
}
```

**Mutation hooks** (`hooks/use-mutations.ts`):
```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

export function useCreateFeature() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.feature.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.feature.list.key() });
      },
    }),
  );
}
```

### Cache Invalidation

Use `orpc.*.key()` for cache invalidation:
```typescript
queryClient.invalidateQueries({ queryKey: orpc.feature.list.key() });
queryClient.invalidateQueries({
  queryKey: orpc.feature.getById.key({ input: { id: variables.id } }),
});
```

### Component Props Rule: Max 6 Props

**If a component takes more than 6 props, it's doing too much.** Refactor using:

#### Option 1: Extract Logic into Hooks
```typescript
// BEFORE - too many props (8)
function TemplateCard({
  template,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  isLoading,
  showActions,
}: TemplateCardProps) { ... }

// AFTER - logic extracted to hook (4 props)
function TemplateCard({ template, isSelected, onSelect, showActions }: TemplateCardProps) {
  const { handleEdit, handleDelete, handleDuplicate, isLoading } = useTemplateActions(template.id);
  ...
}
```

#### Option 2: Compound Component Pattern
```typescript
// BEFORE - monolithic component with many props
<DataTable
  data={data}
  columns={columns}
  onSort={handleSort}
  onFilter={handleFilter}
  onRowClick={handleRowClick}
  pagination={pagination}
  onPageChange={handlePageChange}
  isLoading={isLoading}
/>

// AFTER - compound components
<DataTable data={data}>
  <DataTable.Header columns={columns} onSort={handleSort} />
  <DataTable.Body onRowClick={handleRowClick} />
  <DataTable.Pagination {...pagination} onChange={handlePageChange} />
  <DataTable.Loading visible={isLoading} />
</DataTable>
```

#### Option 3: Props Object Pattern
```typescript
// Group related props into objects
interface TemplateCardProps {
  template: Template;
  selection: { isSelected: boolean; onSelect: () => void };
  actions: { onEdit: () => void; onDelete: () => void };
}
```

**When generating steps, if a component would have >6 props:**
1. Add a step to create a custom hook for the logic
2. OR add a step to design compound component structure
3. Then add the component implementation step

### Hooks: Use Mantine First

**DO NOT create custom hooks when Mantine provides one.** Check Mantine hooks first:

| Common Need | Mantine Hook |
|-------------|--------------|
| Debounced value | `useDebouncedValue` |
| Debounced callback | `useDebouncedCallback` |
| Toggle state | `useDisclosure` |
| Form state | `useForm` (from @mantine/form) |
| Local storage | `useLocalStorage` |
| Clipboard | `useClipboard` |
| Media query | `useMediaQuery` |
| Viewport size | `useViewportSize` |
| Scroll position | `useScrollIntoView` |
| Click outside | `useClickOutside` |
| Hover state | `useHover` |
| Focus within | `useFocusWithin` |
| Idle detection | `useIdle` |
| Interval | `useInterval` |
| Timeout | `useTimeout` |
| Previous value | `usePrevious` |
| Uncontrolled state | `useUncontrolled` |
| List state | `useListState` |
| Set state | `useSetState` |
| Counter | `useCounter` |
| Input state | `useInputState` |
| Pagination | `usePagination` |
| Hash/URL | `useHash` |
| Window events | `useWindowEvent` |
| Network status | `useNetwork` |
| OS color scheme | `useColorScheme` |
| Reduced motion | `useReducedMotion` |
| Fullscreen | `useFullscreen` |
| Hotkeys | `useHotkeys` |
| Move/drag | `useMove` |
| Resize observer | `useResizeObserver` |
| Element size | `useElementSize` |
| Mutation observer | `useMutationObserver` |
| Intersection observer | `useIntersection` |
| Eye dropper | `useEyeDropper` |
| Logger | `useLogger` |
| Force update | `useForceUpdate` |
| Merged ref | `useMergedRef` |
| Mounted state | `useMounted` |
| Orientation | `useOrientation` |
| Document title | `useDocumentTitle` |
| Favicon | `useFavicon` |
| Head tags | `useHeadroom` |
| Text selection | `useTextSelection` |
| OS detection | `useOs` |
| Focus trap | `useFocusTrap` |
| Focus return | `useFocusReturn` |
| Document visibility | `useDocumentVisibility` |
| Page leave | `usePageLeave` |
| Mouse position | `useMouse` |
| Window scroll | `useWindowScroll` |
| State history | `useStateHistory` |
| Validated state | `useValidatedState` |

**Before creating a custom hook:**
1. Check https://mantine.dev/hooks/use-debounced-value/ (replace with hook name)
2. Use Context7: `query-docs({ libraryId: "/mantinedev/mantine", query: "hooks list" })`

**Only create custom hooks for:**
- oRPC query/mutation wrappers (like `useCreateTemplate`)
- Complex business logic specific to your feature
- Composing multiple Mantine hooks together

### Mantine Styling Conventions (MANDATORY)

**Before writing any styles, reference Mantine's styling documentation:**

| Documentation | URL | Use For |
|--------------|-----|---------|
| LLM Guide | https://mantine.dev/guides/llms/ | AI-specific guidance |
| PostCSS Preset | https://mantine.dev/styles/postcss-preset/ | Required setup and features |
| CSS Variables | https://mantine.dev/styles/css-variables/ | Theme variables usage |
| CSS Variables List | https://mantine.dev/styles/css-variables-list/ | Full variable reference |
| Data Attributes | https://mantine.dev/styles/data-attributes/ | Component state styling |
| Style Props | https://mantine.dev/styles/style-props/ | Inline style shortcuts |

**PostCSS Preset Features (MUST USE):**

The project uses `postcss-preset-mantine`. These features are available and should be used:

1. **`light-dark()` function** - For color scheme support:
   ```css
   .card {
     background: light-dark(var(--mantine-color-white), var(--mantine-color-dark-7));
     color: light-dark(var(--mantine-color-black), var(--mantine-color-white));
   }
   ```

2. **CSS Variables** - Always use Mantine CSS variables, never hardcoded values:
   ```css
   /* GOOD */
   .button {
     padding: var(--mantine-spacing-sm) var(--mantine-spacing-md);
     border-radius: var(--mantine-radius-md);
     font-size: var(--mantine-font-size-sm);
   }

   /* BAD - hardcoded values */
   .button {
     padding: 8px 16px;
     border-radius: 4px;
     font-size: 14px;
   }
   ```

3. **Color variables with alpha**:
   ```css
   .overlay {
     background: var(--mantine-color-dark-9);
     /* Or with opacity using rgba */
     background: rgba(var(--mantine-color-dark-9), 0.8);
   }
   ```

4. **Data attributes** - For component state styling:
   ```css
   .button {
     &[data-disabled] {
       opacity: 0.5;
     }

     &[data-loading] {
       pointer-events: none;
     }
   }
   ```

**Style Props** - Use instead of custom CSS when possible:
```tsx
// GOOD - Use style props
<Box p="md" bg="gray.1" c="dark.9" />

// BAD - Unnecessary custom CSS for simple styles
<Box className={styles.box} />  // where styles.box just sets padding
```

**Before creating CSS:**
1. Check if Mantine component props handle the styling need
2. Use style props for simple one-off styles
3. Use CSS modules with Mantine CSS variables for complex styles
4. Always use `light-dark()` for colors that should adapt to color scheme
5. Use Context7: `query-docs({ libraryId: "/mantinedev/mantine", query: "styling css variables" })`

## Phase 3: Generate task.json

Create `.claude/ralph-tasks/<task-name>/task.json` with this structure:

```json
{
  "meta": {
    "name": "<task-name-kebab-case>",
    "description": "<full description>",
    "type": "feature|bugfix|refactor|enhancement",
    "scope": "backend|frontend|full-stack",
    "createdAt": "<ISO timestamp>",
    "completionPromise": "<TASK_NAME>_COMPLETE",
    "maxIterations": 30
  },
  "progress": {
    "currentStep": 1,
    "completedSteps": [],
    "totalSteps": 25,
    "lastUpdated": "<ISO timestamp>",
    "iterationCount": 0
  },
  "constraints": {
    "maxFileLines": 350,
    "importOrder": ["type-only", "external", "workspace", "path-aliases", "relative"],
    "errorHandling": "ORPCError",
    "testing": "vitest with mocked db",
    "patterns": ["oRPC contract-based routers", "Drizzle ORM", "TanStack Query"]
  },
  "context": {
    "relatedFiles": ["<discovered files>"],
    "existingPatterns": ["<patterns found>"],
    "userRequirements": "<original requirements>"
  },
  "steps": [
    // See Step Structure below
  ]
}
```

### Step Structure

Each step must be highly specific:

```json
{
  "id": 1,
  "phase": "schema|contracts|handlers|routes|frontend|tests|integration",
  "task": "<specific task description>",
  "file": "<exact file path or null for commands>",
  "action": "create|edit|command|verify",
  "details": "<explicit instructions - what code to write, what to change>",
  "acceptance": [
    "<criterion 1>",
    "<criterion 2>"
  ],
  "dependencies": [0],  // step IDs that must complete first (0 = none)
  "agent": "self|explorer|architect|ui-engineer|coder|reviewer",  // who executes this
  "parallel_group": null,  // steps with same group ID can run in parallel
  "done": false,
  "completedAt": null,
  "notes": ""
}
```

### Agent Assignment

Assign the best agent for each step:

| Agent | Use For | subagent_type |
|-------|---------|---------------|
| `self` | Simple edits, commands, verification | Ralph does it directly |
| `explorer` | Finding patterns, understanding code | `feature-dev:code-explorer` |
| `architect` | Designing solutions, planning | `feature-dev:code-architect` |
| `ui-engineer` | React components, styling, UI | `ui-engineer` |
| `coder` | Backend handlers, business logic | `general-purpose` |
| `reviewer` | Code review, security checks | `senior-code-reviewer` |

### Parallel Execution (CRITICAL)

**MAXIMIZE PARALLELISM**: Any steps whose dependencies are ALL satisfied MUST run in parallel. Do NOT execute steps sequentially if they can run concurrently.

#### Rule: Independent Steps = Parallel Agents

```
If step A depends on [1, 2] and step B depends on [1, 2]
AND steps 1 and 2 are done
THEN spawn agents for A and B IN THE SAME MESSAGE (parallel)
```

#### Parallel Group Field

Steps with the same `parallel_group` are designed to run together:

```json
// These MUST run in parallel (both depend only on step 3)
{ "id": 4, "parallel_group": "contracts", "dependencies": [3], "agent": "coder" },
{ "id": 5, "parallel_group": "contracts", "dependencies": [3], "agent": "coder" },

// These MUST also run in parallel
{ "id": 12, "parallel_group": "frontend-components", "dependencies": [11], "agent": "ui-engineer" },
{ "id": 13, "parallel_group": "frontend-components", "dependencies": [11], "agent": "ui-engineer" },
{ "id": 14, "parallel_group": "frontend-components", "dependencies": [11], "agent": "ui-engineer" },
```

#### How Ralph Should Execute

```
Iteration 1: Steps 1-3 (schema) - sequential, each depends on previous
Iteration 2: Steps 4, 5 ready (both depend on 3) → SPAWN 2 AGENTS IN PARALLEL
Iteration 3: Steps 6, 7 ready → SPAWN 2 AGENTS IN PARALLEL
Iteration 4: Steps 10, 11, 12 ready → SPAWN 3 AGENTS IN PARALLEL
...
```

#### Anti-Pattern (WRONG)
```
// DON'T DO THIS - executing one at a time when parallelism is possible
Iteration 2: Execute step 4 alone
Iteration 3: Execute step 5 alone  ← WRONG! Should have run with step 4
```

#### Correct Pattern
```typescript
// DO THIS - spawn all ready agents in ONE message
Task({ subagent_type: "coder", prompt: "Step 4...", description: "Create input schema" })
Task({ subagent_type: "coder", prompt: "Step 5...", description: "Create output schema" })
Task({ subagent_type: "coder", prompt: "Step 6...", description: "Create contract" })
// All three run simultaneously!
```

### Phase Categories

Organize steps into these phases (in order):

1. **schema** - Database schema changes
   - Add columns, tables, relations
   - Generate/apply migrations

2. **contracts** - API contracts
   - Input/output schemas in schemas.ts
   - Route contracts in contracts.ts

3. **handlers** - Business logic
   - Handler functions in handlers.ts
   - Database operations

4. **routes** - Route wiring
   - Connect handlers to contracts in routes.ts
   - Export from index.ts

5. **frontend** - UI implementation
   - Hooks for data fetching
   - Components
   - Page integration

6. **tests** - Testing
   - Unit tests for handlers
   - Integration tests
   - UI tests if applicable

7. **integration** - Final verification
   - End-to-end flow works
   - All acceptance criteria met

### Step Granularity Guidelines

For a full-stack feature, expect approximately:
- 2-3 schema steps
- 3-5 contracts/schemas steps
- 3-5 handler steps
- 2-3 route steps
- 5-8 frontend steps
- 3-5 test steps
- 1-2 integration steps

**Total: 20-30 steps**

Each step should be completable in a single edit or command. If a step feels too big, split it.

## Phase 4: Generate PROMPT.md

Create `.claude/ralph-tasks/<task-name>/PROMPT.md`:

```markdown
# Task: {{meta.name}}

{{meta.description}}

## Instructions

You are executing a detailed implementation plan. Each iteration:

1. **Read** `.claude/ralph-tasks/{{meta.name}}/task.json`
2. **Find** the first step where `done: false`
3. **Execute** the step following its `details` and `acceptance` criteria
4. **Update** the task.json:
   - Set step's `done: true`
   - Set step's `completedAt` to current ISO timestamp
   - Add any relevant `notes`
   - Add step id to `progress.completedSteps`
   - Update `progress.currentStep` to next incomplete step
   - Update `progress.lastUpdated`
   - Increment `progress.iterationCount`
5. **Check** if ALL steps are done
   - If yes: Output `<promise>{{meta.completionPromise}}</promise>`
   - If no: Continue to next iteration

## Constraints

{{#each constraints}}
- {{@key}}: {{this}}
{{/each}}

## Success Criteria

The task is complete when:
{{#each meta.successCriteria}}
- {{this}}
{{/each}}

## Important Rules

1. **One step per iteration** - Complete exactly one step, then update task.json
2. **Follow existing patterns** - Reference files in `context.relatedFiles`
3. **Check acceptance criteria** - Don't mark done unless ALL criteria met
4. **Track progress** - Always update task.json after each step
5. **Use the right tools**:
   - Use `mgrep "pattern"` for code search (NOT Grep/Glob)
   - Use Context7 for library documentation
   - Run tests with `pnpm test` or `pnpm -F @fit-ai/api test`

## Current Task File

`.claude/ralph-tasks/{{meta.name}}/task.json`
```

## Phase 5: Start Ralph Loop (Optional)

After generating the files, ask if the user wants to start Ralph:

```
AskUserQuestion({
  question: "Start Ralph Loop now?",
  options: [
    { label: "Yes, start Ralph", description: "Run /ralph-loop with the generated spec" },
    { label: "No, I'll review first", description: "Let me review the spec before starting" }
  ]
})
```

If yes, start Ralph:

```bash
/ralph-loop "Execute the implementation plan in .claude/ralph-tasks/<name>/PROMPT.md" --max-iterations 30 --completion-promise "<COMPLETION_PROMISE>"
```

## Example Invocation

User: `/ralph-spec "Add user profile editing with avatar upload"`

Output:
1. Ask questions about scope, success criteria
2. Explore codebase for user patterns
3. Generate `.claude/ralph-tasks/user-profile-editing/task.json` with 25 steps
4. Generate `.claude/ralph-tasks/user-profile-editing/PROMPT.md`
5. Ask if user wants to start Ralph
6. Start Ralph Loop

## Important Rules

1. **Be extremely specific** - Every step should have exact file paths and explicit instructions
2. **Test each layer** - Include test steps after implementation steps
3. **Follow conventions** - Pull constraints from CLAUDE.md
4. **Order matters** - Steps must be in dependency order (schema → contracts → handlers → routes → frontend → tests)
5. **Track everything** - task.json is the source of truth for progress
6. **Use completion promise** - Always include `<promise>` tag check for Ralph to exit

## On Invocation

When user runs `/ralph-spec <description>`:

1. Parse the description
2. Ask clarifying questions with AskUserQuestion
3. Explore the codebase with Task/Explore agent
4. Generate detailed task.json (20+ steps)
5. Generate PROMPT.md
6. Ask if user wants to start Ralph Loop
7. If yes, invoke `/ralph-loop` with the spec
