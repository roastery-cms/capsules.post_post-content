# @roastery-capsules/post.post-content

Post content management capsule for the [Roastery CMS](https://github.com/roastery-cms) ecosystem.

[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

## Overview

**@roastery-capsules/post.post-content** is an [Elysia](https://elysiajs.com) capsule that manages the rich content associated with a post — a Markdown body and a JSON metadata field (`info`) validated at runtime against the post type's schema.

Each post has at most one content record (one-to-one relationship), and uniqueness is enforced on creation.

It exposes `PostContentRoutes`, an Elysia plugin ready to be mounted in your application, with the following endpoints:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/post-contents/` | Required | Create content for a post |
| `GET` | `/post-contents/:postId` | Public | Get content by post ID |
| `PATCH` | `/post-contents/:postId` | Required | Update content of a post |

## Technologies

| Tool | Purpose |
|------|---------|
| [Elysia](https://elysiajs.com) | HTTP framework and plugin target |
| [@roastery/barista](https://github.com/roastery-cms) | Elysia application factory |
| [@roastery/terroir](https://github.com/roastery-cms) | Runtime schema validation and exception handling |
| [@roastery/beans](https://github.com/roastery-cms) | Domain entity base class |
| [@roastery/seedbed](https://github.com/roastery-cms) | Repository and use-case contracts |
| [@roastery-adapters/post](https://github.com/roastery-cms) | Prisma post content repository adapter |
| [@roastery-adapters/cache](https://github.com/roastery-cms) | Redis caching adapter |
| [@roastery-capsules/auth](https://github.com/roastery-cms) | Authentication plugin |
| [@elysiajs/eden](https://elysiajs.com/eden/overview) | Type-safe cross-capsule API client |
| [Prisma](https://www.prisma.io) | ORM for data persistence |
| [tsup](https://tsup.egoist.dev) | Bundling to ESM + CJS with `.d.ts` generation |
| [Bun](https://bun.sh) | Runtime, test runner, and package manager |
| [Knip](https://knip.dev) | Unused exports and dependency detection |
| [Husky](https://typicode.github.io/husky) + [commitlint](https://commitlint.js.org) | Git hooks and conventional commit enforcement |

## Installation

```bash
bun add @roastery-capsules/post.post-content
```

**Peer dependencies** (install alongside):

```bash
bun add @types/bun tsup typescript
```

---

## Usage

```typescript
import { Elysia } from 'elysia';
import { PostContentRoutes } from '@roastery-capsules/post.post-content/presentation';

const app = new Elysia()
  .use(PostContentRoutes({ /* repositories */ }))
  .listen(3000);
```

### PostContent entity

Each `PostContent` has the following properties:

| Field | Type | Description |
|-------|------|-------------|
| `post` | `IPost` | Reference to the parent post |
| `content` | `string` | Body content, typically Markdown |
| `info` | `string` | JSON metadata validated against the post type schema |

### Creating content

```http
POST /post-contents/
Content-Type: application/json
Authorization: Bearer <token>

{
  "postId": "<uuid>",
  "content": "# Hello World\n\nThis is my first post.",
  "info": "{\"key\": \"value\"}"
}
```

### Getting content by post ID

```http
GET /post-contents/<postId>
```

### Updating content

```http
PATCH /post-contents/<postId>
Content-Type: application/json
Authorization: Bearer <token>

{
  "content": "# Updated content",
  "info": "{\"key\": \"new-value\"}"
}
```

Both `content` and `info` are optional on update — send only the fields you want to change.

---

## Development

```bash
# Run tests
bun run test:unit

# Run tests with coverage
bun run test:coverage

# Build for distribution
bun run build

# Check for unused exports and dependencies
bun run knip

# Full setup (build + bun link)
bun run setup
```

## License

MIT
