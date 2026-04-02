import { UuidDTO } from "@roastery/beans/collections/dtos";
import { t } from "@roastery/terroir";

export const FindPostContentByPostIdDTO = t.Object(
    { postId: UuidDTO },
    {
        description:
            "Data transfer object for finding post content by its associated post ID.",
    },
);

export type FindPostContentByPostIdDTO = t.Static<
    typeof FindPostContentByPostIdDTO
>;
