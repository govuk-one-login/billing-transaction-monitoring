import jsonpath from "jsonpath";

type Primitive = boolean | null | number | string;
const primitives = ["boolean", "number", "string"];
const isPrimitive = (value: unknown): value is Primitive =>
  primitives.includes(typeof value) || value === null;

type PathCommand = ["!Path", Primitive | Command];
type EqualsCommand = [
  "!Equals",
  Primitive | Command,
  Primitive | Command,
  { ignoreOrder?: boolean }?
];
type NotCommand = ["!Not", Primitive | Command];
type IfCommand = [
  "!If",
  Primitive | Command,
  Primitive | Command,
  Primitive | Command
];

type Command = PathCommand | EqualsCommand | NotCommand | IfCommand;

interface Config {
  [field: string]: Primitive | Command | Record<string, unknown> | unknown[];
}

export const deepWrite = <TReturn>(
  target: any,
  key: string,
  value: unknown
): TReturn => {
  const [topKey, ...subsequentKeys] = key.split(".");
  return {
    ...target,
    [topKey]: key.includes(".")
      ? deepWrite(target?.[topKey], subsequentKeys.join("."), value)
      : value,
  };
};

const areArraysEqual = (
  arrAInit: unknown[],
  arrBInit: unknown[],
  { ignoreOrder }: { ignoreOrder?: boolean } = { ignoreOrder: false }
): boolean => {
  const arrA = [...arrAInit];
  const arrB = [...arrBInit];
  if (ignoreOrder) {
    arrA.sort();
    arrB.sort();
  }
  return arrA.reduce<boolean>((_, cur, i) => {
    return cur === arrB[i];
  }, true);
};

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
    case "!Equals": {
      const comparitorA = doCommand(command[1], thing);
      const comparitorB = doCommand(command[2], thing);
      if (isPrimitive(comparitorA) && isPrimitive(comparitorB))
        return comparitorA === comparitorB;
      if (Array.isArray(comparitorA) || Array.isArray(comparitorB))
        return areArraysEqual(comparitorA, comparitorB, command?.[3]);
      // One could, if one were so inclined, add some mechanism by
      // which one might compare objects. I've not bothered because
      // our use case doesn't require it but it would make a fun
      // exercise for an interested reader.
      throw new Error("Tried to compare to incomparable items");
    }
    case "!Not": {
      return !doCommand(command[1], thing);
    }
    case "!If": {
      const condition = doCommand(command[1], thing);
      return condition
        ? doCommand(command[2], thing)
        : doCommand(command[3], thing);
    }
  }
};

export const xform =
  (config: Config) =>
  <TIn extends Record<string, unknown>, TAdded extends Record<string, unknown>>(
    thing: TIn
  ): TIn & TAdded =>
    Object.entries(config).reduce<TIn & TAdded>(
      (acc, [key, value]) => deepWrite(acc, key, doCommand(value, thing)),
      { ...thing }
    );
