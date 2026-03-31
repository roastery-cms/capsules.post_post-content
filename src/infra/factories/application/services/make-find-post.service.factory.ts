import { FindPostService } from "@/application/services";
import type { IPostRepository } from "@/domain/types/repositories";

export function makeFindPostService(
	repository: IPostRepository,
): FindPostService {
	return new FindPostService(repository);
}
