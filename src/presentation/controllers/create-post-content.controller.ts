import type { IControllersWithAuth } from "./types";
import { barista } from "@roastery/barista";
import { baristaAuth } from "@roastery-capsules/auth/plugins/guards";
import { PostContent } from "@/domain";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { PostContentRepositoryPlugin } from "../plugins";
import { makeCreatePostContentUseCase } from "@/infra/factories/application/use-cases";
import { CreatePostContentDTO } from "@/application/dtos";
import { UnpackedPostContentDTO } from "@/domain/dtos";

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
            .use(
                PostContentRepositoryPlugin(
                    postContentRepository,
                    postRepository,
                ),
            )
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
