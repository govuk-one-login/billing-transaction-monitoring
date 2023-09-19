import { HandlerCtx } from "../../handler-context";
import { Env } from "./types";
import {
  fetchS3,
  listS3Keys,
  // putTextS3
} from "../../shared/utils";

export const businessLogic = async (
  _: unknown,
  { env, logger }: HandlerCtx<Env, any, any>
): Promise<string[]> => {
  const keys = await listS3Keys(
    env.STORAGE_BUCKET,
    "btm_event_data/2005/02/28/"
  );
  for (const key of keys) {
    logger.info(`file key: ${key}`);
    const content = await fetchS3(env.STORAGE_BUCKET, key);
    logger.info(`file content: ${content}`);
  }

  return [];
};
