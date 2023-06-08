import { deepWrite, xform } from "./xform";

test("deepWrite", () => {
  // writes to deep keys
  expect(deepWrite({}, "a", 1)).toEqual({ a: 1 });
  expect(deepWrite({}, "a.b", 1)).toEqual({ a: { b: 1 } });
  expect(deepWrite({}, "a.b.c", 1)).toEqual({ a: { b: { c: 1 } } });
  // preserves existing keys
  expect(deepWrite({ x: "x" }, "a", 1)).toEqual({ x: "x", a: 1 });
  expect(deepWrite({ x: "x" }, "a.b", 1)).toEqual({ x: "x", a: { b: 1 } });
  expect(deepWrite({ x: "x" }, "a.b.c", 1)).toEqual({
    x: "x",
    a: { b: { c: 1 } },
  });
  // overwrites existing keys
  expect(deepWrite({ a: "a" }, "a", 1)).toEqual({ a: 1 });
  expect(deepWrite({ a: { b: "b" } }, "a.b", 1)).toEqual({ a: { b: 1 } });
  expect(deepWrite({ a: { b: { c: "c" } } }, "a.b.c", 1)).toEqual({
    a: { b: { c: 1 } },
  });
  expect(deepWrite({ a: { b: { c: "c" } } }, "a", 1)).toEqual({
    a: 1,
  });
});

describe("xform v2", () => {
  describe("simple writes", () => {
    test("hardcode primitive value", () => {
      const i = { d: "d" };
      const o = { d: "d", a: "a", b: 2, c: true };
      const xformConfig = {
        a: "a",
        b: 2,
        c: true,
      };
      expect(xform(xformConfig)(i)).toEqual(o);
    });

    test("nested hardcode primitive value", () => {
      const i = { d: "d" };
      const o = { d: "d", a: { b: "a" } };
      const xformConfig = {
        "a.b": "a",
      };
      expect(xform(xformConfig)(i)).toEqual(o);
    });

    test("hardcode object value", () => {
      const i = { d: "d" };
      const o = { d: "d", a: { b: "b" } };
      const xformConfig = {
        a: { b: "b" },
      };
      expect(xform(xformConfig)(i)).toEqual(o);
    });

    test("nested hardcode object value", () => {
      const i = { d: "d" };
      const o = { d: "d", a: { b: { c: "c" } } };
      const xformConfig = {
        "a.b": { c: "c" },
      };
      expect(xform(xformConfig)(i)).toEqual(o);
    });

    test("hardcode array value", () => {
      const i = { d: "d" };
      const o = { d: "d", a: [1, 2, 3] };
      const xformConfig = {
        a: [1, 2, 3],
      };
      expect(xform(xformConfig)(i)).toEqual(o);
    });

    test("nested hardcode array value", () => {
      const i = { d: "d" };
      const o = { d: "d", a: { b: [1, 2, 3] } };
      const xformConfig = {
        "a.b": [1, 2, 3],
      };
      expect(xform(xformConfig)(i)).toEqual(o);
    });
  });

  describe("!Path", () => {
    test("copy value to top level", () => {
      const i = { d: "d" };
      const o = { d: "d", a: ["d"] };
      const xformConfig = {
        a: ["!Path", "$.d"],
      };
      expect(xform(xformConfig)(i)).toEqual(o);
    });

    test("copy value to nested key", () => {
      const i = { d: "d" };
      const o = { d: "d", a: { b: ["d"] } };
      const xformConfig = {
        "a.b": ["!Path", "$.d"],
      };
      expect(xform(xformConfig)(i)).toEqual(o);
    });

    test("copy nested value to nested key", () => {
      const i = { d: { e: "e" } };
      const o = { d: { e: "e" }, a: { b: ["e"] } };
      const xformConfig = {
        "a.b": ["!Path", "$..e"],
      };
      expect(xform(xformConfig)(i)).toEqual(o);
    });

    test("copy nested, complex value to nested key", () => {
      const i = { d: { e: [1, 2, 3] } };
      const o = { d: { e: [1, 2, 3] }, a: { b: [[1, 2, 3]] } };
      const xformConfig = {
        "a.b": ["!Path", "$..e"],
      };
      expect(xform(xformConfig)(i)).toEqual(o);
    });
  });

  describe("!Equals", () => {
    test("compares primitives", () => {
      expect(
        xform({
          a: ["!Equals", 1, 1],
        })({})
      ).toEqual({ a: true });

      expect(
        xform({
          a: ["!Equals", 1, 2],
        })({})
      ).toEqual({ a: false });

      expect(
        xform({
          a: ["!Equals", "thing", "thing"],
        })({})
      ).toEqual({ a: true });

      expect(
        xform({
          a: ["!Equals", "thingA", "thingB"],
        })({})
      ).toEqual({ a: false });

      expect(
        xform({
          a: ["!Equals", true, true],
        })({})
      ).toEqual({ a: true });

      expect(
        xform({
          a: ["!Equals", true, false],
        })({})
      ).toEqual({ a: false });
    });

    describe("compares arrays", () => {
      test("matching arrays in the same order", () => {
        expect(
          xform({
            a: ["!Equals", [1, 2, 3], [1, 2, 3]],
          })({})
        ).toEqual({ a: true });
      });

      test("matching arrays in different orders", () => {
        expect(
          xform({
            b: ["!Equals", [1, 3, 2], [1, 2, 3]],
          })({})
        ).toEqual({ b: true });
      });

      test("non-matching arrays ", () => {
        expect(
          xform({
            c: ["!Equals", [1, 2, 3], [1, 2, 4]],
          })({})
        ).toEqual({ c: false });
      });

      test("matching arrays in different orders with ensureOrder option on", () => {
        expect(
          xform({
            d: ["!Equals", [1, 3, 2], [1, 2, 3], { ensureOrder: true }],
          })({})
        ).toEqual({ d: false });
      });
    });

    test("compares !Paths", () => {
      expect(
        xform({
          b: ["!Equals", ["!Path", "$.a"], ["a"]],
          c: ["!Equals", ["!Path", "$.a"], ["b"]],
        })({
          a: "a",
        })
      ).toEqual({ a: "a", b: true, c: false });

      expect(
        xform({
          b: ["!Equals", ["a"], ["!Path", "$.a"]],
          c: ["!Equals", ["b"], ["!Path", "$.a"]],
        })({
          a: "a",
        })
      ).toEqual({ a: "a", b: true, c: false });
    });

    test("can't compare objects", () => {
      expect(() =>
        xform({
          a: ["!Equals", {}, {}],
        })({})
      ).toThrow();
    });
  });

  describe("!Not", () => {
    test("negates booleans", () => {
      expect(
        xform({
          a: ["!Not", true],
        })({})
      ).toEqual({ a: false });

      expect(
        xform({
          a: ["!Not", false],
        })({})
      ).toEqual({ a: true });

      expect(
        xform({
          a: ["!Not", ["!Equals", 1, 2]],
        })({})
      ).toEqual({ a: true });

      expect(
        xform({
          a: ["!Not", ["!Equals", 1, 1]],
        })({})
      ).toEqual({ a: false });

      expect(
        xform({
          a: ["!Not", ["!Equals", ["!Path", "$.b"], "b"]],
        })({ b: "b" })
      ).toEqual({ a: false, b: "b" });

      expect(
        xform({
          a: ["!Not", ["!Equals", ["!Path", "$.b"], "b"]],
        })({ b: "c" })
      ).toEqual({ a: true, b: "c" });
    });
  });

  describe("!If", () => {
    test("if statement 1 returns statement 2 else returns statement 3", () => {
      expect(
        xform({
          a: ["!If", true, 1, 2],
        })({})
      ).toEqual({ a: 1 });

      expect(
        xform({
          a: ["!If", false, 1, 2],
        })({})
      ).toEqual({ a: 2 });

      expect(
        xform({
          a: ["!If", ["!Equals", ["!Path", "$.b"], "b"], 1, 2],
        })({ b: "b" })
      ).toEqual({ a: 1, b: "b" });

      expect(
        xform({
          a: ["!If", ["!Equals", ["!Path", "$.b"], "b"], 1, 2],
        })({ b: "c" })
      ).toEqual({ a: 2, b: "c" });

      expect(
        xform({
          a: ["!If", ["!Not", ["!Equals", ["!Path", "$.b"], "b"]], 1, 2],
        })({ b: "b" })
      ).toEqual({ a: 2, b: "b" });

      expect(
        xform({
          a: ["!If", ["!Not", ["!Equals", ["!Path", "$.b"], "b"]], 1, 2],
        })({ b: "c" })
      ).toEqual({ a: 1, b: "c" });
    });

    // I'm not sure this is a desired behavior to be honest
    // but I could only think of hacky ways to negate it so
    test("!Paths are always truthy", () => {
      expect(
        xform({
          a: ["!If", ["!Path", "$.b"], 1, 2],
        })({ b: "c" })
      ).toEqual({ a: 1, b: "c" });

      expect(
        xform({
          a: ["!If", ["!Path", "$.c"], 1, 2],
        })({ b: "c" })
      ).toEqual({ a: 1, b: "c" });

      expect(
        xform({
          a: ["!If", ["!Path", "$.b"], 1, 2],
        })({ b: undefined })
      ).toEqual({ a: 1, b: undefined });
    });
  });
});
