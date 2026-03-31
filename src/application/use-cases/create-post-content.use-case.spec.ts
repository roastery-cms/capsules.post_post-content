import { describe, expect, it } from "bun:test";
import { CreatePostContentUseCase } from "./create-post-content.use-case";
import { PostContentUniquenessCheckerService, FindPostService } from "../services";
import { PostContentRepository } from "@/infra/repositories/test/post-content.repository";
import { PostRepository } from "@/infra/repositories/test/post.repository";
import { PostContent } from "@/domain/post-content";
import { Post } from "@roastery-capsules/post.post/domain";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import { makeEntity } from "@roastery/beans/entity/factories";
import { ResourceAlreadyExistsException, ResourceNotFoundException } from "@roastery/terroir/exceptions/application";

const makePostType = () =>
	PostType.make({ name: "Blog", schema: "{}" });

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
	const postContentRepository = new PostContentRepository();
	const postRepository = new PostRepository();
	const uniquenessChecker = new PostContentUniquenessCheckerService(postContentRepository);
	const findPost = new FindPostService(postRepository);
	const useCase = new CreatePostContentUseCase(postContentRepository, uniquenessChecker, findPost);

	return { useCase, postContentRepository, postRepository };
};

describe("CreatePostContentUseCase", () => {
	it("should create a post content and persist it", async () => {
		const { useCase, postRepository, postContentRepository } = makeUseCase();
		const postEntityProps = makeEntity();
		const post = makePost(postEntityProps);
		postRepository.seed([post]);

		const result = await useCase.run({
			postId: postEntityProps.id,
			content: "# Hello\nSome content.",
			info: "{}",
		});

		expect(result).toBeDefined();
		expect(result.post).toBe(post);
		expect(result.content).toBe("# Hello\nSome content.");
		expect(postContentRepository.count()).toBe(1);
	});

	it("should throw ResourceNotFoundException when the post does not exist", () => {
		const { useCase } = makeUseCase();

		expect(
			useCase.run({
				postId: "non-existent",
				content: "# Hello",
				info: "{}",
			}),
		).rejects.toBeInstanceOf(ResourceNotFoundException);
	});

	it("should throw ResourceAlreadyExistsException when content already exists for the post", async () => {
		const { useCase, postRepository, postContentRepository } = makeUseCase();
		const postEntityProps = makeEntity();
		const post = makePost(postEntityProps);
		postRepository.seed([post]);

		const existingContent = PostContent.make({
			post,
			content: "# Existing content",
		});
		postContentRepository.seed([existingContent]);

		expect(
			useCase.run({
				postId: postEntityProps.id,
				content: "# Duplicate",
				info: "{}",
			}),
		).rejects.toBeInstanceOf(ResourceAlreadyExistsException);
	});
});
