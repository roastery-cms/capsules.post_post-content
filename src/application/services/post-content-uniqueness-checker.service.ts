import type { IPostContentReader } from "@/domain/types/repositories";

export class PostContentUniquenessCheckerService {
    public constructor(private readonly reader: IPostContentReader) {}

    public async run(id: string): Promise<boolean> {
        const targetPostContent = await this.reader.findByPostId(id);

        return !targetPostContent;
    }
}
