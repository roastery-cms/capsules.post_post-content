import type { IPostContent } from "@/domain/types";
import type { IPost } from "@roastery-capsules/post.post/domain/types";
import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";
import { parsePrismaDateTimeToISOString } from "@roastery-adapters/post/helpers";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import { Post } from "@roastery-capsules/post.post/domain";
import { PostContent } from "@/domain";

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

export class PrismaPostContentMapper {
    public static run(_data: PostContentPrismaDefaultOutput): IPostContent {
        const { post: _post, ..._properties } = _data;
        const data = _properties;

        const post = PrismaPostContentMapper.getPost(_post);

        const {
            content,
            info: _info,
            ...properties
        } = parsePrismaDateTimeToISOString(data);

        const info = JSON.stringify(_info);

        return PostContent.make({ content, post, info }, properties);
    }

    private static getPost(
        _data: PostContentPrismaDefaultOutput["post"],
    ): IPost {
        const { tags: _tags, postType: _postType, ..._properties } = _data;

        const tags = PrismaPostContentMapper.getPostTags(_tags);
        const type = PrismaPostContentMapper.getPostType(_postType);

        const { name, cover, description, slug, ...properties } =
            parsePrismaDateTimeToISOString(_properties);

        return Post.make(
            { tags, type, name, description, cover, slug },
            properties,
        );
    }

    private static getPostTags(
        data: PostContentPrismaDefaultOutput["post"]["tags"],
    ): IPostTag[] {
        return data.map((tag) => {
            const { name, hidden, slug, ...properties } =
                parsePrismaDateTimeToISOString(tag);

            return PostTag.make({ name, hidden, slug }, properties);
        });
    }

    private static getPostType(
        data: PostContentPrismaDefaultOutput["post"]["postType"],
    ): IPostType {
        const { isHighlighted, name, schema, slug, ...properties } =
            parsePrismaDateTimeToISOString(data);

        return PostType.make({ isHighlighted, name, schema, slug }, properties);
    }
}
