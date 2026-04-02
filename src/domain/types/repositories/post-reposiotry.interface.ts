import type { ICanReadId } from "@roastery/seedbed/domain/types/repositories";
import type { UnpackedPostSchema } from "@roastery-capsules/post.post/domain/schemas";
import type { IPost } from "@roastery-capsules/post.post/domain/types";

export interface IPostRepository
	extends ICanReadId<UnpackedPostSchema, IPost> {}
