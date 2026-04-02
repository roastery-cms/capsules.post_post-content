import { EntitySource } from "@roastery/beans/entity/symbols";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/infra";
import type { BaristaCacheInstance } from "@roastery-adapters/cache";
import type { PrismaClient } from "@roastery-adapters/post";
import { PostContent } from "@/domain";
import type { IPostContentRepository } from "@/domain/types/repositories";
import { PostContentRepository as CachedPostContentRepository } from "@/infra/repositories/cached";
import { PostContentRepository as PrismaPostContentRepository } from "@/infra/repositories/prisma";
import { PostContentRepository as TestPostContentRepository } from "@/infra/repositories/test";
import type { PostContentRepositoryProviderDTO } from "./dtos";

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
