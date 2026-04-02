import { EntitySource } from "@roastery/beans/entity/symbols";
import { ResourceAlreadyExistsException } from "@roastery/terroir/exceptions/application";
import type { CreatePostContentDTO } from "@/application/dtos";
import { PostContent } from "@/domain";
import type { IPostContent } from "@/domain/types";
import type { IPostContentWriter } from "@/domain/types/repositories";
import type {
	FindPostService,
	PostContentUniquenessCheckerService,
} from "../services";

export class CreatePostContentUseCase {
	public constructor(
		private readonly writer: IPostContentWriter,
		private readonly uniquenessChecker: PostContentUniquenessCheckerService,
		private readonly findPost: FindPostService,
	) {}

	public async run(data: CreatePostContentDTO): Promise<IPostContent> {
		const targetPost = await this.findPost.run(data.postId);

		const isUnique = await this.uniquenessChecker.run(data.postId);

		if (!isUnique)
			throw new ResourceAlreadyExistsException(PostContent[EntitySource]);

		const targetPostContent = PostContent.make({
			post: targetPost,
			content: data.content,
			info: data.info,
		});

		await this.writer.create(targetPostContent);

		return targetPostContent;
	}
}
