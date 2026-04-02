import { beforeEach, describe, expect, it } from "bun:test";
import { makeEntity } from "@roastery/beans/entity/factories";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { type BaristaCacheInstance, cache } from "@roastery-adapters/cache";
import { Post } from "@roastery-capsules/post.post/domain";
import type { IPost } from "@roastery-capsules/post.post/domain/types";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import { PostContent } from "@/domain";
import type { IPostContent } from "@/domain/types";
import { PostContentRepository as TestPostContentRepository } from "../test/post-content.repository";
import { PostContentRepository as CachedPostContentRepository } from "./post-content.repository";

const makePostType = () => PostType.make({ name: "Blog", schema: "{}" });

const makePost = (entityProps = makeEntity()): IPost =>
	Post.make(
		{
			name: "My Post",
			description: "A description",
			cover: "https://example.com/image.jpg",
			type: makePostType(),
			tags: [PostTag.make({ name: "TypeScript" })],
		},
		entityProps,
	);

const makePostContent = (
	post = makePost(),
	entityProps = makeEntity(),
): IPostContent =>
	PostContent.make(
		{ post, content: "# Hello World\nSome content here." },
		entityProps,
	);

const cacheKey = (postId: string) =>
	`${PostContent[EntitySource]}::post$${postId}`;

describe("CachedPostContentRepository", () => {
	let cacheInstance: BaristaCacheInstance;
	let innerRepository: TestPostContentRepository;
	let repository: CachedPostContentRepository;

	beforeEach(async () => {
		const app = cache({ CACHE_PROVIDER: "MEMORY" });
		cacheInstance = app.decorator.cache;
		await (
			cacheInstance as unknown as { flushall(): Promise<void> }
		).flushall();
		innerRepository = new TestPostContentRepository();
		repository = new CachedPostContentRepository(
			innerRepository,
			cacheInstance,
		);
	});

	describe("create", () => {
		it("should persist in the underlying repository", async () => {
			const postContent = makePostContent();

			await repository.create(postContent);

			expect(innerRepository.count()).toBe(1);
		});

		it("should cache the post content after creating", async () => {
			const postContent = makePostContent();

			await repository.create(postContent);

			const cached = await cacheInstance.get(cacheKey(postContent.post.id));
			expect(cached).not.toBeNull();
		});

		it("should allow findByPostId to return from cache after create", async () => {
			const postContent = makePostContent();
			await repository.create(postContent);

			innerRepository.clear();

			const result = await repository.findByPostId(postContent.post.id);
			expect(result).not.toBeNull();
			expect(result!.id).toBe(postContent.id);
		});
	});

	describe("findByPostId", () => {
		it("should return from repository on cache miss", async () => {
			const post = makePost();
			const postContent = makePostContent(post);
			innerRepository.seed([postContent]);

			const result = await repository.findByPostId(post.id);

			expect(result).not.toBeNull();
			expect(result!.id).toBe(postContent.id);
		});

		it("should cache the result after a repository fetch", async () => {
			const post = makePost();
			const postContent = makePostContent(post);
			innerRepository.seed([postContent]);

			await repository.findByPostId(post.id);

			const cached = await cacheInstance.get(cacheKey(post.id));
			expect(cached).not.toBeNull();
		});

		it("should return from cache on subsequent calls", async () => {
			const post = makePost();
			const postContent = makePostContent(post);
			innerRepository.seed([postContent]);

			await repository.findByPostId(post.id);
			innerRepository.clear();

			const result = await repository.findByPostId(post.id);
			expect(result).not.toBeNull();
			expect(result!.id).toBe(postContent.id);
		});

		it("should reconstruct the entity correctly from cache", async () => {
			const post = makePost();
			const postContent = makePostContent(post);
			innerRepository.seed([postContent]);

			await repository.findByPostId(post.id);
			innerRepository.clear();

			const result = await repository.findByPostId(post.id);
			expect(result!.content).toBe("# Hello World\nSome content here.");
			expect(result!.post.name).toBe("My Post");
			expect(result!.post.slug).toBe(post.slug);
		});

		it("should return null when not found in cache or repository", async () => {
			const result = await repository.findByPostId("non-existent");

			expect(result).toBeNull();
		});

		it("should not cache when the result is null", async () => {
			await repository.findByPostId("non-existent");

			const cached = await cacheInstance.get(cacheKey("non-existent"));
			expect(cached).toBeNull();
		});

		it("should isolate cache entries between different postIds", async () => {
			const post1 = makePost();
			const post2 = makePost();
			const content1 = makePostContent(post1);
			const content2 = PostContent.make(
				{ post: post2, content: "# Second Post" },
				makeEntity(),
			);
			innerRepository.seed([content1, content2]);

			await repository.findByPostId(post1.id);
			await repository.findByPostId(post2.id);
			innerRepository.clear();

			const result1 = await repository.findByPostId(post1.id);
			const result2 = await repository.findByPostId(post2.id);
			expect(result1!.id).toBe(content1.id);
			expect(result2!.id).toBe(content2.id);
		});
	});

	describe("update", () => {
		it("should persist the update in the underlying repository", async () => {
			const post = makePost();
			const entityProps = makeEntity();
			const postContent = makePostContent(post, entityProps);
			innerRepository.seed([postContent]);

			const updated = PostContent.make(
				{ post, content: "# Updated content" },
				entityProps,
			);
			await repository.update(updated);

			const result = await innerRepository.findByPostId(post.id);
			expect(result!.content).toBe("# Updated content");
		});

		it("should update the cached value", async () => {
			const post = makePost();
			const entityProps = makeEntity();
			const postContent = makePostContent(post, entityProps);
			await repository.create(postContent);

			const updated = PostContent.make(
				{ post, content: "# Updated content" },
				entityProps,
			);
			await repository.update(updated);

			innerRepository.clear();

			const result = await repository.findByPostId(post.id);
			expect(result!.content).toBe("# Updated content");
		});

		it("should invalidate stale cache before updating", async () => {
			const post = makePost();
			const entityProps = makeEntity();
			const postContent = makePostContent(post, entityProps);
			await repository.create(postContent);

			const updated = PostContent.make(
				{ post, content: "# New content" },
				entityProps,
			);
			await repository.update(updated);

			innerRepository.clear();

			const result = await repository.findByPostId(post.id);
			expect(result!.content).not.toBe("# Hello World\nSome content here.");
			expect(result!.content).toBe("# New content");
		});
	});
});
