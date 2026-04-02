import { describe, expect, it } from "bun:test";
import { Schema } from "@roastery/terroir/schema";
import { PostContentRepositoryProviderDTO } from "./post-content-repository-provider.dto";

describe("PostContentRepositoryProviderDTO", () => {
	const validator = new Schema(PostContentRepositoryProviderDTO);

	it("should validate PRISMA", () => {
		expect(validator.match("PRISMA")).toBe(true);
	});

	it("should validate MEMORY", () => {
		expect(validator.match("MEMORY")).toBe(true);
	});

	it("should invalidate API", () => {
		expect(validator.match("API")).toBe(false);
	});

	it("should invalidate an empty string", () => {
		expect(validator.match("")).toBe(false);
	});

	it("should invalidate a number", () => {
		expect(validator.match(123)).toBe(false);
	});

	it("should invalidate null", () => {
		expect(validator.match(null)).toBe(false);
	});

	it("should invalidate undefined", () => {
		expect(validator.match(undefined)).toBe(false);
	});
});
