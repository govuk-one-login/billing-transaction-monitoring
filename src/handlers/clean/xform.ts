import jsonpath from "jsonpath";
import { isEqual } from "lodash";

type Primitive = boolean | null | number | string;

type CommandArg =
  | Primitive
  | Command
  | Array<Primitive>
  | Record<string, unknown>;

type PathCommand = ["!Path", CommandArg];
type EqualsCommand = [
  "!Equals",
  CommandArg,
  CommandArg,
  { ignoreOrder?: boolean }?
];
type NotCommand = ["!Not", CommandArg];
type IfCommand = ["!If", CommandArg, CommandArg, CommandArg];

export type Command = PathCommand | EqualsCommand | NotCommand | IfCommand;

type Config<TKey extends string | number | symbol> = Record<
  TKey,
  Primitive | Record<string, unknown> | unknown[]
>;

const commands = ["!Path", "!Equals", "!Not", "!If"];

const isCommand = (value: unknown): value is Command =>
  Array.isArray(value) &&
  typeof value[0] === "string" &&
  commands.includes(value[0]);

const doCommand = (command: unknown, thing: any): any => {
  if (!isCommand(command)) return command;
  switch (command[0]) {
    case "!Path":
      return jsonpath.query(thing, doCommand(command[1], thing));
    case "!Equals":
      console.log("isEqual", doCommand(command[1], thing), command[2]);
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
  }
};

export const xform =
  <TAdded extends Record<string, unknown>>(config: Config<keyof TAdded>) =>
  <TIn extends Record<string, unknown>>(thing: TIn): TIn & TAdded =>
    Object.entries(config).reduce<TIn & TAdded>(
      (acc, [key, value]) => ({ ...acc, [key]: doCommand(value, thing) }),
      { ...thing } as TIn & TAdded
    );
