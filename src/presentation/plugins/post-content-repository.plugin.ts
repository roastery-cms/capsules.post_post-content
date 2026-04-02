import type {
    IPostRepository,
    IPostContentRepository,
} from "@/domain/types/repositories";
import { barista } from "@roastery/barista";

export function PostContentRepositoryPlugin(
    postContentRepository: IPostContentRepository,
    postRepository: IPostRepository,
) {
    return barista({
        name: "postContentRepository",
    })
        .decorate("postContentRepository", postContentRepository)
        .decorate("postRepositoryForPostContent", postRepository);
}
