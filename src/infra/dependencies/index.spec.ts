import { describe, expect, it } from "bun:test";
import { Schema } from "@roastery/terroir/schema";
import { PostContentDependenciesDTO } from "./index";

describe("PostContentDependenciesDTO", () => {
	const validator = new Schema(PostContentDependenciesDTO);

	it("should validate when all fields are provided", () => {
		expect(
			validator.match({
				DATABASE_URL: "postgresql://localhost:5432/db",
				DATABASE_PROVIDER: "PRISMA",
				POST_BASE_URL: "https://example.com/posts",
			}),
		).toBe(true);
	});

	it("should validate when all fields are omitted", () => {
		expect(validator.match({})).toBe(true);
	});

	it("should validate when only DATABASE_URL is provided", () => {
		expect(validator.match({ DATABASE_URL: "postgresql://localhost:5432/db" })).toBe(true);
	});

	it("should validate when only DATABASE_PROVIDER is provided", () => {
		expect(validator.match({ DATABASE_PROVIDER: "MEMORY" })).toBe(true);
	});

	it("should validate when only POST_BASE_URL is provided", () => {
		expect(validator.match({ POST_BASE_URL: "https://example.com" })).toBe(true);
	});

	it("should invalidate when DATABASE_URL is not a string", () => {
		expect(validator.match({ DATABASE_URL: 123 })).toBe(false);
	});

	it("should invalidate when DATABASE_PROVIDER is an invalid value", () => {
		expect(validator.match({ DATABASE_PROVIDER: "INVALID" })).toBe(false);
	});

	it("should validate DATABASE_PROVIDER as PRISMA", () => {
		expect(validator.match({ DATABASE_PROVIDER: "PRISMA" })).toBe(true);
	});

	it("should validate DATABASE_PROVIDER as MEMORY", () => {
		expect(validator.match({ DATABASE_PROVIDER: "MEMORY" })).toBe(true);
	});

	it("should invalidate when POST_BASE_URL is not a valid URL", () => {
		expect(validator.match({ POST_BASE_URL: "not-a-url" })).toBe(false);
	});

	it("should invalidate when POST_BASE_URL is not a string", () => {
		expect(validator.match({ POST_BASE_URL: 123 })).toBe(false);
	});
});
