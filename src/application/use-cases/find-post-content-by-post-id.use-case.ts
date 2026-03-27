import { PostContent } from "@/domain";
import type { IPostContent } from "@/domain/types";
import type { IPostContentReader } from "@/domain/types/repositories";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";

export class FindPostContentByPostIdUseCase {
    public constructor(private readonly reader: IPostContentReader) {}

    public async run(postId: string): Promise<IPostContent> {
        const targetPostContent = await this.reader.findByPostId(postId);

        if (!targetPostContent)
            throw new ResourceNotFoundException(PostContent[EntitySource]);

        return targetPostContent;
    }
}
