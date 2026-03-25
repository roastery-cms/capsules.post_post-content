# @roastery-capsules/post.post-tag

Post tag management capsule for the [Roastery CMS](https://github.com/roastery-cms) ecosystem.

[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

## Overview

**@roastery-capsules/post.post-tag** is an [Elysia](https://elysiajs.com) capsule that provides full CRUD management for post tags, including automatic slug generation, uniqueness validation, pagination, and optional Redis caching.

It exposes `PostTagRoutes`, an Elysia plugin ready to be mounted in your application, with the following endpoints:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/post-tags/` | Required | Create a new tag |
| `GET` | `/post-tags/` | Public | List tags (paginated) |
| `GET` | `/post-tags/:id-or-slug` | Public | Get tag by ID or slug |
| `PATCH` | `/post-tags/:id-or-slug` | Required | Update a tag |

## Technologies

| Tool | Purpose |
|------|---------|
| [Elysia](https://elysiajs.com) | HTTP framework and plugin target |
| [@roastery/barista](https://github.com/roastery-cms) | Elysia application factory |
| [@roastery/terroir](https://github.com/roastery-cms) | Runtime schema validation and exception handling |
| [@roastery/beans](https://github.com/roastery-cms) | Domain entity base class |
| [@roastery/seedbed](https://github.com/roastery-cms) | Repository and use-case contracts |
| [@roastery-adapters/post](https://github.com/roastery-cms) | Prisma post tag repository adapter |
| [@roastery-adapters/cache](https://github.com/roastery-cms) | Redis caching adapter |
| [@roastery-capsules/auth](https://github.com/roastery-cms) | Authentication plugin |
| [Prisma](https://www.prisma.io) | ORM for data persistence |
| [tsup](https://tsup.egoist.dev) | Bundling to ESM + CJS with `.d.ts` generation |
| [Bun](https://bun.sh) | Runtime, test runner, and package manager |
| [Knip](https://knip.dev) | Unused exports and dependency detection |
| [Husky](https://typicode.github.io/husky) + [commitlint](https://commitlint.js.org) | Git hooks and conventional commit enforcement |

## Installation

```bash
bun add @roastery-capsules/post.post-tag
```

**Peer dependencies** (install alongside):

```bash
bun add @types/bun tsup typescript
```

---

## Usage

```typescript
import { Elysia } from 'elysia';
import { PostTagRoutes } from '@roastery-capsules/post.post-tag/presentation';

const app = new Elysia()
  .use(PostTagRoutes())
  .listen(3000);
```

### Tag entity

Each `PostTag` has the following properties:

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Display name |
| `slug` | `string` | URL-friendly identifier (auto-generated if omitted) |
| `hidden` | `boolean` | Visibility flag (default: `false`) |

### Creating a tag

```http
POST /post-tags/
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "TypeScript",
  "slug": "typescript",   // optional — auto-generated from name if omitted
  "hidden": false         // optional
}
```

### Listing tags

```http
GET /post-tags/?page=1&limit=10
```

### Getting a tag by ID or slug

```http
GET /post-tags/typescript
GET /post-tags/<uuid>
```

### Updating a tag

```http
PATCH /post-tags/typescript
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "TypeScript 5",
  "hidden": true
}
```

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
