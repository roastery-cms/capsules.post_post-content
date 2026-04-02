import { beforeEach, describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { faker } from "@faker-js/faker";
import { generateUUID } from "@roastery/beans/entity/helpers";
import { Post } from "@roastery-capsules/post.post/domain";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import { PostContent } from "@/domain";
import { bootstrap } from "../server";

type App = Awaited<ReturnType<typeof bootstrap>>;

const TAG = PostTag.make({ name: "Tech" });
const TYPE = PostType.make({ name: "Blog", schema: "{}" });
const POST = Post.make({
	type: TYPE,
	name: "My Post",
	description: "A description",
	cover: faker.image.url(),
	tags: [TAG],
});
const POST_CONTENT = PostContent.make({
	post: POST,
	content: "# Hello World\nSome content here.",
});

describe("FindPostContentByPostIdController", () => {
	let server: App;
	let api: ReturnType<typeof treaty<App>>;

	beforeEach(async () => {
		server = await bootstrap();

		// biome-ignore lint/suspicious/noExplicitAny: access to test repositories for seed
		const decorator = server.decorator as any;
		await (decorator.cache.flushall?.() ??
			decorator.cache.send?.("FLUSHALL", []));
		decorator.postRepositoryForPostContent.seed([POST]);
		await decorator.postContentRepository.create(POST_CONTENT);

		api = treaty<typeof server>(server);
	});

	it("should find post content by post ID and return 200", async () => {
		const { status } = await api["post-contents"]({ postId: POST.id }).get();

		expect(status).toBe(200);
	});

	it("should return the full post content payload", async () => {
		const { data } = await api["post-contents"]({ postId: POST.id }).get();

		expect(data).toMatchObject({
			content: POST_CONTENT.content,
			info: POST_CONTENT.info,
		});
		expect(data?.id).toBeDefined();
		expect(data?.post).toBeDefined();
		expect(data?.createdAt).toBeDefined();
	});

	it("should not require authentication", async () => {
		const { status } = await api["post-contents"]({ postId: POST.id }).get();

		expect(status).toBe(200);
	});

	it("should return 404 for a non-existent post content", async () => {
		const { status } = await api["post-contents"]({
			postId: generateUUID(),
		}).get();

		expect(status).toBe(404);
	});

	it("should return 422 for an invalid post ID", async () => {
		const { status } = await api["post-contents"]({
			postId: "not-a-uuid" as never,
		}).get();

		expect(status).toBe(422);
	});
});
