import { t } from "@roastery/terroir";

export const PostContentRepositoryProviderDTO = t.Union([
	t.Literal("PRISMA"),
	t.Literal("MEMORY"),
]);

export type PostContentRepositoryProviderDTO = t.Static<
	typeof PostContentRepositoryProviderDTO
>;
