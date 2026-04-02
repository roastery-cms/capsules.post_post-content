import type {
    IPostRepository,
    IPostContentRepository,
} from "@/domain/types/repositories";

export interface IControllersWithoutAuth {
    postContentRepository: IPostContentRepository;
    postRepository: IPostRepository;
}
