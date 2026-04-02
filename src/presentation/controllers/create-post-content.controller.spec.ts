import { beforeEach, describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { faker } from "@faker-js/faker";
import { generateUUID } from "@roastery/beans/entity/helpers";
import { Post } from "@roastery-capsules/post.post/domain";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import { PostType } from "@roastery-capsules/post.post-type/domain";
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

function makeBody(overrides?: Record<string, unknown>) {
	return {
		postId: POST.id,
		content: faker.lorem.paragraphs(2),
		info: "{}",
		...overrides,
	};
}

describe("CreatePostContentController", () => {
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

		api = treaty<typeof server>(server);
		env = server.decorator.env;
	});

	async function authenticate() {
		const { AUTH_EMAIL: email, AUTH_PASSWORD: password } = env;
		const auth = await api.auth.login.post({ email, password });
		const cookies = auth.response.headers.getSetCookie();
		return { headers: { cookie: cookies.join("; ") } };
	}

	it("should create a post content and return 201", async () => {
		const options = await authenticate();

		const { status } = await api["post-contents"].post(makeBody(), options);

		expect(status).toBe(201);
	});

	it("should return the full post content payload on creation", async () => {
		const options = await authenticate();
		const body = makeBody();

		const { data } = await api["post-contents"].post(body, options);

		expect(data).toMatchObject({
			content: body.content,
			info: body.info,
		});
		expect(data?.id).toBeDefined();
		expect(data?.post).toBeDefined();
		expect(data?.createdAt).toBeDefined();
		expect(data?.updatedAt).toBeUndefined();
	});

	it("should reject unauthenticated requests", async () => {
		const { status } = await api["post-contents"].post(makeBody());

		expect(status).not.toBe(201);
	});

	it("should reject a request with an empty content", async () => {
		const options = await authenticate();

		const { status } = await api["post-contents"].post(
			{ ...makeBody(), content: "" } as never,
			options,
		);

		expect(status).toBe(422);
	});

	it("should reject a request with an invalid postId", async () => {
		const options = await authenticate();

		const { status } = await api["post-contents"].post(
			{ ...makeBody(), postId: "not-a-uuid" } as never,
			options,
		);

		expect(status).toBe(422);
	});

	it("should reject a request with a non-existent postId", async () => {
		const options = await authenticate();

		const { status } = await api["post-contents"].post(
			makeBody({ postId: generateUUID() }),
			options,
		);

		expect(status).not.toBe(201);
	});

	it("should not allow duplicate post content for the same post", async () => {
		const options = await authenticate();
		const body = makeBody();

		const first = await api["post-contents"].post(body, options);
		expect(first.status).toBe(201);

		const second = await api["post-contents"].post(body, options);
		expect(second.status).not.toBe(201);
	});
});
