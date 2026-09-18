# DevRoom

DevRoom is a real-time collaborative developer workspace built as a learning project around **WebSockets, WebRTC, NestJS, TypeScript, and distributed systems**.

The goal is not just to build a working application, but to understand the architecture and engineering decisions behind a real-time collaborative system.

---

## Current Status

**Milestone: Real-time room collaboration foundation**

Currently implemented:

- JWT authentication
- PostgreSQL persistence with Prisma
- Room membership and roles
- WebSocket authentication with Socket.IO
- Room joining
- Online presence
- Persistent chat history
- Real-time chat messaging
- Chat acknowledgements
- Shared TypeScript event types
- Responsive application shell
- Room navigation
- Participant list
- Real-time chat UI

The current system supports multiple users joining the same room and seeing chat messages and presence changes in real time.

---

## Architecture

```text
                    ┌──────────────────────┐
                    │      Next.js         │
                    │      Frontend        │
                    │   localhost:3000     │
                    └──────────┬───────────┘
                               │
                    HTTP + WebSocket
                               │
                               ▼
                    ┌──────────────────────┐
                    │       NestJS         │
                    │       Backend        │
                    │   localhost:4000     │
                    └───────┬───────┬──────┘
                            │       │
                    ┌───────┘       └────────┐
                    ▼                        ▼
             ┌─────────────┐          ┌─────────────┐
             │ PostgreSQL  │          │    Redis    │
             │   5432      │          │    6379     │
             └─────────────┘          └─────────────┘
```

### Responsibilities

#### Next.js

The frontend is responsible for:

- Rendering the UI
- Authentication state
- Room navigation
- HTTP API calls
- WebSocket client connection
- Chat UI
- Presence UI
- Future editor and WebRTC interfaces

Next.js does **not** own WebSocket business logic or WebRTC signaling.

#### NestJS

NestJS is the backend source of truth for:

- Authentication
- Authorization
- Room membership
- Persistent data
- Chat messages
- WebSocket events
- Presence coordination
- Future WebRTC signaling
- Distributed realtime coordination

#### PostgreSQL

PostgreSQL stores persistent application state:

- Users
- Rooms
- Room memberships
- Messages

#### Redis

Redis is planned for:

- Cross-instance WebSocket coordination
- Distributed presence
- Ephemeral realtime state
- Rate limiting
- Horizontal scaling

Redis is currently configured locally but distributed realtime coordination has not yet been implemented.

---

## Technology Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Socket.IO Client

### Backend

- NestJS 11
- TypeScript
- Socket.IO
- JWT
- Argon2

### Data

- PostgreSQL 17
- Prisma 6
- Redis 8

### Infrastructure

- Docker Compose
- NGINX — planned
- TURN server — planned

---

## Local Development

### Prerequisites

Install:

- Node.js
- npm
- Docker Desktop

---

## Start Infrastructure

From the repository root:

```bash
docker compose up -d
```

This starts:

```text
PostgreSQL → localhost:5432
Redis      → localhost:6379
```

---

## Environment Variables

The API uses environment variables similar to:

```env
PORT=4000

DATABASE_URL=postgresql://devroom:devroom_dev_password@localhost:5432/devroom

REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=devroom_local_development_secret_2026_change_me

JWT_ACCESS_EXPIRES_IN=15m
```

Do not commit real secrets to the repository.

---

## Install Dependencies

From the repository root:

```bash
npm install
```

The repository uses npm workspaces.

---

## Run the Frontend

```bash
npm run dev:web
```

Frontend:

```text
http://localhost:3000
```

---

## Run the Backend

```bash
npm run dev:api
```

Backend:

```text
http://localhost:4000
```

API prefix:

```text
/api/v1
```

Health check:

```text
GET /api/v1/health
```

---

# Current Features

## Authentication

The application currently supports:

- Registration
- Login
- JWT access tokens
- Authenticated HTTP requests
- Authenticated WebSocket connections
- Logout
- Restoring authentication state from local storage

Password hashing uses Argon2.

JWT authentication is handled with a custom NestJS guard rather than Passport.js to keep the authentication flow explicit while learning.

---

## Rooms

Rooms are persisted in PostgreSQL.

A room contains:

```text
Room
 ├── owner
 ├── members
 └── messages
```

Room membership uses a join model:

```text
RoomMember
```

Current roles:

```text
OWNER
ADMIN
MEMBER
```

The owner is also represented as a room member with the `OWNER` role.

Duplicate memberships are prevented with:

```text
(roomId, userId)
```

as a unique constraint.

---

## WebSocket Authentication

The frontend creates one global Socket.IO connection through `WebSocketProvider`.

The JWT is passed during the Socket.IO handshake:

```text
Client
  │
  │ auth.token
  ▼
NestJS Gateway
  │
  ├── verify JWT
  │
  ├── reject invalid connection
  │
  └── attach user to socket.data
```

The authenticated user is then available to WebSocket handlers.

This is intentionally different from HTTP authentication because the initial WebSocket connection is a Socket.IO lifecycle event rather than a normal controller request.

---

# Realtime Event Model

DevRoom uses an event envelope for realtime communication.

## Client Event

```ts
interface ClientEvent<TPayload = unknown> {
  type: string;
  requestId: string;
  timestamp: number;
  payload: TPayload;
}
```

Example:

```json
{
  "type": "chat.send",
  "requestId": "uuid",
  "timestamp": 1750000000000,
  "payload": {
    "roomId": "room-id",
    "content": "Hello"
  }
}
```

## Server Event

```ts
interface ServerEvent<TPayload = unknown> {
  type: string;
  eventId: string;
  timestamp: number;
  payload: TPayload;
}
```

## Acknowledgement

```ts
interface AckEvent<TPayload = unknown> {
  type: string;
  requestId: string;
  timestamp: number;
  payload: TPayload;
}
```

The `requestId` allows a client request to be correlated with its acknowledgement.

---

# Chat Flow

Chat currently uses both HTTP and WebSockets.

### Loading history

Persistent messages are loaded through HTTP:

```text
GET /api/v1/rooms/:roomId/messages
```

The backend reads the messages from PostgreSQL.

### Sending a message

```text
Browser
   │
   │ chat.send
   ▼
NestJS Gateway
   │
   ├── verify authenticated user
   │
   ├── verify room membership
   │
   ├── persist message
   │
   ├── send chat.send.ack
   │
   └── broadcast chat.message
              │
              ▼
       All room members
```

The acknowledgement contains only the message ID:

```json
{
  "messageId": "..."
}
```

The canonical message is delivered through:

```text
chat.message
```

This keeps the distinction clear:

```text
ACK
→ request was processed

chat.message
→ canonical domain event
```

The sender also receives `chat.message`, so the frontend does not need a separate optimistic message representation.

Duplicate messages are prevented on the frontend using the message ID.

---

# Chat Pagination

Chat history uses cursor-based pagination.

The cursor is based on:

```text
createdAt + id
```

rather than UUID ordering.

This is important because UUIDs are identifiers, not chronological values.

The query can be extended with:

```text
?limit=50&before=<messageId>
```

The backend orders messages by:

```text
createdAt DESC
id DESC
```

This provides deterministic ordering even when multiple messages have the same timestamp.

---

# Presence

Presence is currently maintained in memory by the NestJS process.

The conceptual structure is:

```text
roomId:userId
        │
        ├── username
        ├── socketIds
        └── lastSeenAt
```

A user can have multiple sockets.

For example:

```text
User A
 ├── laptop socket
 └── browser socket
```

The user is considered online while at least one socket remains connected.

This avoids incorrectly marking a user offline when one of their multiple connections disconnects.

Current presence events:

```text
presence.snapshot
presence.changed
```

`presence.snapshot` provides the initial state after joining a room.

`presence.changed` communicates online/offline transitions.

Redis will eventually replace the process-local presence state so presence can work correctly across multiple backend instances.

---

# Database Model

Current core models:

```text
User
 │
 ├── RoomMember
 │        │
 │        └── Room
 │             │
 │             └── Message
 │
 └── Message
```

### User

```text
id
email
username
passwordHash
avatarUrl
createdAt
updatedAt
```

### Room

```text
id
name
ownerId
createdAt
updatedAt
```

### RoomMember

```text
id
roomId
userId
role
joinedAt
```

### Message

```text
id
roomId
senderId
content
createdAt
```

---

# Frontend Structure

The frontend is organized around features and shared components.

```text
apps/web/
├── app/
├── components/
│   ├── layout/
│   ├── room/
│   └── ui/
├── features/
│   ├── chat/
│   ├── presence/
│   └── room/
├── hooks/
├── lib/
└── providers/
```

Important responsibilities:

```text
providers/
    AuthProvider
    WebSocketProvider

hooks/
    useRoomRealtime

features/chat/
    chat.api
    chat.types
    ChatPanel

features/presence/
    presence.types
    PresenceList

features/room/
    room.api
    room.types
    RoomList
```

`WebSocketProvider` owns the global Socket.IO connection.

Room-specific hooks subscribe to the events they need.

---

# Backend Structure

```text
apps/api/src/
├── auth/
├── users/
├── database/
├── health/
├── rooms/
├── chat/
└── realtime/
    └── presence/
```

The separation is intentional:

```text
Rooms
→ room persistence and membership

Chat
→ message persistence

Realtime
→ WebSocket transport and realtime coordination

Presence
→ online user state
```

---

# Design Principles

## Backend is the source of truth

The frontend never decides whether a user is allowed to perform a protected action.

For example:

```text
Client says:
"Join room X"

Backend checks:
"Is this authenticated user a member of room X?"
```

Only after authorization does the backend allow the action.

---

## HTTP for persistent state

HTTP is currently used for operations such as:

```text
Login
Register
Load rooms
Load chat history
```

These operations represent persistent resources and do not inherently require realtime transport.

---

## WebSockets for realtime state

WebSockets are used for:

```text
Room joining
Presence
Realtime chat
Acknowledgements
Future collaboration events
```

---

## WebRTC for media

WebRTC will eventually handle:

```text
Audio
Video
Screen sharing
```

WebRTC media itself should remain peer-to-peer where possible.

The NestJS server will handle signaling rather than transporting the media stream.

---

# Planned Features

## Developer Workspace

Planned:

- Code editor
- Shared files
- Terminal
- Activity feed

## WebRTC

Planned:

- Audio
- Video
- Participant media state
- Screen sharing
- WebRTC signaling
- STUN/TURN configuration

## Distributed Systems

Planned:

- Redis Socket.IO adapter
- Multi-instance WebSocket support
- Distributed presence
- Rate limiting
- Ephemeral state
- Realtime coordination across instances

## Infrastructure

Planned:

```text
                 ┌─────────────┐
                 │    NGINX    │
                 └──────┬──────┘
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
        NestJS instance 1   NestJS instance 2
              │                   │
              └─────────┬─────────┘
                        │
                       Redis
                        │
                    PostgreSQL
```

---

# Learning Goals

DevRoom is intentionally being built incrementally.

The project is designed to provide hands-on understanding of:

### WebSockets

- Connection lifecycle
- Authentication
- Events
- Rooms
- Broadcast semantics
- Acknowledgements
- Error handling
- Presence

### NestJS

- Modules
- Controllers
- Services
- Guards
- Gateways
- DTO validation
- Exception filters
- Dependency injection

### TypeScript

- Shared types
- Event envelopes
- Payload contracts
- API types
- Frontend/backend boundaries

### PostgreSQL and Prisma

- Relational modeling
- Join tables
- Constraints
- Indexes
- Cascading deletes
- Cursor pagination

### WebRTC

- Signaling
- Peer connections
- ICE candidates
- SDP
- STUN/TURN
- Media streams

### Distributed Systems

- Redis
- Horizontal scaling
- Shared state
- Pub/sub
- Connection coordination
- Rate limiting
- Failure scenarios

---

# Development Philosophy

The project intentionally favors:

1. **Understanding before abstraction**
2. **Small incremental changes**
3. **Explicit authorization logic**
4. **Clear frontend/backend boundaries**
5. **Persistent state separated from ephemeral state**
6. **Realtime events treated as contracts**
7. **Learning distributed-system concepts by gradually introducing complexity**

The architecture will become more sophisticated as the application gains features rather than introducing distributed infrastructure prematurely.

---

# Milestone History

## Milestone 1 — Foundation

- Monorepo
- Next.js frontend
- NestJS backend
- PostgreSQL
- Redis
- Docker Compose

## Milestone 2 — Authentication

- User registration
- Login
- Argon2 password hashing
- JWT authentication
- HTTP auth guard

## Milestone 3 — Rooms

- Room persistence
- Room membership
- Roles
- Room listing
- Authorization checks

## Milestone 4 — Realtime Foundation

- Socket.IO
- JWT WebSocket authentication
- Room joining
- Event envelopes
- WebSocket exception handling

## Milestone 5 — Realtime Chat and Presence

- Persistent chat history
- Realtime chat
- Message acknowledgements
- Presence snapshots
- Presence changes
- Responsive room workspace
- Chat and participant UI

## Next Milestone

- Chat reliability improvements
- Automatic scroll-to-new-message behavior
- Typing indicators
- Improved realtime error handling
- Then continue toward the collaborative developer workspace

---

# Useful Commands

```bash
# Start infrastructure
docker compose up -d

# Stop infrastructure
docker compose down

# Start frontend
npm run dev:web

# Start backend
npm run dev:api

# Build all workspaces
npm run build

# Typecheck all workspaces
npm run typecheck

# Lint all workspaces
npm run lint
```

---

# Project Status

DevRoom is an active learning project.

The current milestone establishes the first complete realtime vertical slice:

```text
Authentication
      ↓
Room authorization
      ↓
WebSocket connection
      ↓
Room presence
      ↓
Persistent chat
      ↓
Realtime message broadcast
      ↓
Responsive frontend UI
```

The next major architectural step is moving from a single-process realtime system toward a distributed one using Redis, followed by WebRTC and collaborative developer tooling.
