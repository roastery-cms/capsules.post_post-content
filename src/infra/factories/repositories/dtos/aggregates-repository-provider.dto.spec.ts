import { describe, expect, it } from "bun:test";
import { Schema } from "@roastery/terroir/schema";
import { AggregatesRepositoryProviderDTO } from "./aggregates-repository-provider.dto";

describe("AggregatesRepositoryProviderDTO", () => {
	const validator = new Schema(AggregatesRepositoryProviderDTO);

	it("should validate API", () => {
		expect(validator.match("API")).toBe(true);
	});

	it("should validate MEMORY", () => {
		expect(validator.match("MEMORY")).toBe(true);
	});

	it("should invalidate PRISMA", () => {
		expect(validator.match("PRISMA")).toBe(false);
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
