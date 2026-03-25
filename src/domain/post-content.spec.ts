import { describe, expect, it } from "bun:test";
import { PostContent } from "./post-content";
import type { IConstructorPostContent } from "./types";
import type { IPost } from "@roastery-capsules/post.post/domain/types";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";
import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";
import { t } from "@roastery/terroir";
import { makeEntity } from "@roastery/beans/entity/factories";
import { InvalidPropertyException } from "@roastery/terroir/exceptions/domain";

const infoSchema = JSON.stringify(
	t.Object({
		readTime: t.Number(),
		language: t.String(),
	}),
);

const emptySchema = JSON.stringify(t.Object({}));

const mockPostType = (overrides?: Partial<IPostType>): IPostType =>
	({
		id: "type-id",
		name: "Blog",
		slug: "blog",
		isHighlighted: true,
		schema: { toString: () => emptySchema },
		createdAt: new Date().toISOString(),
		rename() {},
		reslug() {},
		setHighlightTo() {},
		...overrides,
	}) as IPostType;

const mockPost = (overrides?: Partial<IPost>): IPost =>
	({
		id: "post-id",
		name: "My Post",
		slug: "my-post",
		description: "A description",
		cover: "https://example.com/image.jpg",
		type: mockPostType(),
		tags: [] as IPostTag[],
		createdAt: new Date().toISOString(),
		rename() {},
		reslug() {},
		updateDescription() {},
		updateCover() {},
		updateTags() {},
		...overrides,
	}) as IPost;

const makeValidProps = (
	overrides?: Partial<IConstructorPostContent>,
): IConstructorPostContent => ({
	post: mockPost(),
	content: "# Hello World\nSome content here.",
	...overrides,
});

describe("PostContent Entity", () => {
	describe("make", () => {
		it("should create a valid instance with correct properties", () => {
			const props = makeValidProps();
			const postContent = PostContent.make(props);

			expect(postContent).toBeInstanceOf(PostContent);
			expect(postContent.post).toBe(props.post);
			expect(postContent.content).toBe(props.content);
			expect(postContent.info).toBe("{}");
			expect(postContent.id).toBeDefined();
			expect(postContent.createdAt).toBeDefined();
		});

		it("should default info to empty object when omitted", () => {
			const postContent = PostContent.make(makeValidProps());

			expect(postContent.info).toBe("{}");
		});

		it("should use provided info when given", () => {
			const post = mockPost({
				type: mockPostType({ schema: { toString: () => infoSchema } } as never),
			});
			const postContent = PostContent.make(
				makeValidProps({
					post,
					info: '{"readTime":5,"language":"pt-BR"}',
				}),
			);

			expect(postContent.info).toBe('{"readTime":5,"language":"pt-BR"}');
		});

		it("should accept custom entityProps", () => {
			const entityProps = makeEntity();
			const postContent = PostContent.make(makeValidProps(), entityProps);

			expect(postContent.id).toBe(entityProps.id);
			expect(postContent.createdAt).toBe(entityProps.createdAt);
		});

		it("should throw InvalidPropertyException for empty content", () => {
			expect(() => PostContent.make(makeValidProps({ content: "" }))).toThrow(
				InvalidPropertyException,
			);
		});

		it("should throw InvalidPropertyException for invalid info JSON", () => {
			expect(() =>
				PostContent.make(makeValidProps({ info: "not-json" })),
			).toThrow(InvalidPropertyException);
		});

		it("should throw InvalidPropertyException when info does not match schema", () => {
			const post = mockPost({
				type: mockPostType({ schema: { toString: () => infoSchema } } as never),
			});

			expect(() =>
				PostContent.make(
					makeValidProps({
						post,
						info: '{"readTime":"not-a-number"}',
					}),
				),
			).toThrow(InvalidPropertyException);
		});
	});

	describe("updateContent", () => {
		it("should update the content", () => {
			const postContent = PostContent.make(makeValidProps()) as PostContent;
			const newContent = "# Updated\nNew content.";

			postContent.updateContent(newContent);

			expect(postContent.content).toBe(newContent);
		});

		it("should set updatedAt after updateContent", () => {
			const postContent = PostContent.make(makeValidProps()) as PostContent;

			postContent.updateContent("Updated content");

			expect(postContent.updatedAt).toBeDefined();
		});

		it("should throw InvalidPropertyException for empty content", () => {
			const postContent = PostContent.make(makeValidProps()) as PostContent;

			expect(() => postContent.updateContent("")).toThrow(
				InvalidPropertyException,
			);
		});
	});

	describe("updateInfo", () => {
		it("should update the info", () => {
			const post = mockPost({
				type: mockPostType({ schema: { toString: () => infoSchema } } as never),
			});
			const postContent = PostContent.make(
				makeValidProps({ post, info: '{"readTime":5,"language":"pt-BR"}' }),
			) as PostContent;

			postContent.updateInfo('{"readTime":10,"language":"en-US"}');

			expect(postContent.info).toBe('{"readTime":10,"language":"en-US"}');
		});

		it("should set updatedAt after updateInfo", () => {
			const postContent = PostContent.make(makeValidProps()) as PostContent;

			postContent.updateInfo("{}");

			expect(postContent.updatedAt).toBeDefined();
		});

		it("should invalidate info cache after update", () => {
			const postContent = PostContent.make(makeValidProps()) as PostContent;

			// access info to populate cache
			const _cached = postContent.info;

			postContent.updateInfo("{}");

			expect(postContent.info).toBe("{}");
		});

		it("should throw InvalidPropertyException for invalid JSON", () => {
			const postContent = PostContent.make(makeValidProps()) as PostContent;

			expect(() => postContent.updateInfo("not-json")).toThrow(
				InvalidPropertyException,
			);
		});

		it("should throw InvalidPropertyException when info does not match schema", () => {
			const post = mockPost({
				type: mockPostType({ schema: { toString: () => infoSchema } } as never),
			});
			const postContent = PostContent.make(
				makeValidProps({ post, info: '{"readTime":5,"language":"pt-BR"}' }),
			) as PostContent;

			expect(() =>
				postContent.updateInfo('{"readTime":"not-a-number"}'),
			).toThrow(InvalidPropertyException);
		});
	});

	describe("getters", () => {
		it("should return the post reference", () => {
			const post = mockPost();
			const postContent = PostContent.make(makeValidProps({ post }));

			expect(postContent.post).toBe(post);
		});

		it("should return the content as string", () => {
			const content = "# Title\nParagraph.";
			const postContent = PostContent.make(makeValidProps({ content }));

			expect(postContent.content).toBe(content);
		});

		it("should return info as serialized JSON string", () => {
			const post = mockPost({
				type: mockPostType({ schema: { toString: () => infoSchema } } as never),
			});
			const postContent = PostContent.make(
				makeValidProps({ post, info: '{"readTime":5,"language":"pt-BR"}' }),
			);

			const parsed = JSON.parse(postContent.info);

			expect(parsed).toEqual({ readTime: 5, language: "pt-BR" });
		});
	});
});
