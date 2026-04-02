import { UpdatePostContentByPostIdUseCase } from "@/application/use-cases";
import type {
	IPostContentReader,
	IPostContentWriter,
} from "@/domain/types/repositories";
import { makeFindPostContentByPostIdUseCase } from "./find-post-content-by-post-id.use-case.factory";

export function makeUpdatePostContentByPostIdUseCase(
	writer: IPostContentWriter,
	reader: IPostContentReader,
): UpdatePostContentByPostIdUseCase {
	return new UpdatePostContentByPostIdUseCase(
		writer,
		makeFindPostContentByPostIdUseCase(reader),
	);
}
