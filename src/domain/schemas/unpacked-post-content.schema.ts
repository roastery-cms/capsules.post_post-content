import { Schema } from "@roastery/terroir/schema";
import { UnpackedPostContentDTO } from "../dtos";

export const UnpackedPostContentSchema: Schema<typeof UnpackedPostContentDTO> =
	Schema.make<typeof UnpackedPostContentDTO>(UnpackedPostContentDTO);

export type UnpackedPostContentSchema = typeof UnpackedPostContentDTO;
