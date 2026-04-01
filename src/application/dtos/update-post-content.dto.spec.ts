import { describe, expect, it } from "bun:test";
import { Schema } from "@roastery/terroir/schema";
import { UpdatePostContentDTO } from "./update-post-content.dto";

describe("UpdatePostContentDTO", () => {
	const validator = new Schema(UpdatePostContentDTO);

	it("should validate with both content and info", () => {
		expect(
			validator.match({
				content: "# Updated content",
				info: '{"readTime":10}',
			}),
		).toBe(true);
	});

	it("should validate with only content", () => {
		expect(validator.match({ content: "# Updated content" })).toBe(true);
	});

	it("should validate with only info", () => {
		expect(validator.match({ info: '{"readTime":10}' })).toBe(true);
	});

	it("should validate an empty object since all fields are optional", () => {
		expect(validator.match({})).toBe(true);
	});

	it("should invalidate when content is empty", () => {
		expect(validator.match({ content: "" })).toBe(false);
	});

	it("should invalidate when content is not a string", () => {
		expect(validator.match({ content: 123 })).toBe(false);
	});

	it("should invalidate when info is empty", () => {
		expect(validator.match({ info: "" })).toBe(false);
	});

	it("should invalidate when info has only one character", () => {
		expect(validator.match({ info: "{" })).toBe(false);
	});

	it("should validate when info has minimum length of 2", () => {
		expect(validator.match({ info: "{}" })).toBe(true);
	});

	it("should invalidate when info is not a string", () => {
		expect(validator.match({ info: 123 })).toBe(false);
	});
});
