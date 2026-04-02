import { describe, expect, it } from "bun:test";
import { generateUUID } from "@roastery/beans/entity/helpers";
import { Schema } from "@roastery/terroir/schema";
import { FindPostContentByPostIdDTO } from "./find-post-content-by-post-id.dto";

describe("FindPostContentByPostIdDTO", () => {
	const validator = new Schema(FindPostContentByPostIdDTO);

	it("should validate with a valid UUID postId", () => {
		expect(validator.match({ postId: generateUUID() })).toBe(true);
	});

	it("should invalidate when postId is missing", () => {
		expect(validator.match({})).toBe(false);
	});

	it("should invalidate when postId is not a valid UUID", () => {
		expect(validator.match({ postId: "not-a-uuid" })).toBe(false);
	});

	it("should invalidate when postId is empty", () => {
		expect(validator.match({ postId: "" })).toBe(false);
	});

	it("should invalidate when postId is a number", () => {
		expect(validator.match({ postId: 123 })).toBe(false);
	});

	it("should invalidate when postId is null", () => {
		expect(validator.match({ postId: null })).toBe(false);
	});
});
