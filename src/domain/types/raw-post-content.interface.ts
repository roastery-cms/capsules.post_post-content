import type { IPost } from "@roastery-capsules/post.post/domain/types";

export interface IRawPostContent {
	readonly post: IPost;
	readonly content: string;
	readonly info: string;
}
