import type { IPostContent } from "@/domain/types";
import type { IPostContentRepository } from "@/domain/types/repositories";
import { CachedPostContentMapper } from "./cached-post-content.mapper";
import { PostContent } from "@/domain";
import { CACHE_EXPIRATION_TIME } from "@roastery/seedbed/constants";
import type { BaristaCacheInstance } from "@roastery-adapters/cache";
import { SafeCache } from "@roastery-adapters/cache/decorators";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { Mapper } from "@roastery/beans";

export class PostContentRepository implements IPostContentRepository {
    private cacheExpirationTime: number = CACHE_EXPIRATION_TIME.SAFE;

    constructor(
        private readonly repository: IPostContentRepository,
        private readonly cache: BaristaCacheInstance,
    ) {}

    @SafeCache(PostContent[EntitySource])
    async create(postContent: IPostContent): Promise<void> {
        await this.repository.create(postContent);

        await this.cachePostContent(postContent);
    }

    async findByPostId(postId: string): Promise<IPostContent | null> {
        const key = `${PostContent[EntitySource]}::post$${postId}`;
        const stored = await this.cache.get(key);

        if (stored) return CachedPostContentMapper.run(stored);

        const target = await this.repository.findByPostId(postId);

        if (!target) return null;

        await this.cachePostContent(target);

        return target;
    }

    @SafeCache(PostContent[EntitySource])
    async update(postContent: IPostContent): Promise<void> {
        await this.invalidatePostContentCache(postContent);

        await this.repository.update(postContent);

        await this.cachePostContent(postContent);
    }

    private async cachePostContent(postContent: IPostContent): Promise<void> {
        const dto = Mapper.toDTO(postContent);

        await this.cache.set(
            `${PostContent[EntitySource]}::post$${postContent.post.id}`,
            JSON.stringify(dto),
            "EX",
            this.cacheExpirationTime,
        );
    }

    private async invalidatePostContentCache(
        postContent: IPostContent,
    ): Promise<void> {
        await this.cache.del(
            `${PostContent[EntitySource]}::post$${postContent.post.id}`,
        );
    }
}
