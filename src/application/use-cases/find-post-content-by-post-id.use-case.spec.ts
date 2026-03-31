import { describe, expect, it } from "bun:test";
import { FindPostContentByPostIdUseCase } from "./find-post-content-by-post-id.use-case";
import { PostContentRepository } from "@/infra/repositories/test/post-content.repository";
import { PostContent } from "@/domain/post-content";
import { Post } from "@roastery-capsules/post.post/domain";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import { makeEntity } from "@roastery/beans/entity/factories";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";

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

describe("FindPostContentByPostIdUseCase", () => {
	it("should return the post content when it exists", async () => {
		const repository = new PostContentRepository();
		const postEntityProps = makeEntity();
		const post = makePost(postEntityProps);
		const postContent = PostContent.make({
			post,
			content: "# Hello\nSome content.",
		});
		repository.seed([postContent]);

		const useCase = new FindPostContentByPostIdUseCase(repository);

		const result = await useCase.run(postEntityProps.id);

		expect(result).toBe(postContent);
	});

	it("should throw ResourceNotFoundException when no content exists for the post id", () => {
		const repository = new PostContentRepository();
		const useCase = new FindPostContentByPostIdUseCase(repository);

		expect(useCase.run("non-existent")).rejects.toBeInstanceOf(
			ResourceNotFoundException,
		);
	});
});
