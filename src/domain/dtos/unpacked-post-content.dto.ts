import { EntityDTO } from "@roastery/beans/entity/dtos";
import { t } from "@roastery/terroir";
import { UnpackedPostDTO } from "@roastery-capsules/post.post/domain/dtos";

export const UnpackedPostContentDTO = t.Composite(
	[
		t.Object(
			{
				post: UnpackedPostDTO,
				content: t.String({
					description:
						"The main body content of the post, typically in Markdown format.",
					examples: [
						`# @roastery-capsules/post.post-tag\n\nPost tag management capsule for the [Roastery CMS](https://github.com/roastery-cms) ecosystem.`,
					],
					minLength: 1,
				}),
				info: t.String({
					description:
						"Serialized JSON string containing additional metadata based on the post type schema.",
					examples: ['{"readTime":5,"language":"pt-BR"}'],
					minLength: 1,
				}),
			},
			{
				description:
					"Data transfer object used for building a post content entity.",
			},
		),
		EntityDTO,
	],
	{
		description:
			"Data transfer object used for building a post content entity.",
	},
);

export type UnpackedPostContentDTO = t.Static<typeof UnpackedPostContentDTO>;
