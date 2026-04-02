import { describe, expect, it } from "bun:test";
import { makeEntity } from "@roastery/beans/entity/factories";
import { Post } from "@roastery-capsules/post.post/domain";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import { PostContent } from "@/domain/post-content";
import { PostContentRepository } from "@/infra/repositories/test/post-content.repository";
import { PostContentUniquenessCheckerService } from "./post-content-uniqueness-checker.service";

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

describe("PostContentUniquenessCheckerService", () => {
	it("should return true when no content exists for the post id", async () => {
		const repository = new PostContentRepository();
		const service = new PostContentUniquenessCheckerService(repository);

		const result = await service.run("non-existent");

		expect(result).toBeTrue();
	});

	it("should return false when content already exists for the post id", async () => {
		const repository = new PostContentRepository();
		const postEntityProps = makeEntity();
		const post = makePost(postEntityProps);
		const postContent = PostContent.make({
			post,
			content: "# Hello\nSome content.",
		});

		repository.seed([postContent]);

		const service = new PostContentUniquenessCheckerService(repository);

		const result = await service.run(postEntityProps.id);

		expect(result).toBeFalse();
	});
});
