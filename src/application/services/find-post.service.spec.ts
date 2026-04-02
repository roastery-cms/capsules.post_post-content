import { describe, expect, it } from "bun:test";
import { makeEntity } from "@roastery/beans/entity/factories";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";
import { Post } from "@roastery-capsules/post.post/domain";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import { PostRepository } from "@/infra/repositories/test/post.repository";
import { FindPostService } from "./find-post.service";

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

describe("FindPostService", () => {
	it("should return the post when it exists", async () => {
		const repository = new PostRepository();
		const entityProps = makeEntity();
		const post = makePost(entityProps);
		repository.seed([post]);

		const service = new FindPostService(repository);

		const result = await service.run(entityProps.id);

		expect(result).toBe(post);
	});

	it("should throw ResourceNotFoundException when the post does not exist", () => {
		const repository = new PostRepository();
		const service = new FindPostService(repository);

		expect(service.run("non-existent")).rejects.toBeInstanceOf(
			ResourceNotFoundException,
		);
	});
});
