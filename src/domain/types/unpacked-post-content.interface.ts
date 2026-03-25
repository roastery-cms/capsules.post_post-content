import type { IRawEntity } from "@roastery/beans/entity/types";
import type { IRawPostContent } from "./raw-post-content.interface";

export interface IUnpackedPostContent extends IRawPostContent, IRawEntity {}
