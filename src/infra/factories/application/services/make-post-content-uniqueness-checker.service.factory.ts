import { PostContentUniquenessCheckerService } from "@/application/services";
import type { IPostContentReader } from "@/domain/types/repositories";

export function makePostContentUniquenessCheckerService(
	reader: IPostContentReader,
): PostContentUniquenessCheckerService {
	return new PostContentUniquenessCheckerService(reader);
}
