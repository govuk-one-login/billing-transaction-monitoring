import { xform } from "./xform";

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

    test("hardcode object value", () => {
      const i = { d: "d" };
      const o = { d: "d", a: { b: "b" } };
      const xformConfig = {
        a: { b: "b" },
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

    test("returns an empty array for empty paths", () => {
      const res = xform({ a: ["!Path", "$.b"], c: ["!Path", "$.d"] })({
        d: undefined,
      });
      expect(res).toEqual({ a: [], c: [] });
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
        ).toEqual({ b: false });
      });

      test("non-matching arrays ", () => {
        expect(
          xform({
            c: ["!Equals", [1, 2, 3], [1, 2, 4]],
          })({})
        ).toEqual({ c: false });

        expect(
          xform({
            c: ["!Equals", [1, 2, 3, 4], [1, 2, 3]],
          })({})
        ).toEqual({ c: false });

        expect(
          xform({
            c: ["!Equals", [1, 2, 3], [1, 2, 3, 4]],
          })({})
        ).toEqual({ c: false });
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

    test("compares objects", () => {
      expect(
        xform({
          a: ["!Equals", {}, {}],
        })({})
      ).toEqual({ a: true });

      expect(
        xform({
          a: ["!Equals", { b: { c: { d: 1 } } }, { b: { c: { d: 1 } } }],
        })({})
      ).toEqual({ a: true });

      expect(
        xform({
          a: ["!Equals", { b: { c: { d: 2 } } }, { b: { c: { d: 1 } } }],
        })({})
      ).toEqual({ a: false });

      expect(
        xform({
          a: ["!Equals", { b: { c: { e: 1 } } }, { b: { c: { d: 1 } } }],
        })({})
      ).toEqual({ a: false });
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
          a: ["!Not", ["!Equals", ["!Path", "$.b"], ["b"]]],
        })({ b: "b" })
      ).toEqual({ a: false, b: "b" });

      expect(
        xform({
          a: ["!Not", ["!Equals", ["!Path", "$.b"], ["b"]]],
        })({ b: "c" })
      ).toEqual({ a: true, b: "c" });
    });
  });

  describe("!If", () => {
    test("if statement 1 then returns statement 2 else returns statement 3", () => {
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
          a: ["!If", ["!Equals", ["!Path", "$.b"], ["b"]], 1, 2],
        })({ b: "b" })
      ).toEqual({ a: 1, b: "b" });

      expect(
        xform({
          a: ["!If", ["!Equals", ["!Path", "$.b"], ["b"]], 1, 2],
        })({ b: "c" })
      ).toEqual({ a: 2, b: "c" });

      expect(
        xform({
          a: ["!If", ["!Not", ["!Equals", ["!Path", "$.b"], ["b"]]], 1, 2],
        })({ b: "b" })
      ).toEqual({ a: 2, b: "b" });

      expect(
        xform({
          a: ["!If", ["!Not", ["!Equals", ["!Path", "$.b"], ["b"]]], 1, 2],
        })({ b: "c" })
      ).toEqual({ a: 1, b: "c" });
    });

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
