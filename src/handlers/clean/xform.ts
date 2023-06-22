import { JSONPath } from "jsonpath-plus";
import { isEqual } from "lodash";
import { Logger } from "@aws-lambda-powertools/logger";

type Primitive = boolean | null | number | string;

type PathCommand = ["!Path", unknown];
type EqualsCommand = ["!Equals", unknown, unknown];
type NotCommand = ["!Not", unknown];
type IfCommand = ["!If", unknown, unknown, unknown];
type OrCommand = ["!Or", unknown, unknown, unknown];

export type Command =
  | PathCommand
  | EqualsCommand
  | NotCommand
  | IfCommand
  | OrCommand;

type Config<TKey extends string | number | symbol> = Record<
  TKey,
  Primitive | Record<string, unknown> | unknown[]
>;

type CommandKeyword = "!Path" | "!Equals" | "!Not" | "!If" | "!Or";
const commands: CommandKeyword[] = ["!Path", "!Equals", "!Not", "!If", "!Or"];
const isCommandKeyword = (value: unknown): value is CommandKeyword =>
  typeof value === "string" && commands.includes(value as CommandKeyword);

const commandLengthMap: Record<CommandKeyword, number> = {
  "!Path": 2,
  "!Equals": 3,
  "!Not": 2,
  "!If": 4,
  "!Or": 3,
};

const isCorrectlyFormedCommand = (
  value: unknown[],
  logger?: Logger
): boolean => {
  if (!isCommandKeyword(value[0])) return false;
  const res = value.length === commandLengthMap[value[0]];

  if (!res)
    (logger ?? console).warn(
      `It looks like you tried to use a ${value[0]} command but you provided ${
        value.length - 1
      } arguments. The ${value[0]} command expects ${
        commandLengthMap[value[0]] - 1
      } arguments.`
    );
  return res;
};

const isCommand = (value: unknown, logger?: Logger): value is Command =>
  Array.isArray(value) && isCorrectlyFormedCommand(value, logger);

const doCommand = (
  command: unknown,
  thing: unknown,
  logger?: Logger
): unknown => {
  if (!isCommand(command, logger)) return command;
  switch (command[0]) {
    case "!Path": {
      const query = doCommand(command[1], thing);
      if (typeof query !== "string")
        throw new Error(
          "Attempted to invoke jsonpath query with a query that was not a string"
        );
      return JSONPath({
        path: query,
        json: thing as string | number | boolean | object | any[] | null,
      });
    }
    case "!Equals":
      return isEqual(
        doCommand(command[1], thing),
        doCommand(command[2], thing)
      );
    case "!Not":
      return !doCommand(command[1], thing);
    case "!If": {
      const condition = doCommand(command[1], thing);
      return condition
        ? doCommand(command[2], thing)
        : doCommand(command[3], thing);
    }
    case "!Or":
      return !!doCommand(command[1], thing) || !!doCommand(command[2], thing);
  }
};

export const xform =
  <TAdded extends Record<string, unknown>>(
    config: Config<keyof TAdded>,
    logger?: Logger
  ) =>
  <TIn extends Record<string, unknown>>(thing: TIn): TIn & TAdded =>
    // @ts-expect-error
    Object.entries(config).reduce<TIn & TAdded>(
      (acc, [key, value]) => ({
        ...acc,
        [key]: doCommand(value, thing, logger),
      }),
      // @ts-expect-error
      thing
    );
