import { barista } from "@roastery/barista";
import type {
	IPostContentRepository,
	IPostRepository,
} from "@/domain/types/repositories";

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
