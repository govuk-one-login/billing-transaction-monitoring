import { HandlerCtx } from "../../handler-context";
import { Env } from "./types";

export const businessLogic = async (
  _: unknown,
  { env, logger }: HandlerCtx<Env, any, any>
): Promise<string[]> => {
//step1: look up synthetic event fig
//step2: for each config entry
  //step3: if now is within the entry time-range
  //step4: then collect a new synthetic event
//step5: return the events that we created
  return [];

}; 

