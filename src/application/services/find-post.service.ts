import { PostContent } from "@/domain";
import type { IPostRepository } from "@/domain/types/repositories";
import type { IPost } from "@roastery-capsules/post.post/domain/types";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";

export class FindPostService {
    public constructor(private readonly repository: IPostRepository) {}

    public async run(id: string): Promise<IPost> {
        const targetTag = await this.repository.findById(id);

        if (!targetTag)
            throw new ResourceNotFoundException(
                `${PostContent[EntitySource]}::post->${id}`,
            );

        return targetTag;
    }
}
