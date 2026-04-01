import { PostContent } from "@/domain";
import type { IPostContent } from "@/domain/types";
import type { IPostContentRepository } from "@/domain/types/repositories";
import { SafePrisma } from "@roastery-adapters/post/decorators";
import type { PrismaClient } from "@roastery-adapters/post";
import { EntitySource } from "@roastery/beans/entity/symbols";
import {
    PrismaPostContentMapper,
    type PostContentPrismaDefaultOutput,
} from "./prisma-post-content.mapper";

export class PostContentRepository implements IPostContentRepository {
    public constructor(private readonly prisma: PrismaClient) {}

    @SafePrisma(PostContent[EntitySource])
    async create(postContent: IPostContent): Promise<void> {
        const {
            post: { id: postId },
            content,
            createdAt,
            id,
            info,
        } = postContent;

        await this.prisma.postContent.create({
            data: { postId, content, createdAt, id, info },
        });
    }

    @SafePrisma(PostContent[EntitySource])
    async update(postContent: IPostContent): Promise<void> {
        const {
            post: { id: postId },
            updatedAt,
            content,
            info,
        } = postContent;

        await this.prisma.postContent.update({
            where: { postId },
            data: { updatedAt, content, info },
        });
    }

    @SafePrisma(PostContent[EntitySource])
    async findByPostId(postId: string): Promise<IPostContent | null> {
        const targetPostContent = await this.prisma.postContent.findUnique({
            where: { postId },
            select: {
                content: true,
                createdAt: true,
                id: true,
                info: true,
                updatedAt: true,
                post: {
                    select: {
                        cover: true,
                        createdAt: true,
                        updatedAt: true,
                        description: true,
                        id: true,
                        name: true,
                        slug: true,
                        postType: {
                            select: {
                                id: true,
                                createdAt: true,
                                updatedAt: true,
                                isHighlighted: true,
                                name: true,
                                slug: true,
                                schema: true,
                            },
                        },
                        tags: {
                            select: {
                                id: true,
                                createdAt: true,
                                updatedAt: true,
                                name: true,
                                slug: true,
                                hidden: true,
                            },
                        },
                    },
                },
            },
        });

        if (!targetPostContent) return null;

        return PrismaPostContentMapper.run(
            targetPostContent as unknown as PostContentPrismaDefaultOutput,
        );
    }
}
