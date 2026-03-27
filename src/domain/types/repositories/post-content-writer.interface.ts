import type { IPostContent } from "../post-content.interface";

export interface IPostContentWriter {
    create(postContent: IPostContent): Promise<void>;
    update(postContent: IPostContent): Promise<void>;
}
