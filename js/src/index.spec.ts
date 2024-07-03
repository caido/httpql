import * as fs from "fs";

import { describe, expect, it } from "vitest";

import { deserialize, serialize } from "./index.js";

type Test =
  | {
      expect: "err";
    }
  | {
      expect: "ok";
      input: string;
      result: boolean;
    };

describe("httpql", () => {
  describe("ast", () => {
    const cases = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    for (const c of cases) {
      it(`Case ${c}`, () => {
        const input = fs.readFileSync(
          `../tests/ast/${c}/input.httpql`,
          "utf-8",
        );
        const output = fs
          .readFileSync(`../tests/ast/${c}/output.ast`, "utf-8")
          .trim();

        const query = deserialize(input)._unsafeUnwrap();
        const ast = serialize(query)._unsafeUnwrap();

        expect(ast).toBe(output);
      });
    }
  });

  describe("regex", () => {
    const cases = [1, 2, 3, 4, 5, 6, 7, 8];
    for (const c of cases) {
      it(`Case ${c}`, () => {
        const input = fs.readFileSync(
          `../tests/regex/${c}/input.httpql`,
          "utf-8",
        );
        const test: Test = JSON.parse(
          fs.readFileSync(`../tests/regex/${c}/test.json`, "utf-8").trim(),
        );

        const query = deserialize(input);
        if (test.expect === "err") {
          expect(query.isErr()).toBe(true);
        } else {
          const expr = query._unsafeUnwrap().request!.raw!;
          const regex = new RegExp(expr.value);
          expect(regex.test(test.input)).toBe(test.result);
        }
      });
    }
  });

  describe("string", () => {
    const cases = [1, 2];
    for (const c of cases) {
      it(`Case ${c}`, () => {
        const input = fs.readFileSync(
          `../tests/string/${c}/input.httpql`,
          "utf-8",
        );
        const test: Test = JSON.parse(
          fs.readFileSync(`../tests/string/${c}/test.json`, "utf-8").trim(),
        );

        const query = deserialize(input);
        if (test.expect === "err") {
          expect(query.isErr()).toBe(true);
        } else {
          const expr = query._unsafeUnwrap().request!.raw!;
          expect(expr.value === test.input).toBe(test.result);
        }
      });
    }
  });
});
