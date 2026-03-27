import type { IPostContentWriter } from "@/domain/types/repositories";
import type {
    PostContentUniquenessCheckerService,
    FindPostService,
} from "../services";
import type { CreatePostContentDTO } from "@/application/dtos";
import type { IPostContent } from "@/domain/types";
import { ResourceAlreadyExistsException } from "@roastery/terroir/exceptions/application";
import { PostContent } from "@/domain";
import { EntitySource } from "@roastery/beans/entity/symbols";

export class CreatePostContentUseCase {
    public constructor(
        private readonly writer: IPostContentWriter,
        private readonly uniquenessChecker: PostContentUniquenessCheckerService,
        private readonly findPost: FindPostService,
    ) {}

    public async run(data: CreatePostContentDTO): Promise<IPostContent> {
        const targetPost = await this.findPost.run(data.postId);

        const isUnique = await this.uniquenessChecker.run(data.postId);

        if (!isUnique)
            throw new ResourceAlreadyExistsException(PostContent[EntitySource]);

        const targetPostContent = PostContent.make({
            post: targetPost,
            content: data.content,
            info: data.info,
        });

        await this.writer.create(targetPostContent);

        return targetPostContent;
    }
}
