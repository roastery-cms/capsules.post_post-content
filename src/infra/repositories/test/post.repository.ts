import type { IPost } from "@roastery-capsules/post.post/domain/types";
import type { IPostRepository } from "@/domain/types/repositories/post-reposiotry.interface";

export class PostRepository implements IPostRepository {
	private posts: Map<string, IPost>;

	constructor() {
		this.posts = new Map();
	}

	async findById(id: string): Promise<IPost | null> {
		return this.posts.get(id) ?? null;
	}

	seed(posts: IPost[]): void {
		for (const post of posts) {
			this.posts.set(post.id, post);
		}
	}

	clear(): void {
		this.posts.clear();
	}

	getAll(): IPost[] {
		return Array.from(this.posts.values());
	}

	count(): number {
		return this.posts.size;
	}
}
