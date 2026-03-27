import { t } from "@roastery/terroir";

export const UpdatePostContentDTO = t.Object(
    {
        content: t.Optional(
            t.String({
                description:
                    "The main body content of the post, typically in Markdown format.",
                examples: [
                    `# @roastery-capsules/post.post-content\n\nPost content management capsule for the [Roastery CMS](https://github.com/roastery-cms) ecosystem.`,
                ],
                minLength: 1,
            }),
        ),
        info: t.Optional(
            t.String({
                format: "json",
                description:
                    "Serialized JSON string containing additional metadata based on the post type schema.",
                examples: ['{"readTime":5,"language":"pt-BR"}'],
                minLength: 2,
            }),
        ),
    },
    {
        description:
            "Data transfer object for updating an existing post content, containing optional fields for partial post content modification.",
    },
);

export type UpdatePostContentDTO = t.Static<typeof UpdatePostContentDTO>;
