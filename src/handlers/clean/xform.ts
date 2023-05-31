import jp from "jsonpath";

export enum Combinators {
  AND = "AND",
  OR = "OR",
}

export enum Comparitors {
  EQ = "EQ",
  NEQ = "NEQ",
  LT = "LT",
  GT = "GT",
  EXISTS = "EXISTS",
}

export type Primitive = string | number | boolean | undefined;

export interface ComparableCondition {
  value?: Primitive;
  path: string;
  comparitor: Comparitors;
  comparisonValue?: Primitive;
}

export interface CombinableCondition {
  value?: Primitive;
  combinator: Combinators;
  conditions: Conditions;
}

export type Logic = ComparableCondition | CombinableCondition;

export type Conditions = Logic[];

export interface XformConfig {
  field: string;
  default: Primitive;
  logic: ComparableCondition | CombinableCondition;
}

export const isComparableCondition = (
  condition: Logic
): condition is ComparableCondition => {
  return (
    typeof condition === "object" &&
    !!(condition as ComparableCondition)?.path &&
    !!(condition as ComparableCondition)?.comparitor
  );
};

export const isCombinableCondition = (
  condition: Logic
): condition is CombinableCondition => {
  return (
    typeof condition === "object" &&
    !!(condition as CombinableCondition)?.combinator &&
    !!(condition as CombinableCondition)?.conditions
  );
};

export const compare = (
  comparitor: Comparitors,
  valueA: Primitive,
  valueB?: Primitive
): boolean => {
  console.log(`Comparing ${valueA} ${comparitor} ${valueB}`);
  switch (comparitor) {
    case Comparitors.EQ: {
      return valueA === valueB;
    }
    case Comparitors.EXISTS: {
      return !!valueA;
    }
    case Comparitors.GT: {
      return (
        typeof valueA === "number" &&
        typeof valueB === "number" &&
        valueA > valueB
      );
    }

    case Comparitors.LT: {
      return (
        typeof valueA === "number" &&
        typeof valueB === "number" &&
        valueA < valueB
      );
    }
    case Comparitors.NEQ: {
      return valueA !== valueB;
    }
  }
};

const applyValue = <TReturn>(
  conditionResult: boolean,
  value: TReturn | undefined
): TReturn | true | undefined => {
  console.log("🚀 ~ file: xform.ts:100 ~ conditionResult:", conditionResult);
  console.log("🚀 ~ file: xform.ts:102 ~ value:", value);
  if (conditionResult) {
    if (value === undefined) {
      console.log("returning True");
      return true;
    } else {
      console.log("returning value");
      return value;
    }
  } else {
    console.log("returning undefined");
    return undefined;
  }
};

export const doComparison = (
  obj: unknown,
  { path, comparitor, comparisonValue, value }: ComparableCondition
): Primitive => {
  const [inputValue] = jp.query(obj, path);
  return applyValue<Primitive>(
    compare(comparitor, inputValue, comparisonValue),
    value
  );
};

const combinationInitialiser = "$__INIT__$";

export const combine = (
  valueA: Primitive,
  valueB: Primitive,
  combinator: Combinators
): boolean => {
  if (valueA === combinationInitialiser) return Boolean(valueB);
  console.log(`Combining ${valueA} ${combinator} ${valueB}`);
  switch (combinator) {
    case Combinators.AND:
      return !!valueA && !!valueB;
    case Combinators.OR:
      return !!valueA || !!valueB;
  }
};

export const doCombination = (
  obj: unknown,
  { combinator, conditions, value }: CombinableCondition
): Primitive =>
  conditions.reduce<Primitive>((acc, condition) => {
    return applyValue<Primitive>(
      combine(acc, doOp(obj, condition), combinator),
      value
    );
  }, combinationInitialiser);

export const doOp = (obj: unknown, logic: Logic): Primitive =>
  isCombinableCondition(logic)
    ? doCombination(obj, logic)
    : doComparison(obj, logic);

export const xform = <TReturn>(obj: unknown, config: XformConfig): TReturn => ({
  ...(obj as any),
  [config.field]: (() => {
    const value = doOp(obj, config.logic);
    if (value === undefined) {
      return config.default;
    }
    return value;
  })(),
});
