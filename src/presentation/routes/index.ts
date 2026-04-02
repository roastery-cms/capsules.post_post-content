import { barista } from "@roastery/barista";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { PostContent } from "@/domain";
import {
	CreatePostContentController,
	FindPostContentByPostIdController,
	UpdatePostContentByPostIdController,
} from "@/presentation/controllers";
import type {
	IControllersWithAuth,
	IControllersWithoutAuth,
} from "@/presentation/controllers/types";
import { PostContentTags } from "@/presentation/tags";

type PostContentRoutesArgs = IControllersWithAuth;

export function PostContentRoutes(data: PostContentRoutesArgs) {
	const { postContentRepository, postRepository } = data;
	const controllersWithoutArgs: IControllersWithoutAuth = {
		postContentRepository,
		postRepository,
	};

	return barista({
		prefix: "/post-contents",
		detail: {
			tags: [PostContentTags.name],
			description: PostContentTags.description,
		},
		name: PostContent[EntitySource],
	})
		.use(CreatePostContentController(data))
		.use(UpdatePostContentByPostIdController(data))
		.use(FindPostContentByPostIdController(controllersWithoutArgs));
}

export type PostContentRoutes = ReturnType<typeof PostContentRoutes>;
