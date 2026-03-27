import type { UnpackedPostSchema } from "@roastery-capsules/post.post/domain/schemas";
import type { IPost } from "@roastery-capsules/post.post/domain/types";
import type { ICanReadId } from "@roastery/seedbed/domain/types/repositories";

export interface IPostRepository extends ICanReadId<UnpackedPostSchema, IPost> { }
