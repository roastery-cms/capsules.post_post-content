import { Post } from "@roastery-capsules/post.post/domain";
import type { IPost } from "@roastery-capsules/post.post/domain/types";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";

type Args = {
	updatedAt?: string | undefined;
	tags: {
		updatedAt?: string | undefined;
		name: string;
		slug: string;
		id: string;
		createdAt: string;
		hidden: boolean;
	}[];
	description: string;
	name: string;
	slug: string;
	cover: string;
	type: {
		updatedAt?: string | undefined;
		name: string;
		slug: string;
		id: string;
		createdAt: string;
		schema: string;
		isHighlighted: boolean;
	};
	id: string;
	createdAt: string;
};

const GetTags = Symbol("ApiPostMapper::GetTags");
const GetType = Symbol("ApiPostMapper::GetType");

export const ApiPostMapper = {
	run: (data: Args): IPost => {
		const { tags: _tags, type: _type, ..._post } = data;

		const tags = ApiPostMapper[GetTags](_tags);
		const type = ApiPostMapper[GetType](_type);

		const { cover, description, name, slug, ...properties } = _post;

		return Post.make(
			{ name, cover, description, slug, tags, type },
			properties,
		);
	},

	[GetTags]: (data: Args["tags"]): IPostTag[] => {
		return data.map((tag) => {
			const { name, slug, hidden, ...properties } = tag;

			return PostTag.make({ name, slug, hidden }, properties);
		});
	},

	[GetType]: (data: Args["type"]): IPostType => {
		const { isHighlighted, name, schema, slug, ...properties } = data;

		return PostType.make({ isHighlighted, name, schema, slug }, properties);
	},
} as const;
