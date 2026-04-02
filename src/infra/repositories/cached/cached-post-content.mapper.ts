import { Post } from "@roastery-capsules/post.post/domain";
import type {
	IPost,
	IUnpackedPost,
} from "@roastery-capsules/post.post/domain/types";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import type {
	IPostTag,
	IUnpackedPostTag,
} from "@roastery-capsules/post.post-tag/domain/types";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import type {
	IPostType,
	IUnpackedPostType,
} from "@roastery-capsules/post.post-type/domain/types";
import { PostContent } from "@/domain";
import type { IPostContent, IUnpackedPostContent } from "@/domain/types";

const GetPost = Symbol("CachedPostContentMapper::GetPost");
const GetTags = Symbol("CachedPostContentMapper::GetTags");
const GetType = Symbol("CachedPostContentMapper::GetType");

export const CachedPostContentMapper = {
	run: (data: string): IPostContent => {
		const {
			content,
			info,
			post: _post,
			...entityProps
		}: IUnpackedPostContent & {
			post: IUnpackedPost & {
				tags: IUnpackedPostTag[];
				type: IUnpackedPostType;
			};
		} = JSON.parse(data);

		const post = CachedPostContentMapper[GetPost](_post);

		return PostContent.make({ content, post, info }, entityProps);
	},
	[GetPost]: (
		data: IUnpackedPost & {
			tags: IUnpackedPostTag[];
			type: IUnpackedPostType;
		},
	): IPost => {
		const {
			name,
			slug,
			cover,
			description,
			tags: _tags,
			type: _type,
			...entityProps
		} = data;

		const tags = CachedPostContentMapper[GetTags](_tags);
		const type = CachedPostContentMapper[GetType](_type);

		return Post.make(
			{ name, slug, cover, tags, type, description },
			entityProps,
		);
	},
	[GetTags]: (data: IUnpackedPostTag[]): IPostTag[] => {
		return data.map(({ hidden, name, slug, ...properties }: IUnpackedPostTag) =>
			PostTag.make({ name, hidden, slug }, properties),
		);
	},
	[GetType]: (data: IUnpackedPostType): IPostType => {
		const { id, createdAt, updatedAt, ...properties } = data;
		return PostType.make(properties, { id, createdAt, updatedAt });
	},
} as const;
