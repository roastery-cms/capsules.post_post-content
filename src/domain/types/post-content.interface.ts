import type { IEntity } from "@roastery/beans/entity/types";
import type { UnpackedPostContentSchema } from "../schemas";
import type { IRawPostContent } from "./raw-post-content.interface";

export interface IPostContent
	extends IEntity<UnpackedPostContentSchema>,
		IRawPostContent {
	updateContent(value: string): void;
	updateInfo(value: string): void;
}
