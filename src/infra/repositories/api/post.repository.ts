import type { IPostRepository } from "@/domain/types/repositories";
import type { IPost } from "@roastery-capsules/post.post/domain/types";
import type { PostRoutes } from "@roastery-capsules/post.post/presentation/routes";
import { treaty } from "@elysiajs/eden";
import { ApiPostMapper } from "./api-post.mapper";

export class PostRepository implements IPostRepository {
    private readonly postService: ReturnType<
        typeof treaty<PostRoutes>
    >["posts"];

    public constructor(baseUrl: string) {
        this.postService = treaty<PostRoutes>(baseUrl, {
            parseDate: false,
        }).posts;
    }

    async findById(id: string): Promise<IPost | null> {
        const { data, error, status } = await this.postService({
            "id-or-slug": id,
        }).get();

        if (error) throw error.value;
        if (status !== 200) return null;

        return ApiPostMapper.run(data);
    }
}
