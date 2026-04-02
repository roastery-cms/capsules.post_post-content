import { parsePrismaDateTimeToISOString } from "@roastery-adapters/post/helpers";
import { Post } from "@roastery-capsules/post.post/domain";
import type { IPost } from "@roastery-capsules/post.post/domain/types";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";
import { PostContent } from "@/domain";
import type { IPostContent } from "@/domain/types";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

export type PostContentPrismaDefaultOutput = {
	id: string;
	createdAt: Date;
	updatedAt: Date | null;
	content: string;
	info: JsonValue;
	post: {
		id: string;
		createdAt: Date;
		updatedAt: Date | null;
		name: string;
		slug: string;
		description: string;
		cover: string;
		postType: {
			id: string;
			createdAt: Date;
			updatedAt: Date | null;
			name: string;
			slug: string;
			schema: string;
			isHighlighted: boolean;
		};
		tags: {
			id: string;
			createdAt: Date;
			updatedAt: Date | null;
			name: string;
			slug: string;
			hidden: boolean;
		}[];
	};
};

const GetPost = Symbol("PrismaPostContentMapper::GetPost");
const GetTags = Symbol("PrismaPostContentMapper::GetTags");
const GetType = Symbol("PrismaPostContentMapper::GetType");

export const PrismaPostContentMapper = {
	run: (_data: PostContentPrismaDefaultOutput): IPostContent => {
		const { post: _post, ..._properties } = _data;
		const data = _properties;

		const post = PrismaPostContentMapper[GetPost](_post);

		const {
			content,
			info: _info,
			...properties
		} = parsePrismaDateTimeToISOString(data);

		const info = JSON.stringify(_info);

		return PostContent.make({ content, post, info }, properties);
	},

	[GetPost]: (_data: PostContentPrismaDefaultOutput["post"]): IPost => {
		const { tags: _tags, postType: _postType, ..._properties } = _data;

		const tags = PrismaPostContentMapper[GetTags](_tags);
		const type = PrismaPostContentMapper[GetType](_postType);

		const { name, cover, description, slug, ...properties } =
			parsePrismaDateTimeToISOString(_properties);

		return Post.make(
			{ tags, type, name, description, cover, slug },
			properties,
		);
	},

	[GetTags]: (
		data: PostContentPrismaDefaultOutput["post"]["tags"],
	): IPostTag[] => {
		return data.map((tag) => {
			const { name, hidden, slug, ...properties } =
				parsePrismaDateTimeToISOString(tag);

			return PostTag.make({ name, hidden, slug }, properties);
		});
	},

	[GetType]: (
		data: PostContentPrismaDefaultOutput["post"]["postType"],
	): IPostType => {
		const { isHighlighted, name, schema, slug, ...properties } =
			parsePrismaDateTimeToISOString(data);

		return PostType.make({ isHighlighted, name, schema, slug }, properties);
	},
};
