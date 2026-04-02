import type { IPostRepository } from "@/domain/types/repositories";
import { PostRepository as ApiPostRepository } from "@/infra/repositories/api";
import { PostRepository as TestPostRepository } from "@/infra/repositories/test";
import type { AggregatesRepositoryProviderDTO } from "./dtos";

type MakePostTagRepositoryArgs = {
	target?: AggregatesRepositoryProviderDTO;
	baseUrl: string;
};

export function makePostRepository({
	baseUrl,
	target,
}: MakePostTagRepositoryArgs): IPostRepository {
	const actions: Record<NonNullable<typeof target>, () => IPostRepository> = {
		API: () => new ApiPostRepository(baseUrl),
		MEMORY: () => new TestPostRepository(),
	};

	if (!target) return actions.MEMORY();

	return actions[target]();
}
