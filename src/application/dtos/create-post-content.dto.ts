import { UuidDTO } from "@roastery/beans/collections/dtos";
import { t } from "@roastery/terroir";

export const CreatePostContentDTO = t.Object(
    {
        postId: UuidDTO,
        content: t.String({
            description:
                "The main body content of the post, typically in Markdown format.",
            examples: [
                `# @roastery-capsules/post.post-tag\n\nPost tag management capsule for the [Roastery CMS](https://github.com/roastery-cms) ecosystem.`,
            ],
            minLength: 1,
        }),
        info: t.String({
            format: "json",
            description:
                "Serialized JSON string containing additional metadata based on the post type schema.",
            examples: ['{"readTime":5,"language":"pt-BR"}'],
            minLength: 2,
        }),
    },
    {
        description:
            "Data transfer object for creating a new post content, containing all required fields for post content creation.",
    },
);

export type CreatePostContentDTO = t.Static<typeof CreatePostContentDTO>;
