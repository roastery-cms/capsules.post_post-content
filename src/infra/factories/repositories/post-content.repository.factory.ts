import type { BaristaCacheInstance } from "@roastery-adapters/cache";
import type { PostContentRepositoryProviderDTO } from "./dtos";
import type { PrismaClient } from "@roastery-adapters/post";
import type { IPostContentRepository } from "@/domain/types/repositories";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/infra";
import { PostContent } from "@/domain";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { PostContentRepository as PrismaPostContentRepository } from "@/infra/repositories/prisma";
import { PostContentRepository as TestPostContentRepository } from "@/infra/repositories/test";
import { PostContentRepository as CachedPostContentRepository } from "@/infra/repositories/cached";

type MakePostContentRepositoryArgs = {
    target?: PostContentRepositoryProviderDTO;
    cache: BaristaCacheInstance;
    prismaClient?: PrismaClient;
};

export function makePostContentRepository({
    cache,
    prismaClient,
    target,
}: MakePostContentRepositoryArgs): IPostContentRepository {
    if (target === "PRISMA" && !prismaClient)
        throw new ResourceNotFoundException(PostContent[EntitySource]);

    const repository =
        target === "PRISMA" && prismaClient
            ? new PrismaPostContentRepository(prismaClient)
            : new TestPostContentRepository();

    return new CachedPostContentRepository(repository, cache);
}
