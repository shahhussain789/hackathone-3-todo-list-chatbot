# Tasks: Todo AI Chatbot

**Input**: Design documents from `/specs/001-ai-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual testing per spec constraints. No automated tests required.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/app/`, `frontend/`
- Backend: Python FastAPI with SQLModel
- Frontend: Next.js 15+ with App Router

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create module structure

- [x] T001 Add OpenAI and MCP dependencies to backend/requirements.txt (openai>=1.0.0, mcp>=1.0.0)
- [x] T002 [P] Add ChatKit dependency to frontend/package.json (@openai/chatkit)
- [x] T003 [P] Add OPENAI_API_KEY to backend/.env.example
- [x] T004 [P] Add NEXT_PUBLIC_OPENAI_DOMAIN_KEY to frontend/.env.local.example
- [x] T005 Create backend/app/mcp/__init__.py module structure
- [x] T006 [P] Create backend/app/mcp/tools/__init__.py module structure
- [x] T007 [P] Create backend/app/agent/__init__.py module structure
- [x] T008 [P] Create frontend/components/chat/ directory structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create Conversation model in backend/app/models/conversation.py per data-model.md
- [x] T010 [P] Create Message model in backend/app/models/message.py per data-model.md
- [x] T011 Export new models in backend/app/models/__init__.py
- [x] T012 Create chat schemas (ChatRequest, ChatResponse, ToolCall) in backend/app/schemas/chat.py per contracts/chat-api.md
- [x] T013 [P] Create conversation schemas (ConversationSummary, ConversationListResponse, ConversationDetailResponse, MessageResponse) in backend/app/schemas/chat.py
- [x] T014 Export chat schemas in backend/app/schemas/__init__.py
- [x] T015 Create MCP server setup in backend/app/mcp/server.py with tool registration
- [x] T016 Create OpenAI agent configuration in backend/app/agent/chat_agent.py with tool definitions
- [x] T017 Create chat API client utility in frontend/lib/chat-api.ts with sendMessage and getConversations functions

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 & 2 - Create and List Tasks via Chat (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks via chat ("Add task to buy groceries") and list tasks ("Show my tasks")

**Independent Test**: Send "Add a task to buy groceries" → verify task created and confirmation displayed. Send "Show my tasks" → verify task list displayed.

### Implementation for User Stories 1 & 2

- [x] T018 [P] [US1] Implement add_task MCP tool in backend/app/mcp/tools/add_task.py - creates task in DB, returns friendly confirmation
- [x] T019 [P] [US2] Implement list_tasks MCP tool in backend/app/mcp/tools/list_tasks.py - retrieves user tasks, formats as readable list
- [x] T020 Register add_task and list_tasks tools in backend/app/mcp/tools/__init__.py
- [x] T021 [US1] Wire add_task tool to OpenAI agent in backend/app/agent/chat_agent.py with function definition
- [x] T022 [P] [US2] Wire list_tasks tool to OpenAI agent in backend/app/agent/chat_agent.py with function definition
- [x] T023 Create POST /api/chat endpoint in backend/app/routers/chat.py - accepts message, invokes agent, persists conversation
- [x] T024 Create GET /api/conversations endpoint in backend/app/routers/chat.py - lists user conversations
- [x] T025 [P] Create GET /api/conversations/{id} endpoint in backend/app/routers/chat.py - gets conversation with messages
- [x] T026 Register chat router in backend/app/main.py
- [x] T027 Create ChatPanel component in frontend/components/chat/chat-panel.tsx - message input, send button, message display
- [x] T028 [P] Create ChatMessage component in frontend/components/chat/chat-message.tsx - renders user/assistant messages differently
- [x] T029 Integrate ChatPanel into dashboard page in frontend/app/dashboard/page.tsx alongside TaskList
- [x] T030 [US1] Connect ChatPanel to POST /api/chat endpoint with JWT auth header
- [x] T031 [US2] Load conversation history on mount via GET /api/conversations/{id}

**Checkpoint**: Users can create tasks and list tasks via chat. MVP complete.

---

## Phase 4: User Story 3 - Complete Task via Chat (Priority: P2)

**Goal**: Users can mark tasks complete via chat ("Mark 'buy groceries' as done")

**Independent Test**: Create a task, then say "Complete 'buy groceries'" → verify task marked complete with confirmation.

### Implementation for User Story 3

- [x] T032 [US3] Implement complete_task MCP tool in backend/app/mcp/tools/complete_task.py - marks task complete by title or ID
- [x] T033 [US3] Register complete_task tool in backend/app/mcp/tools/__init__.py
- [x] T034 [US3] Wire complete_task tool to OpenAI agent in backend/app/agent/chat_agent.py with function definition
- [x] T035 [US3] Add error handling for task not found in complete_task tool

**Checkpoint**: Users can mark tasks complete via chat.

---

## Phase 5: User Story 4 - Delete Task via Chat (Priority: P2)

**Goal**: Users can delete tasks via chat ("Delete 'buy groceries'")

**Independent Test**: Create a task, then say "Delete 'buy groceries'" → verify task removed with confirmation.

### Implementation for User Story 4

- [x] T036 [US4] Implement delete_task MCP tool in backend/app/mcp/tools/delete_task.py - deletes task by title or ID
- [x] T037 [US4] Register delete_task tool in backend/app/mcp/tools/__init__.py
- [x] T038 [US4] Wire delete_task tool to OpenAI agent in backend/app/agent/chat_agent.py with function definition
- [x] T039 [US4] Add error handling for task not found in delete_task tool

**Checkpoint**: Users can delete tasks via chat.

---

## Phase 6: User Story 5 - Update Task via Chat (Priority: P3)

**Goal**: Users can update task titles via chat ("Rename 'buy groceries' to 'buy organic groceries'")

**Independent Test**: Create a task, then say "Rename 'buy groceries' to 'buy organic'" → verify title updated with confirmation.

### Implementation for User Story 5

- [x] T040 [US5] Implement update_task MCP tool in backend/app/mcp/tools/update_task.py - updates task title by old title or ID
- [x] T041 [US5] Register update_task tool in backend/app/mcp/tools/__init__.py
- [x] T042 [US5] Wire update_task tool to OpenAI agent in backend/app/agent/chat_agent.py with function definition
- [x] T043 [US5] Add error handling for task not found in update_task tool

**Checkpoint**: Users can update task titles via chat.

---

## Phase 7: User Story 6 - Conversation History Persistence (Priority: P3)

**Goal**: Conversation history persists and provides context for follow-ups

**Independent Test**: Send messages, refresh page → verify previous messages displayed. Send follow-up → verify AI has context.

### Implementation for User Story 6

- [x] T044 [US6] Implement conversation creation/retrieval logic in chat endpoint - create new or continue existing
- [x] T045 [US6] Store user messages in Message table with role="user" in backend/app/routers/chat.py
- [x] T046 [US6] Store AI responses in Message table with role="assistant" and tool_calls in backend/app/routers/chat.py
- [x] T047 [US6] Load last 20 messages as context for agent in backend/app/agent/chat_agent.py
- [x] T048 [US6] Display conversation history in ChatPanel on load in frontend/components/chat/chat-panel.tsx
- [x] T049 [US6] Add DELETE /api/conversations/{id} endpoint in backend/app/routers/chat.py

**Checkpoint**: Conversation history persists across sessions.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T050 Add loading state indicator in ChatPanel during AI processing
- [x] T051 [P] Add error state display in ChatPanel for failed requests
- [x] T052 [P] Add input validation for empty messages in ChatPanel
- [x] T053 Add scroll-to-bottom behavior when new messages arrive in ChatPanel
- [x] T054 Add agent system prompt for friendly, helpful responses in backend/app/agent/chat_agent.py
- [x] T055 [P] Handle edge case: ambiguous messages prompt clarification
- [x] T056 [P] Handle edge case: unrecognized commands provide helpful guidance
- [x] T057 Verify JWT authentication on all chat endpoints
- [x] T058 Verify user isolation - users can only access their own conversations and tasks
- [ ] T059 End-to-end manual testing of all CRUD operations via chat

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - US1 & US2 (Phase 3) can start after Foundational
  - US3 (Phase 4) can start after Phase 3 or in parallel
  - US4 (Phase 5) can start after Phase 3 or in parallel
  - US5 (Phase 6) can start after Phase 3 or in parallel
  - US6 (Phase 7) depends on chat endpoint from Phase 3
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 & 2 (P1)**: Can start after Foundational (Phase 2) - Core MVP
- **User Story 3 (P2)**: Can start after Foundational - No dependencies on US1/2 for implementation
- **User Story 4 (P2)**: Can start after Foundational - No dependencies on US1/2/3 for implementation
- **User Story 5 (P3)**: Can start after Foundational - No dependencies on US1-4 for implementation
- **User Story 6 (P3)**: Depends on chat endpoint from US1/2 phase

### Within Each Phase

- MCP tools can be implemented in parallel (different files)
- Backend before frontend for each feature
- Wire tools to agent after implementing tools
- Test after implementation

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- MCP tools (T018, T019, T032, T036, T040) can be implemented in parallel
- Frontend components (T027, T028) can be implemented in parallel
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: Phase 3 (MVP)

```bash
# Launch MCP tools in parallel:
Task T018: "Implement add_task MCP tool"
Task T019: "Implement list_tasks MCP tool"

# Launch frontend components in parallel:
Task T027: "Create ChatPanel component"
Task T028: "Create ChatMessage component"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Stories 1 & 2 (Create + List tasks via chat)
4. **STOP and VALIDATE**: Test MVP independently
5. Demo/deploy if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 & US2 → Test → Deploy/Demo (MVP!)
3. Add US3 (Complete) → Test → Deploy/Demo
4. Add US4 (Delete) → Test → Deploy/Demo
5. Add US5 (Update) → Test → Deploy/Demo
6. Add US6 (History) → Test → Deploy/Demo
7. Polish → Final testing → Release

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- MCP tools provide controlled interface between AI and database
- Agent is stateless - context loaded from database per request
- JWT authentication required for all chat endpoints
- User data isolation enforced at query level
