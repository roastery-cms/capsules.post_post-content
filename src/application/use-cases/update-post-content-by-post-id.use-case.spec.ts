import { describe, expect, it } from "bun:test";
import { makeEntity } from "@roastery/beans/entity/factories";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";
import { Post } from "@roastery-capsules/post.post/domain";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import { PostContent } from "@/domain/post-content";
import { PostContentRepository } from "@/infra/repositories/test/post-content.repository";
import { FindPostContentByPostIdUseCase } from "./find-post-content-by-post-id.use-case";
import { UpdatePostContentByPostIdUseCase } from "./update-post-content-by-post-id.use-case";

const makePostType = () => PostType.make({ name: "Blog", schema: "{}" });

const makePost = (entityProps = makeEntity()) =>
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

const makeUseCase = () => {
	const repository = new PostContentRepository();
	const findPostContent = new FindPostContentByPostIdUseCase(repository);
	const useCase = new UpdatePostContentByPostIdUseCase(
		repository,
		findPostContent,
	);

	return { useCase, repository };
};

describe("UpdatePostContentByPostIdUseCase", () => {
	it("should update the content", async () => {
		const { useCase, repository } = makeUseCase();
		const postEntityProps = makeEntity();
		const post = makePost(postEntityProps);
		const postContent = PostContent.make({
			post,
			content: "# Original",
		});
		repository.seed([postContent]);

		const result = await useCase.run(postEntityProps.id, {
			content: "# Updated\nNew content.",
		});

		expect(result.content).toBe("# Updated\nNew content.");
	});

	it("should update the info", async () => {
		const { useCase, repository } = makeUseCase();
		const postEntityProps = makeEntity();
		const post = makePost(postEntityProps);
		const postContent = PostContent.make({
			post,
			content: "# Hello",
		});
		repository.seed([postContent]);

		const result = await useCase.run(postEntityProps.id, {
			info: "{}",
		});

		expect(result.info).toBe("{}");
	});

	it("should update both content and info", async () => {
		const { useCase, repository } = makeUseCase();
		const postEntityProps = makeEntity();
		const post = makePost(postEntityProps);
		const postContent = PostContent.make({
			post,
			content: "# Original",
		});
		repository.seed([postContent]);

		const result = await useCase.run(postEntityProps.id, {
			content: "# Updated",
			info: "{}",
		});

		expect(result.content).toBe("# Updated");
		expect(result.info).toBe("{}");
	});

	it("should persist the updated post content", async () => {
		const { useCase, repository } = makeUseCase();
		const postEntityProps = makeEntity();
		const post = makePost(postEntityProps);
		const postContent = PostContent.make({
			post,
			content: "# Original",
		});
		repository.seed([postContent]);

		await useCase.run(postEntityProps.id, { content: "# Persisted" });

		const persisted = await repository.findByPostId(postEntityProps.id);
		expect(persisted?.content).toBe("# Persisted");
	});

	it("should throw ResourceNotFoundException when no content exists for the post id", () => {
		const { useCase } = makeUseCase();

		expect(
			useCase.run("non-existent", { content: "# Nope" }),
		).rejects.toBeInstanceOf(ResourceNotFoundException);
	});
});
