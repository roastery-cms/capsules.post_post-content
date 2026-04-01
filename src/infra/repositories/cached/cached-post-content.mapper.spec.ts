import { describe, expect, it } from "bun:test";
import { CachedPostContentMapper } from "./cached-post-content.mapper";
import { PostContent } from "@/domain";
import { Post } from "@roastery-capsules/post.post/domain";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import { Mapper } from "@roastery/beans";
import { makeEntity } from "@roastery/beans/entity/factories";
import { InvalidPropertyException } from "@roastery/terroir/exceptions/domain";

const typeEntity = makeEntity();
const tagEntity = makeEntity();
const tag2Entity = makeEntity();
const postEntity = makeEntity();
const contentEntity = makeEntity();

const makePostType = () =>
    PostType.make(
        { name: "Blog", slug: "blog", schema: "{}", isHighlighted: true },
        typeEntity,
    );

const makeTag = (overrides?: { id?: string; name?: string; slug?: string }) =>
    PostTag.make(
        {
            name: overrides?.name ?? "TypeScript",
            slug: overrides?.slug ?? "typescript",
            hidden: false,
        },
        { ...tagEntity, ...overrides },
    );

const makePost = () =>
    Post.make(
        {
            name: "My Post",
            slug: "my-post",
            description: "A description",
            cover: "https://example.com/image.jpg",
            type: makePostType(),
            tags: [makeTag()],
        },
        postEntity,
    );

const makePostContent = () =>
    PostContent.make(
        {
            post: makePost(),
            content: "# Hello World",
            info: '{"readTime":5,"language":"pt-BR"}',
        },
        contentEntity,
    );

const serialize = (postContent = makePostContent()): string =>
    JSON.stringify(Mapper.toDTO(postContent));

describe("CachedPostContentMapper", () => {
    it("should return a PostContent instance", () => {
        const result = CachedPostContentMapper.run(serialize());

        expect(result).toBeInstanceOf(PostContent);
    });

    it("should map id and createdAt from cached data", () => {
        const result = CachedPostContentMapper.run(serialize());

        expect(result.id).toBe(contentEntity.id);
        expect(result.createdAt).toBe(contentEntity.createdAt);
    });

    it("should map content as string", () => {
        const result = CachedPostContentMapper.run(serialize());

        expect(result.content).toBe("# Hello World");
    });

    it("should map info as string", () => {
        const result = CachedPostContentMapper.run(serialize());

        expect(result.info).toBe('{"readTime":5,"language":"pt-BR"}');
    });

    it("should map post as a Post instance", () => {
        const result = CachedPostContentMapper.run(serialize());

        expect(result.post).toBeInstanceOf(Post);
    });

    it("should map post properties correctly", () => {
        const result = CachedPostContentMapper.run(serialize());
        const post = result.post;

        expect(post.id).toBe(postEntity.id);
        expect(post.name).toBe("My Post");
        expect(post.slug).toBe("my-post");
        expect(post.description).toBe("A description");
        expect(post.cover).toBe("https://example.com/image.jpg");
        expect(post.createdAt).toBe(postEntity.createdAt);
    });

    it("should map postType as a PostType instance", () => {
        const result = CachedPostContentMapper.run(serialize());

        expect(result.post.type).toBeInstanceOf(PostType);
    });

    it("should map postType properties correctly", () => {
        const result = CachedPostContentMapper.run(serialize());
        const type = result.post.type;

        expect(type.id).toBe(typeEntity.id);
        expect(type.name).toBe("Blog");
        expect(type.slug).toBe("blog");
        expect(type.isHighlighted).toBe(true);
    });

    it("should map tags as PostTag instances", () => {
        const result = CachedPostContentMapper.run(serialize());

        expect(result.post.tags).toHaveLength(1);
        expect(result.post.tags[0]).toBeInstanceOf(PostTag);
    });

    it("should map tag properties correctly", () => {
        const result = CachedPostContentMapper.run(serialize());
        const tag = result.post.tags[0]!;

        expect(tag.id).toBe(tagEntity.id);
        expect(tag.name).toBe("TypeScript");
        expect(tag.slug).toBe("typescript");
        expect(tag.hidden).toBe(false);
    });

    it("should map multiple tags", () => {
        const postContent = PostContent.make(
            {
                post: Post.make(
                    {
                        name: "My Post",
                        slug: "my-post",
                        description: "A description",
                        cover: "https://example.com/image.jpg",
                        type: makePostType(),
                        tags: [
                            makeTag({
                                id: tagEntity.id,
                                name: "TypeScript",
                                slug: "typescript",
                            }),
                            makeTag({
                                id: tag2Entity.id,
                                name: "Bun",
                                slug: "bun",
                            }),
                        ],
                    },
                    postEntity,
                ),
                content: "# Hello World",
                info: '{"readTime":5,"language":"pt-BR"}',
            },
            contentEntity,
        );

        const result = CachedPostContentMapper.run(serialize(postContent));

        expect(result.post.tags).toHaveLength(2);
        expect(result.post.tags[0]!.name).toBe("TypeScript");
        expect(result.post.tags[1]!.name).toBe("Bun");
    });

    it("should handle empty tags array", () => {
        const postContent = PostContent.make(
            {
                post: Post.make(
                    {
                        name: "My Post",
                        slug: "my-post",
                        description: "A description",
                        cover: "https://example.com/image.jpg",
                        type: makePostType(),
                        tags: [],
                    },
                    postEntity,
                ),
                content: "# Hello World",
                info: '{"readTime":5,"language":"pt-BR"}',
            },
            contentEntity,
        );

        const result = CachedPostContentMapper.run(serialize(postContent));

        expect(result.post.tags).toHaveLength(0);
    });

    it("should rethrow InvalidPropertyException when content is empty", () => {
        const data = JSON.parse(serialize());
        data.content = "";

        expect(() => CachedPostContentMapper.run(JSON.stringify(data))).toThrow(
            InvalidPropertyException,
        );
    });

    it("should rethrow InvalidPropertyException when info is empty", () => {
        const data = JSON.parse(serialize());
        data.info = "";

        expect(() => CachedPostContentMapper.run(JSON.stringify(data))).toThrow(
            InvalidPropertyException,
        );
    });

    it("should throw SyntaxError when data is not valid JSON", () => {
        expect(() => CachedPostContentMapper.run("invalid-json")).toThrow(
            SyntaxError,
        );
    });
});
