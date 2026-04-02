import { UuidDTO } from "@roastery/beans/collections/dtos";
import { t } from "@roastery/terroir";

export const UpdatePostContentByPostIdParamsDTO = t.Object(
    { postId: UuidDTO },
    {
        description:
            "Data transfer object for updating post content by its associated post ID.",
    },
);

export type UpdatePostContentByPostIdParamsDTO = t.Static<
    typeof UpdatePostContentByPostIdParamsDTO
>;
