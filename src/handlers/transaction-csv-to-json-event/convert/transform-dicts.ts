import { InteroperablyTransformable } from "./perform-transformations";

export enum Operations {
  add = "add",
  multiply = "multiply",
  exponentiate = "exponentiate",
  floor = "floor",
  ceil = "ceil",
  construct = "construct",
}

export enum Constructables {
  date = "date",
  number = "number",
}

const constructablesDict = {
  [Constructables.date]: (input: InteroperablyTransformable) => new Date(input),
  [Constructables.number]: (input: InteroperablyTransformable) =>
    Number(input).valueOf(),
};

export const operationsDict: Record<
  Operations,
  (
    input: InteroperablyTransformable,
    parameter?: string | number
  ) => string | number | Date
> = {
  [Operations.add]: (input, parameter) => {
    if (typeof parameter !== "number") {
      throw new Error("Invalid parameter");
    }
    if (input instanceof Date) {
      return input.getTime() + parameter;
    }
    if (typeof input !== "number") {
      throw new Error("Invalid input");
    }
    return input + parameter;
  },
  [Operations.multiply]: (input, parameter) => {
    if (typeof parameter !== "number") {
      throw new Error("Invalid parameter");
    }
    if (input instanceof Date) {
      return input.getTime() * parameter;
    }
    if (typeof input !== "number") {
      throw new Error("Invalid input");
    }
    return input * parameter;
  },
  [Operations.exponentiate]: (input, parameter) => {
    if (typeof parameter !== "number") {
      throw new Error("Invalid parameter");
    }
    if (input instanceof Date) {
      return input.getTime() ** parameter;
    }
    if (typeof input !== "number") {
      throw new Error("Invalid input");
    }
    return input ** parameter;
  },
  [Operations.floor]: (input) => {
    if (input instanceof Date) {
      return input.getTime();
    }
    if (typeof input !== "number") {
      throw new Error("Invalid input");
    }
    return Math.floor(input);
  },
  [Operations.ceil]: (input) => {
    if (input instanceof Date) {
      return input.getTime();
    }
    if (typeof input !== "number") {
      throw new Error("Invalid input");
    }
    return Math.ceil(input);
  },
  [Operations.construct]: (input, parameter) => {
    if (
      !parameter ||
      typeof parameter !== "string" ||
      !(parameter in Constructables)
    )
      throw new Error("Invalid parameter");
    return constructablesDict[parameter as Constructables](input);
  },
};
