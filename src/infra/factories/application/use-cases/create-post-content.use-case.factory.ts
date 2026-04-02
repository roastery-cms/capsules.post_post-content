import { CreatePostContentUseCase } from "@/application/use-cases";
import type {
	IPostContentReader,
	IPostContentWriter,
	IPostRepository,
} from "@/domain/types/repositories";
import {
	makeFindPostService,
	makePostContentUniquenessCheckerService,
} from "../services";

export function makeCreatePostContentUseCase(
	writer: IPostContentWriter,
	reader: IPostContentReader,
	postRepository: IPostRepository,
): CreatePostContentUseCase {
	return new CreatePostContentUseCase(
		writer,
		makePostContentUniquenessCheckerService(reader),
		makeFindPostService(postRepository),
	);
}
