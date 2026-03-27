import type { IPostContentReader } from "./post-content-reader.interface";
import type { IPostContentWriter } from "./post-content-writer.interface";

export interface IPostContentRepositor extends IPostContentWriter, IPostContentReader { }
