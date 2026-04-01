import { describe, expect, it } from "bun:test";
import { Schema } from "@roastery/terroir/schema";
import { CreatePostContentDTO } from "./create-post-content.dto";
import { generateUUID } from "@roastery/beans/entity/helpers";

describe("CreatePostContentDTO", () => {
	const validator = new Schema(CreatePostContentDTO);

	const makeValidDTO = () => ({
		postId: generateUUID(),
		content: "# Hello World\nSome content here.",
		info: '{"readTime":5,"language":"pt-BR"}',
	});

	it("should validate a complete valid DTO", () => {
		expect(validator.match(makeValidDTO())).toBe(true);
	});

	it("should invalidate when postId is missing", () => {
		const { postId, ...rest } = makeValidDTO();
		expect(validator.match(rest)).toBe(false);
	});

	it("should invalidate when postId is not a valid UUID", () => {
		expect(validator.match({ ...makeValidDTO(), postId: "not-a-uuid" })).toBe(
			false,
		);
	});

	it("should invalidate when content is missing", () => {
		const { content, ...rest } = makeValidDTO();
		expect(validator.match(rest)).toBe(false);
	});

	it("should invalidate when content is empty", () => {
		expect(validator.match({ ...makeValidDTO(), content: "" })).toBe(false);
	});

	it("should invalidate when content is not a string", () => {
		expect(validator.match({ ...makeValidDTO(), content: 123 })).toBe(false);
	});

	it("should invalidate when info is missing", () => {
		const { info, ...rest } = makeValidDTO();
		expect(validator.match(rest)).toBe(false);
	});

	it("should invalidate when info is empty", () => {
		expect(validator.match({ ...makeValidDTO(), info: "" })).toBe(false);
	});

	it("should invalidate when info has only one character", () => {
		expect(validator.match({ ...makeValidDTO(), info: "{" })).toBe(false);
	});

	it("should validate when info has minimum length of 2", () => {
		expect(validator.match({ ...makeValidDTO(), info: "{}" })).toBe(true);
	});

	it("should invalidate when info is not a string", () => {
		expect(validator.match({ ...makeValidDTO(), info: 123 })).toBe(false);
	});
});
