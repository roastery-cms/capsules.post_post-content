import { barista } from "@roastery/barista";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { baristaAuth } from "@roastery-capsules/auth/plugins/guards";
import { UpdatePostContentDTO } from "@/application/dtos";
import { PostContent } from "@/domain";
import { UnpackedPostContentDTO } from "@/domain/dtos";
import { makeUpdatePostContentByPostIdUseCase } from "@/infra/factories/application/use-cases";
import { PostContentRepositoryPlugin } from "../plugins";
import { UpdatePostContentByPostIdParamsDTO } from "./dtos";
import type { IControllersWithAuth } from "./types";

export function UpdatePostContentByPostIdController({
	cacheProvider,
	jwtSecret,
	postContentRepository,
	postRepository,
	redisUrl,
}: IControllersWithAuth) {
	return barista()
		.use(
			baristaAuth({
				cacheProvider,
				jwtSecret,
				layerName: PostContent[EntitySource],
				redisUrl,
			}),
		)
		.use(PostContentRepositoryPlugin(postContentRepository, postRepository))
		.derive({ as: "local" }, ({ postContentRepository }) => ({
			updatePostContentByPostId: makeUpdatePostContentByPostIdUseCase(
				postContentRepository,
				postContentRepository,
			),
		}))
		.patch(
			"/:postId",
			async ({
				params: { postId },
				body,
				updatePostContentByPostId,
				status,
			}) => {
				const response = await updatePostContentByPostId.run(postId, body);
				return status(200, response as never);
			},
			{
				params: UpdatePostContentByPostIdParamsDTO,
				body: UpdatePostContentDTO,
				detail: {
					summary: "Update post content by post ID",
					description:
						"Updates the content of a post by its unique post ID. The request body must include the fields to update. Authentication is required.",
				},
				response: { 200: UnpackedPostContentDTO },
			},
		);
}
