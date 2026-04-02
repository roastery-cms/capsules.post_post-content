import { describe, expect, it } from "bun:test";
import { makeEntity } from "@roastery/beans/entity/factories";
import { Post } from "@roastery-capsules/post.post/domain";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import { ApiPostMapper } from "./api-post.mapper";

const typeEntity = makeEntity();
const tagEntity = makeEntity();
const tag2Entity = makeEntity();
const postEntity = makeEntity();

const makeArgs = () => ({
	id: postEntity.id,
	createdAt: postEntity.createdAt,
	name: "My Post",
	slug: "my-post",
	description: "A description",
	cover: "https://example.com/cover.jpg",
	type: {
		id: typeEntity.id,
		createdAt: typeEntity.createdAt,
		name: "Blog",
		slug: "blog",
		schema: "{}",
		isHighlighted: true,
	},
	tags: [
		{
			id: tagEntity.id,
			createdAt: tagEntity.createdAt,
			name: "TypeScript",
			slug: "typescript",
			hidden: false,
		},
	],
});

describe("ApiPostMapper", () => {
	it("should return a Post instance", () => {
		expect(ApiPostMapper.run(makeArgs())).toBeInstanceOf(Post);
	});

	it("should map id and createdAt from args", () => {
		const result = ApiPostMapper.run(makeArgs());

		expect(result.id).toBe(postEntity.id);
		expect(result.createdAt).toBe(postEntity.createdAt);
	});

	it("should map post properties correctly", () => {
		const result = ApiPostMapper.run(makeArgs());

		expect(result.name).toBe("My Post");
		expect(result.slug).toBe("my-post");
		expect(result.description).toBe("A description");
		expect(result.cover).toBe("https://example.com/cover.jpg");
	});

	it("should map type as a PostType instance", () => {
		const result = ApiPostMapper.run(makeArgs());

		expect(result.type).toBeInstanceOf(PostType);
	});

	it("should map type properties correctly", () => {
		const result = ApiPostMapper.run(makeArgs());
		const type = result.type;

		expect(type.id).toBe(typeEntity.id);
		expect(type.name).toBe("Blog");
		expect(type.slug).toBe("blog");
		expect(type.isHighlighted).toBe(true);
	});

	it("should map tags as PostTag instances", () => {
		const result = ApiPostMapper.run(makeArgs());

		expect(result.tags).toHaveLength(1);
		expect(result.tags[0]).toBeInstanceOf(PostTag);
	});

	it("should map tag properties correctly", () => {
		const result = ApiPostMapper.run(makeArgs());
		const tag = result.tags[0]!;

		expect(tag.id).toBe(tagEntity.id);
		expect(tag.name).toBe("TypeScript");
		expect(tag.slug).toBe("typescript");
		expect(tag.hidden).toBe(false);
	});

	it("should map multiple tags", () => {
		const args = makeArgs();
		args.tags.push({
			id: tag2Entity.id,
			createdAt: tag2Entity.createdAt,
			name: "Bun",
			slug: "bun",
			hidden: true,
		});

		const result = ApiPostMapper.run(args);

		expect(result.tags).toHaveLength(2);
		expect(result.tags[0]!.name).toBe("TypeScript");
		expect(result.tags[1]!.name).toBe("Bun");
	});

	it("should handle empty tags array", () => {
		const args = makeArgs();
		args.tags = [];

		const result = ApiPostMapper.run(args);

		expect(result.tags).toHaveLength(0);
	});

	it("should map updatedAt when present", () => {
		const updatedAt = new Date().toISOString();
		const args = { ...makeArgs(), updatedAt };

		const result = ApiPostMapper.run(args);

		expect(result.updatedAt).toBe(updatedAt);
	});
});
