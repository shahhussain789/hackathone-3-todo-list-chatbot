---
id: 002
title: AI Chatbot Constitution Amendment
stage: constitution
date: 2026-01-18
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: main
user: user
command: /sp.constitution
labels: ["constitution", "ai-chatbot", "mcp-tools", "architecture"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (constitution update - no code tests)
---

## Prompt

/sp.constitution

Project: Todo AI Chatbot

Core principles:
- Accuracy: AI actions must correctly reflect user intent
- Clarity: Responses must be understandable and friendly
- Statelessness: Server holds no in-memory state between requests
- Reproducibility: Conversation history persisted in database for replay
- Security: Authentication and user isolation enforced at all layers
- Modularity: AI agent interacts only via MCP tools

Key standards:
- All task operations must be performed through MCP tools
- Conversation and message history stored in database
- Frontend ChatKit interface must display messages in real time
- Friendly confirmations provided for every action
- Graceful error handling for invalid or missing tasks
- Compliance with Better Auth + JWT authentication

Constraints:
- Backend: Python FastAPI, OpenAI Agents SDK, Official MCP SDK
- Frontend: OpenAI ChatKit
- Database: Neon Serverless PostgreSQL
- ORM: SQLModel
- All endpoints stateless; server holds no session memory
- Environment variable

## Response snapshot

Updated constitution from v1.0.0 to v2.0.0 (MAJOR version bump) reflecting architectural shift from "Todo Full-Stack Web Application" to "Todo AI Chatbot" paradigm.

Key changes:
1. Renamed project to "Todo AI Chatbot Constitution"
2. Replaced 7 principles with 6 AI-focused principles: Accuracy, Clarity, Statelessness, Reproducibility, Security, Modularity
3. Updated technology stack to include OpenAI Agents SDK, MCP SDK, and ChatKit
4. Added MCP Tool Requirements section defining required tools (list_tasks, create_task, get_task, update_task, delete_task, complete_task)
5. Added AI Response Standards for friendly, clear communication
6. Updated Success Criteria for AI chatbot context

## Outcome

- ✅ Impact: MAJOR - Fundamental architectural shift to AI chatbot paradigm with MCP tools
- 🧪 Tests: N/A (constitution update)
- 📁 Files: 1 file modified (.specify/memory/constitution.md)
- 🔁 Next prompts: /sp.specify for AI chatbot feature, /sp.plan for implementation design
- 🧠 Reflection: Constitution successfully updated to reflect AI-first architecture with clear principles for accuracy, clarity, statelessness, reproducibility, security, and modularity via MCP tools

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS - All placeholders filled, version incremented correctly, sync impact report complete
- Prompt variant (if applicable): N/A
- Next experiment: Implement MCP tools according to new constitution requirements
