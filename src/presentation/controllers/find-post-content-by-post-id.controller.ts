import { barista } from "@roastery/barista";
import { UnpackedPostContentDTO } from "@/domain/dtos";
import { makeFindPostContentByPostIdUseCase } from "@/infra/factories/application/use-cases";
import { PostContentRepositoryPlugin } from "../plugins";
import { FindPostContentByPostIdDTO } from "./dtos";
import type { IControllersWithoutAuth } from "./types";

export function FindPostContentByPostIdController({
	postContentRepository,
	postRepository,
}: IControllersWithoutAuth) {
	return barista()
		.use(PostContentRepositoryPlugin(postContentRepository, postRepository))
		.derive({ as: "local" }, ({ postContentRepository }) => ({
			findPostContentByPostId: makeFindPostContentByPostIdUseCase(
				postContentRepository,
			),
		}))
		.get(
			"/:postId",
			async ({ params: { postId }, findPostContentByPostId, status }) => {
				const response = await findPostContentByPostId.run(postId);
				return status(200, response as never);
			},
			{
				params: FindPostContentByPostIdDTO,
				detail: {
					summary: "Find post content by post ID",
					description:
						"Retrieves the content of a post by its unique post ID. No authentication is required.",
				},
				response: { 200: UnpackedPostContentDTO },
			},
		);
}
