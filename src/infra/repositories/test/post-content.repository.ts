import { EntitySource } from "@roastery/beans/entity/symbols";
import {
	ConflictException,
	ResourceNotFoundException,
} from "@roastery/terroir/exceptions/infra";
import { PostContent } from "@/domain/post-content";
import type { IPostContent } from "@/domain/types/post-content.interface";
import type { IPostContentRepository } from "@/domain/types/repositories/post-content.repository-interface";

export class PostContentRepository implements IPostContentRepository {
	private contents: Map<string, IPostContent>;

	constructor() {
		this.contents = new Map();
	}

	async create(postContent: IPostContent): Promise<void> {
		if (this.contents.has(postContent.id)) {
			throw new ConflictException(PostContent[EntitySource]);
		}

		this.contents.set(postContent.id, postContent);
	}

	async findByPostId(postId: string): Promise<IPostContent | null> {
		for (const content of this.contents.values()) {
			if (content.post.id === postId) {
				return content;
			}
		}
		return null;
	}

	async update(postContent: IPostContent): Promise<void> {
		if (!this.contents.has(postContent.id)) {
			throw new ResourceNotFoundException(PostContent[EntitySource]);
		}

		this.contents.set(postContent.id, postContent);
	}

	seed(contents: IPostContent[]): void {
		for (const content of contents) {
			this.contents.set(content.id, content);
		}
	}

	clear(): void {
		this.contents.clear();
	}

	getAll(): IPostContent[] {
		return Array.from(this.contents.values());
	}

	count(): number {
		return this.contents.size;
	}
}
