import type { IPostContentWriter } from "@/domain/types/repositories";
import type { FindPostContentByPostIdUseCase } from "./find-post-content-by-post-id.use-case";
import type { IPostContent } from "@/domain/types";
import type { UpdatePostContentDTO } from "@/application/dtos";

export class UpdatePostContentByPostIdUseCase {
    public constructor(
        private readonly writer: IPostContentWriter,
        private readonly findPostContentByPostId: FindPostContentByPostIdUseCase,
    ) {}

    public async run(
        postId: string,
        { info, content }: UpdatePostContentDTO,
    ): Promise<IPostContent> {
        const targetPostContent =
            await this.findPostContentByPostId.run(postId);

        if (info) targetPostContent.updateInfo(info);
        if (content) targetPostContent.updateContent(content);

        await this.writer.update(targetPostContent);

        return targetPostContent;
    }
}
