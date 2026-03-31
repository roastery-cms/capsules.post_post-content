import { describe, expect, it } from "bun:test";
import { PostRepository } from "./post.repository";
import { Post } from "@roastery-capsules/post.post/domain";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import { makeEntity } from "@roastery/beans/entity/factories";
import type { IPost } from "@roastery-capsules/post.post/domain/types";

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

describe("PostRepository", () => {
	describe("findById", () => {
		it("should return the post when it exists", async () => {
			const repository = new PostRepository();
			const entityProps = makeEntity();
			const post = makePost(entityProps);

			repository.seed([post]);

			const result = await repository.findById(entityProps.id);

			expect(result).toBe(post);
		});

		it("should return null when the post does not exist", async () => {
			const repository = new PostRepository();

			const result = await repository.findById("non-existent");

			expect(result).toBeNull();
		});

		it("should return null after clearing the repository", async () => {
			const repository = new PostRepository();
			const entityProps = makeEntity();
			repository.seed([makePost(entityProps)]);

			repository.clear();

			const result = await repository.findById(entityProps.id);
			expect(result).toBeNull();
		});
	});

	describe("seed", () => {
		it("should add multiple posts", () => {
			const repository = new PostRepository();
			const posts = [makePost(), makePost(), makePost()];

			repository.seed(posts);

			expect(repository.count()).toBe(3);
		});

		it("should overwrite a post with the same id", async () => {
			const repository = new PostRepository();
			const entityProps = makeEntity();
			const original = makePost(entityProps);
			const updated = Post.make(
				{
					name: "Updated Post",
					description: "Updated description",
					cover: "https://example.com/updated.jpg",
					type: makePostType(),
					tags: [],
				},
				entityProps,
			);

			repository.seed([original]);
			repository.seed([updated]);

			const result = await repository.findById(entityProps.id);
			expect(result?.name).toBe("Updated Post");
			expect(repository.count()).toBe(1);
		});
	});

	describe("clear", () => {
		it("should remove all posts", () => {
			const repository = new PostRepository();
			repository.seed([makePost(), makePost()]);

			repository.clear();

			expect(repository.count()).toBe(0);
		});
	});

	describe("getAll", () => {
		it("should return all seeded posts", () => {
			const repository = new PostRepository();
			const posts = [makePost(), makePost()];

			repository.seed(posts);

			const result = repository.getAll();
			expect(result).toHaveLength(2);
		});

		it("should return an empty array when repository is empty", () => {
			const repository = new PostRepository();

			expect(repository.getAll()).toEqual([]);
		});
	});

	describe("count", () => {
		it("should return 0 for an empty repository", () => {
			const repository = new PostRepository();

			expect(repository.count()).toBe(0);
		});

		it("should return the number of seeded posts", () => {
			const repository = new PostRepository();
			repository.seed([makePost(), makePost()]);

			expect(repository.count()).toBe(2);
		});
	});
});
