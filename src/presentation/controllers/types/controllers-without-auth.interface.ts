import type {
	IPostContentRepository,
	IPostRepository,
} from "@/domain/types/repositories";

export interface IControllersWithoutAuth {
	postContentRepository: IPostContentRepository;
	postRepository: IPostRepository;
}
