import { describe, expect, it } from "bun:test";
import {
    PrismaPostContentMapper,
    type PostContentPrismaDefaultOutput,
} from "./prisma-post-content.mapper";
import { PostContent } from "@/domain";
import { Post } from "@roastery-capsules/post.post/domain";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import { makeEntity } from "@roastery/beans/entity/factories";

const typeEntity = makeEntity();
const tagEntity = makeEntity();
const tag2Entity = makeEntity();
const postEntity = makeEntity();
const contentEntity = makeEntity();

const makePrismaPostType =
    (): PostContentPrismaDefaultOutput["post"]["postType"] => ({
        id: typeEntity.id,
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: null,
        name: "Blog",
        slug: "blog",
        schema: "{}",
        isHighlighted: true,
    });

const makePrismaTag = (
    overrides?: Partial<PostContentPrismaDefaultOutput["post"]["tags"][number]>,
): PostContentPrismaDefaultOutput["post"]["tags"][number] => ({
    id: tagEntity.id,
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: null,
    name: "TypeScript",
    slug: "typescript",
    hidden: false,
    ...overrides,
});

const makePrismaPost = (
    overrides?: Partial<PostContentPrismaDefaultOutput["post"]>,
): PostContentPrismaDefaultOutput["post"] => ({
    id: postEntity.id,
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: null,
    name: "My Post",
    slug: "my-post",
    description: "A description",
    cover: "https://example.com/image.jpg",
    postType: makePrismaPostType(),
    tags: [makePrismaTag()],
    ...overrides,
});

const makePrismaOutput = (
    overrides?: Partial<PostContentPrismaDefaultOutput>,
): PostContentPrismaDefaultOutput => ({
    id: contentEntity.id,
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: null,
    content: "# Hello World",
    info: { readTime: 5, language: "pt-BR" },
    post: makePrismaPost(),
    ...overrides,
});

describe("PrismaPostContentMapper", () => {
    it("should return a PostContent instance", () => {
        const result = PrismaPostContentMapper.run(makePrismaOutput());

        expect(result).toBeInstanceOf(PostContent);
    });

    it("should map id and createdAt from prisma output", () => {
        const result = PrismaPostContentMapper.run(makePrismaOutput());

        expect(result.id).toBe(contentEntity.id);
        expect(result.createdAt).toBe("2025-01-01T00:00:00.000Z");
    });

    it("should map updatedAt when present", () => {
        const data = makePrismaOutput({
            updatedAt: new Date("2025-06-15T12:00:00.000Z"),
        });

        const result = PrismaPostContentMapper.run(data);

        expect(result.updatedAt).toBe("2025-06-15T12:00:00.000Z");
    });

    it("should map content as string", () => {
        const result = PrismaPostContentMapper.run(makePrismaOutput());

        expect(result.content).toBe("# Hello World");
    });

    it("should stringify info from JsonValue to string", () => {
        const result = PrismaPostContentMapper.run(makePrismaOutput());

        expect(result.info).toBe('{"readTime":5,"language":"pt-BR"}');
    });

    it("should stringify info when it is a primitive JsonValue", () => {
        const result = PrismaPostContentMapper.run(
            makePrismaOutput({ info: "simple-string" }),
        );

        expect(result.info).toBe('"simple-string"');
    });

    it("should stringify info when it is null", () => {
        const result = PrismaPostContentMapper.run(
            makePrismaOutput({ info: null }),
        );

        expect(result.info).toBe("null");
    });

    it("should map post as a Post instance", () => {
        const result = PrismaPostContentMapper.run(makePrismaOutput());

        expect(result.post).toBeInstanceOf(Post);
    });

    it("should map post properties correctly", () => {
        const result = PrismaPostContentMapper.run(makePrismaOutput());
        const post = result.post;

        expect(post.id).toBe(postEntity.id);
        expect(post.name).toBe("My Post");
        expect(post.slug).toBe("my-post");
        expect(post.description).toBe("A description");
        expect(post.cover).toBe("https://example.com/image.jpg");
        expect(post.createdAt).toBe("2025-01-01T00:00:00.000Z");
    });

    it("should map postType as a PostType instance", () => {
        const result = PrismaPostContentMapper.run(makePrismaOutput());

        expect(result.post.type).toBeInstanceOf(PostType);
    });

    it("should map postType properties correctly", () => {
        const result = PrismaPostContentMapper.run(makePrismaOutput());
        const type = result.post.type;

        expect(type.id).toBe(typeEntity.id);
        expect(type.name).toBe("Blog");
        expect(type.slug).toBe("blog");
        expect(type.isHighlighted).toBe(true);
    });

    it("should map tags as PostTag instances", () => {
        const result = PrismaPostContentMapper.run(makePrismaOutput());

        expect(result.post.tags).toHaveLength(1);
        expect(result.post.tags[0]).toBeInstanceOf(PostTag);
    });

    it("should map tag properties correctly", () => {
        const result = PrismaPostContentMapper.run(makePrismaOutput());
        const tag = result.post.tags[0]!;

        expect(tag.id).toBe(tagEntity.id);
        expect(tag.name).toBe("TypeScript");
        expect(tag.slug).toBe("typescript");
        expect(tag.hidden).toBe(false);
    });

    it("should map multiple tags", () => {
        const data = makePrismaOutput({
            post: makePrismaPost({
                tags: [
                    makePrismaTag({ id: tagEntity.id, name: "TypeScript" }),
                    makePrismaTag({ id: tag2Entity.id, name: "Bun" }),
                ],
            }),
        });

        const result = PrismaPostContentMapper.run(data);

        expect(result.post.tags).toHaveLength(2);
        expect(result.post.tags[0]!.name).toBe("TypeScript");
        expect(result.post.tags[1]!.name).toBe("Bun");
    });

    it("should handle empty tags array", () => {
        const data = makePrismaOutput({
            post: makePrismaPost({ tags: [] }),
        });

        const result = PrismaPostContentMapper.run(data);

        expect(result.post.tags).toHaveLength(0);
    });
});
