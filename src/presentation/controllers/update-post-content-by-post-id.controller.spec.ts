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

describe("UpdatePostContentByPostIdController", () => {
	let server: App;
	let api: ReturnType<typeof treaty<App>>;
	let env: App["decorator"]["env"];

	beforeEach(async () => {
		server = await bootstrap();

		// biome-ignore lint/suspicious/noExplicitAny: access to test repositories for seed
		const decorator = server.decorator as any;
		await (decorator.cache.flushall?.() ??
			decorator.cache.send?.("FLUSHALL", []));
		decorator.postRepositoryForPostContent.seed([POST]);
		await decorator.postContentRepository.create(POST_CONTENT);

		api = treaty<typeof server>(server);
		env = server.decorator.env;
	});

	async function authenticate() {
		const { AUTH_EMAIL: email, AUTH_PASSWORD: password } = env;
		const auth = await api.auth.login.post({ email, password });
		const cookies = auth.response.headers.getSetCookie();
		return { headers: { cookie: cookies.join("; ") } };
	}

	it("should update post content and return 200", async () => {
		const options = await authenticate();

		const { status } = await api["post-contents"]({ postId: POST.id }).patch(
			{ content: "# Updated Content" },
			options,
		);

		expect(status).toBe(200);
	});

	it("should return updated content in the response", async () => {
		const options = await authenticate();
		const updatedContent = "# Updated Content\nNew body.";

		const { data } = await api["post-contents"]({ postId: POST.id }).patch(
			{ content: updatedContent },
			options,
		);

		expect(data?.content).toBe(updatedContent);
		expect(data?.id).toBeDefined();
		expect(data?.post).toBeDefined();
		expect(data?.updatedAt).toBeDefined();
	});

	it("should update only info without changing content", async () => {
		const options = await authenticate();
		const updatedInfo = "{}";

		const { data } = await api["post-contents"]({ postId: POST.id }).patch(
			{ info: updatedInfo },
			options,
		);

		expect(data?.info).toBe(updatedInfo);
		expect(data?.content).toBe(POST_CONTENT.content);
	});

	it("should reject unauthenticated requests", async () => {
		const { status } = await api["post-contents"]({ postId: POST.id }).patch({
			content: "# Updated",
		});

		expect(status).not.toBe(200);
	});

	it("should return 404 for a non-existent post content", async () => {
		const options = await authenticate();

		const { status } = await api["post-contents"]({
			postId: generateUUID(),
		}).patch({ content: "# Updated" }, options);

		expect(status).toBe(404);
	});

	it("should reject a request with an empty content", async () => {
		const options = await authenticate();

		const { status } = await api["post-contents"]({ postId: POST.id }).patch(
			{ content: "" } as never,
			options,
		);

		expect(status).toBe(422);
	});

	it("should reject a request with an invalid postId", async () => {
		const options = await authenticate();

		const { status } = await api["post-contents"]({
			postId: "not-a-uuid" as never,
		}).patch({ content: "# Updated" }, options);

		expect(status).toBe(422);
	});
});
