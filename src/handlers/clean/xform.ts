import jsonpath from "jsonpath";

export const deepWrite = (target: any, key: string, value: unknown): any => {
  const [topKey, ...subsequentKeys] = key.split(".");
  return {
    ...target,
    [topKey]: key.includes(".")
      ? deepWrite(target?.[topKey], subsequentKeys.join("."), value)
      : value,
  };
};

export const areArraysEqual = (
  arrAInit: any[],
  arrBInit: any[],
  { ensureOrder }: { ensureOrder: boolean } = { ensureOrder: false }
): boolean => {
  const arrA = [...arrAInit];
  const arrB = [...arrBInit];
  if (!ensureOrder) {
    arrA.sort();
    arrB.sort();
  }
  return arrA.reduce((_, cur, i) => {
    console.log(cur, arrB[i]);
    return cur === arrB[i];
  }, true);
};

const primitives = ["boolean", "number", "string"];
const isPrimitive = (value: any): boolean => primitives.includes(typeof value);

const commands = ["!Path", "!Equals", "!Not", "!If"];
const isCommand = (value: any): boolean =>
  Array.isArray(value) &&
  typeof value[0] === "string" &&
  commands.includes(value[0]);

const doCommand = (command: any, thing: any): any => {
  // console.log("🚀 ~ file: xform.ts:40 ~ doCommand ~ command:", command);
  if (isPrimitive(command)) return command;
  switch (command[0]) {
    case "!Path":
      return jsonpath.query(thing, doCommand(command[1], thing));
    case "!Equals": {
      let comparitorA = command[1];
      let comparitorB = command[2];
      if (isPrimitive(comparitorA) && isPrimitive(comparitorB))
        return comparitorA === comparitorB;
      if (isCommand(comparitorA)) {
        comparitorA = doCommand(comparitorA, thing);
      }
      if (isCommand(comparitorB)) {
        comparitorB = doCommand(comparitorB, thing);
      }
      if (Array.isArray(comparitorA) || Array.isArray(comparitorB))
        return areArraysEqual(comparitorA, comparitorB, command?.[3]);
      // One could, if one were so inclined, add some mechanism by
      // which one might compare objects. I've not bothered because
      // our use case doesn't require it but it would make a fun
      // exercise of an interested reader.
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
  (config: any) =>
  (thing: any): any =>
    Object.entries(config).reduce(
      (acc, [key, value]) => {
        if (isCommand(value)) {
          const commandRes = doCommand(value, thing);
          return deepWrite(acc, key, commandRes);
        }
        return deepWrite(acc, key, value);
      },
      { ...thing }
    );
