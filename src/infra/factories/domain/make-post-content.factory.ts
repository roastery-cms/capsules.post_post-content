import type { IPost } from "@roastery-capsules/post.post/domain/types";
import { PostContent } from "@/domain";
import type { IPostContent } from "@/domain/types";

export function makePostContent(
	post: IPost,
	content = "empty",
	info?: string,
): IPostContent {
	return PostContent.make({ post, content, info });
}
