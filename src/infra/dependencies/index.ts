import { t } from "@roastery/terroir";
import { PostContentRepositoryProviderDTO } from "@/infra/factories/repositories/dtos";
import { UrlDTO } from "@roastery/beans/collections/dtos";

export const PostContentDependenciesDTO = t.Object({
    DATABASE_URL: t.Optional(t.String()),
    DATABASE_PROVIDER: t.Optional(PostContentRepositoryProviderDTO),
    POST_BASE_URL: t.Optional(UrlDTO),
});

export type PostContentDependenciesDTO = t.Static<
    typeof PostContentDependenciesDTO
>;
