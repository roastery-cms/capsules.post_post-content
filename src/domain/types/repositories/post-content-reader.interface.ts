import type { IPostContent } from "../post-content.interface";

export interface IPostContentReader {
    findByPostId(postId: string): Promise<IPostContent | null>;
}
