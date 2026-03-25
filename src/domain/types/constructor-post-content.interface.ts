import type { IPost } from "@roastery-capsules/post.post/domain/types";

export interface IConstructorPostContent {
	readonly post: IPost;
	readonly content: string;
	readonly info?: string;
}
