# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2026-04-02

### Added

#### Domain

- `PostContent` entity with `content` (Markdown body) and `info` (JSON metadata validated against the post type schema)
- `ValidInfoVO` value object for schema-based validation of the `info` field
- `UnpackedPostContentSchema` composite schema combining entity and DTO properties
- Repository interfaces: `IPostContentRepository` (composite), `IPostContentReader`, `IPostContentWriter`, and `IPostRepository`

#### Application

- `CreatePostContentDTO` with validation for `postId` (UUID), `content` (non-empty string), and `info` (JSON string)
- `UpdatePostContentDTO` with optional `content` and `info` fields for partial updates
- `FindPostService` to validate post existence before content operations
- `PostContentUniquenessCheckerService` to enforce one-to-one relationship between `Post` and `PostContent`
- `CreatePostContentUseCase` orchestrating post lookup, uniqueness check, and content creation
- `FindPostContentByPostIdUseCase` for retrieving content by post ID
- `UpdatePostContentByPostIdUseCase` for partial content updates

#### Infrastructure

- Prisma repository with `@SafePrisma` decorator, supporting `create`, `update`, and `findByPostId` (with full post/tags/type joins)
- Cached repository (decorator pattern) with Redis caching and automatic cache invalidation on writes
- In-memory test repositories for `PostContent` and `Post` with `seed`/`clear` utilities
- API post repository using Elysia `treaty` client for cross-capsule post lookups
- `PrismaPostContentMapper`, `CachedPostContentMapper`, and `ApiPostMapper` for data transformation across layers
- Repository factories (`makePostContentRepository`, `makePostRepository`) with strategy selection via `DATABASE_PROVIDER` and `POST_BASE_URL`
- Application factories for all use cases and services
- `PostContentDependenciesDTO` for environment variable validation (`DATABASE_URL`, `DATABASE_PROVIDER`, `POST_BASE_URL`)

#### Presentation

- `POST /post-contents/` — create post content (authenticated)
- `GET /post-contents/:postId` — find post content by post ID (public)
- `PATCH /post-contents/:postId` — update post content by post ID (authenticated)
- `PostContentRepositoryPlugin` for dependency injection into controllers
- `PostContentRoutes` grouping all endpoints under `/post-contents` prefix
- `PostContentTags` for API documentation
- Bootstrap server integrating `post.post-tag`, `post.post-type`, and `post.post-content` capsules with environment-based repository strategy, cache adapter, auth, error handling, and Swagger docs
