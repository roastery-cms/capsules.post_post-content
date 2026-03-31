import { FindPostContentByPostIdUseCase } from "@/application/use-cases";
import type { IPostContentReader } from "@/domain/types/repositories";

export function makeFindPostContentByPostIdUseCase(
	reader: IPostContentReader,
): FindPostContentByPostIdUseCase {
	return new FindPostContentByPostIdUseCase(reader);
}
