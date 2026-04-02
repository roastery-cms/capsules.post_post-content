import { barista } from "@roastery/barista";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { baristaAuth } from "@roastery-capsules/auth/plugins/guards";
import { CreatePostContentDTO } from "@/application/dtos";
import { PostContent } from "@/domain";
import { UnpackedPostContentDTO } from "@/domain/dtos";
import { makeCreatePostContentUseCase } from "@/infra/factories/application/use-cases";
import { PostContentRepositoryPlugin } from "../plugins";
import type { IControllersWithAuth } from "./types";

export function CreatePostContentController({
	cacheProvider,
	jwtSecret,
	postContentRepository,
	postRepository,
	redisUrl,
}: IControllersWithAuth) {
	return barista().use(
		baristaAuth({
			cacheProvider,
			jwtSecret,
			layerName: PostContent[EntitySource],
			redisUrl,
		})
			.use(PostContentRepositoryPlugin(postContentRepository, postRepository))
			.derive(
				{ as: "local" },
				({ postContentRepository, postRepositoryForPostContent }) => ({
					createPostContent: makeCreatePostContentUseCase(
						postContentRepository,
						postContentRepository,
						postRepositoryForPostContent,
					),
				}),
			)
			.post(
				"/",
				async ({ body, createPostContent, status }) => {
					const response = await createPostContent.run(body);
					return status(201, response as never);
				},
				{
					body: CreatePostContentDTO,
					detail: {
						summary: "Create a new post content",
						description:
							"Creates a new post content resource. The request body must include the post ID, content, and info metadata. Authentication is required.",
					},
					response: { 201: UnpackedPostContentDTO },
				},
			),
	);
}
