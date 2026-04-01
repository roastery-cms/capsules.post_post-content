import { describe, expect, it } from "bun:test";
import { PostContentRepository } from "./post-content.repository";
import { PostContent } from "@/domain/post-content";
import { Post } from "@roastery-capsules/post.post/domain";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import { makeEntity } from "@roastery/beans/entity/factories";
import type { IPost } from "@roastery-capsules/post.post/domain/types";
import type { IPostContent } from "@/domain/types/post-content.interface";
import { ConflictException, ResourceNotFoundException } from "@roastery/terroir/exceptions/infra";

const makePostType = () =>
	PostType.make({ name: "Blog", schema: "{}" });

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

describe("PostContentRepository", () => {
	describe("create", () => {
		it("should add a post content", async () => {
			const repository = new PostContentRepository();
			const postContent = makePostContent();

			await repository.create(postContent);

			expect(repository.count()).toBe(1);
		});

		it("should throw ConflictException when creating with duplicate id", async () => {
			const repository = new PostContentRepository();
			const entityProps = makeEntity();
			const postContent = makePostContent(makePost(), entityProps);

			await repository.create(postContent);

			const duplicate = makePostContent(makePost(), entityProps);
			expect(repository.create(duplicate)).rejects.toBeInstanceOf(
				ConflictException,
			);
		});
	});

	describe("findByPostId", () => {
		it("should return the content for the given post id", async () => {
			const repository = new PostContentRepository();
			const postEntityProps = makeEntity();
			const post = makePost(postEntityProps);
			const postContent = makePostContent(post);

			repository.seed([postContent]);

			const result = await repository.findByPostId(postEntityProps.id);

			expect(result).toBe(postContent);
		});

		it("should return null when no content exists for the post id", async () => {
			const repository = new PostContentRepository();

			const result = await repository.findByPostId("non-existent");

			expect(result).toBeNull();
		});

		it("should return null after clearing the repository", async () => {
			const repository = new PostContentRepository();
			const postEntityProps = makeEntity();
			const post = makePost(postEntityProps);
			repository.seed([makePostContent(post)]);

			repository.clear();

			const result = await repository.findByPostId(postEntityProps.id);
			expect(result).toBeNull();
		});
	});

	describe("update", () => {
		it("should update an existing post content", async () => {
			const repository = new PostContentRepository();
			const post = makePost();
			const entityProps = makeEntity();
			const postContent = makePostContent(post, entityProps);

			repository.seed([postContent]);

			const updated = PostContent.make(
				{ post, content: "# Updated\nNew content." },
				entityProps,
			);

			await repository.update(updated);

			const result = await repository.findByPostId(post.id);
			expect(result?.content).toBe("# Updated\nNew content.");
		});

		it("should throw ResourceNotFoundException when updating a non-existent post content", () => {
			const repository = new PostContentRepository();
			const postContent = makePostContent();

			expect(repository.update(postContent)).rejects.toBeInstanceOf(
				ResourceNotFoundException,
			);
		});
	});

	describe("seed", () => {
		it("should add multiple post contents", () => {
			const repository = new PostContentRepository();

			repository.seed([makePostContent(), makePostContent(), makePostContent()]);

			expect(repository.count()).toBe(3);
		});
	});

	describe("clear", () => {
		it("should remove all post contents", () => {
			const repository = new PostContentRepository();
			repository.seed([makePostContent(), makePostContent()]);

			repository.clear();

			expect(repository.count()).toBe(0);
		});
	});

	describe("getAll", () => {
		it("should return all seeded post contents", () => {
			const repository = new PostContentRepository();
			repository.seed([makePostContent(), makePostContent()]);

			expect(repository.getAll()).toHaveLength(2);
		});

		it("should return an empty array when repository is empty", () => {
			const repository = new PostContentRepository();

			expect(repository.getAll()).toEqual([]);
		});
	});

	describe("count", () => {
		it("should return 0 for an empty repository", () => {
			const repository = new PostContentRepository();

			expect(repository.count()).toBe(0);
		});

		it("should return the number of stored post contents", () => {
			const repository = new PostContentRepository();
			repository.seed([makePostContent(), makePostContent()]);

			expect(repository.count()).toBe(2);
		});
	});
});
