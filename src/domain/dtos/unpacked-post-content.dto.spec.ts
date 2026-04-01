import { describe, expect, it } from "bun:test";
import { Schema } from "@roastery/terroir/schema";
import { UnpackedPostContentDTO } from "./unpacked-post-content.dto";
import { generateUUID } from "@roastery/beans/entity/helpers";

describe("UnpackedPostContentDTO", () => {
	const validator = new Schema(UnpackedPostContentDTO);

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

	const makeValidDTO = () => ({
		id: generateUUID(),
		post: makeValidPost(),
		content: "# Hello World\nSome content here.",
		info: '{"readTime":5,"language":"pt-BR"}',
		createdAt: new Date().toISOString(),
	});

	it("should validate a complete valid DTO", () => {
		expect(validator.match(makeValidDTO())).toBe(true);
	});

	it("should validate with optional updatedAt", () => {
		expect(
			validator.match({
				...makeValidDTO(),
				updatedAt: new Date().toISOString(),
			}),
		).toBe(true);
	});

	it("should validate with empty tags array", () => {
		const dto = makeValidDTO();
		dto.post.tags = [];
		expect(validator.match(dto)).toBe(true);
	});

	it("should invalidate when content is empty", () => {
		expect(validator.match({ ...makeValidDTO(), content: "" })).toBe(false);
	});

	it("should invalidate when info is empty", () => {
		expect(validator.match({ ...makeValidDTO(), info: "" })).toBe(false);
	});

	it("should invalidate when post is missing", () => {
		const { post, ...rest } = makeValidDTO();
		expect(validator.match(rest)).toBe(false);
	});

	it("should invalidate when content is missing", () => {
		const { content, ...rest } = makeValidDTO();
		expect(validator.match(rest)).toBe(false);
	});

	it("should invalidate when info is missing", () => {
		const { info, ...rest } = makeValidDTO();
		expect(validator.match(rest)).toBe(false);
	});

	it("should invalidate when id is missing", () => {
		const { id, ...rest } = makeValidDTO();
		expect(validator.match(rest)).toBe(false);
	});

	it("should invalidate when id is not a valid UUID", () => {
		expect(validator.match({ ...makeValidDTO(), id: "not-a-uuid" })).toBe(
			false,
		);
	});

	it("should invalidate when createdAt is not a valid date-time", () => {
		expect(
			validator.match({ ...makeValidDTO(), createdAt: "not-a-date" }),
		).toBe(false);
	});

	it("should invalidate when content is not a string", () => {
		expect(validator.match({ ...makeValidDTO(), content: 123 })).toBe(false);
	});

	it("should invalidate when info is not a string", () => {
		expect(validator.match({ ...makeValidDTO(), info: 123 })).toBe(false);
	});
});
