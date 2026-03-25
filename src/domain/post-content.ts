import { Entity } from "@roastery/beans";
import { UnpackedPostContentSchema } from "./schemas";
import type {
	IConstructorPostContent,
	IPostContent,
	IRawPostContent,
} from "./types";
import type { IPost } from "@roastery-capsules/post.post/domain/types";
import {
	EntityContext,
	EntitySchema,
	EntitySource,
	EntityStorage,
} from "@roastery/beans/entity/symbols";
import type { Schema } from "@roastery/terroir/schema";
import { DefinedStringVO } from "@roastery/beans/collections/value-objects";
import { AutoUpdate } from "@roastery/beans/entity/decorators";
import type { EntityDTO } from "@roastery/beans/entity/dtos";
import { makeEntity } from "@roastery/beans/entity/factories";
import { ValidInfoVO } from "./value-objects";

export class PostContent
	extends Entity<UnpackedPostContentSchema>
	implements IPostContent
{
	public override readonly [EntitySource]: string = "post@post-content";
	public static readonly [EntitySource]: string = "post@post-content";
	public override readonly [EntitySchema]: Schema<UnpackedPostContentSchema> =
		UnpackedPostContentSchema;

	private _post: IPost;
	private _content: DefinedStringVO;
	private _info: ValidInfoVO;

	private constructor(
		{ content, post, info }: IRawPostContent,
		entityProps: EntityDTO,
	) {
		super(entityProps);
		this[EntityStorage].set("schema", post.type.schema.toString());

		this._post = post;
		this._info = ValidInfoVO.make(
			info,
			this[EntityContext]("info"),
			this[EntityStorage].get("schema")!,
		);
		this._content = DefinedStringVO.make(
			content,
			this[EntityContext]("content"),
		);
	}

	public static make(
		{ content, post, info }: IConstructorPostContent,
		entityProps?: EntityDTO,
	): IPostContent {
		return new PostContent(
			{ content, post, info: info ?? "{}" },
			entityProps ?? makeEntity(),
		);
	}

	public get post(): IPost {
		return this._post;
	}

	public get content(): DefinedStringVO["value"] {
		return this._content.value;
	}

	public get info(): string {
		return (
			this[EntityStorage].get("info") ??
			(() => {
				this[EntityStorage].set("info", JSON.stringify(this._info.value));
				return this[EntityStorage].get("info")!;
			})()
		);
	}

	@AutoUpdate
	updateContent(value: string): void {
		this._content = DefinedStringVO.make(value, this[EntityContext]("content"));
	}

	@AutoUpdate
	updateInfo(value: string): void {
		this[EntityStorage].del("info");

		this._info = ValidInfoVO.make(
			value,
			this[EntityContext]("info"),
			this[EntityStorage].get("schema")!,
		);
	}
}
