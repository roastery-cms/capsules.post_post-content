import { describe, expect, it } from "bun:test";
import { generateUUID } from "@roastery/beans/entity/helpers";
import { UnpackedPostContentSchema } from "./unpacked-post-content.schema";

describe("UnpackedPostContentSchema", () => {
	const makeValidPostTag = () => ({
		id: generateUUID(),
		name: "Review",
		slug: "review",
		hidden: false,
		createdAt: new Date().toISOString(),
	});

	const makeValidPostType = () => ({
		id: generateUUID(),
		name: "Blog",
		slug: "blog",
		isHighlighted: true,
		schema: '{"type":"object","properties":{}}',
		createdAt: new Date().toISOString(),
	});

	const makeValidPost = () => ({
		id: generateUUID(),
		name: "My Post",
		slug: "my-post",
		description: "A description",
		cover: "https://example.com/cover.jpg",
		type: makeValidPostType(),
		tags: [makeValidPostTag()],
		createdAt: new Date().toISOString(),
	});

	const makeValidData = () => ({
		id: generateUUID(),
		post: makeValidPost(),
		content: "# Hello World\nSome content here.",
		info: '{"readTime":5,"language":"pt-BR"}',
		createdAt: new Date().toISOString(),
	});

	it("should validate a complete valid object", () => {
		expect(UnpackedPostContentSchema.match(makeValidData())).toBe(true);
	});

	it("should validate with optional updatedAt", () => {
		expect(
			UnpackedPostContentSchema.match({
				...makeValidData(),
				updatedAt: new Date().toISOString(),
			}),
		).toBe(true);
	});

	it("should invalidate when content is empty", () => {
		expect(
			UnpackedPostContentSchema.match({ ...makeValidData(), content: "" }),
		).toBe(false);
	});

	it("should invalidate when info is empty", () => {
		expect(
			UnpackedPostContentSchema.match({ ...makeValidData(), info: "" }),
		).toBe(false);
	});

	it("should invalidate when post is missing", () => {
		const { post, ...rest } = makeValidData();
		expect(UnpackedPostContentSchema.match(rest)).toBe(false);
	});

	it("should invalidate when id is not a valid UUID", () => {
		expect(
			UnpackedPostContentSchema.match({
				...makeValidData(),
				id: "not-a-uuid",
			}),
		).toBe(false);
	});

	it("should invalidate a number", () => {
		expect(UnpackedPostContentSchema.match(123)).toBe(false);
	});

	it("should invalidate null", () => {
		expect(UnpackedPostContentSchema.match(null)).toBe(false);
	});

	it("should invalidate an empty object", () => {
		expect(UnpackedPostContentSchema.match({})).toBe(false);
	});
});
