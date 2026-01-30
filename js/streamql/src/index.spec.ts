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

describe("streamql", () => {
  describe("ast", () => {
    const cases = [1, 2, 3, 4];
    for (const c of cases) {
      it(`Case ${c}`, () => {
        const input = fs.readFileSync(
          `../../tests/streamql/ast/${c}/input.streamql`,
          "utf-8",
        );
        const output = fs
          .readFileSync(`../../tests/streamql/ast/${c}/output.ast`, "utf-8")
          .trim();

        const query = deserialize(input)._unsafeUnwrap();
        const ast = serialize(query)._unsafeUnwrap();

        expect(ast).toBe(output);
      });
    }
  });

  describe("error", () => {
    const cases = [1, 2, 3, 4, 5, 6];
    for (const c of cases) {
      it(`Case ${c}`, () => {
        const input = fs.readFileSync(
          `../../tests/streamql/error/${c}/input.streamql`,
          "utf-8",
        );
        const query = deserialize(input);
        expect(query.isErr()).toBe(true);
      });
    }
  });

  describe("regex", () => {
    const cases = [1, 2, 3, 4, 5, 6, 7, 8];
    for (const c of cases) {
      it(`Case ${c}`, () => {
        const input = fs.readFileSync(
          `../../tests/streamql/regex/${c}/input.streamql`,
          "utf-8",
        );
        const test: Test = JSON.parse(
          fs
            .readFileSync(`../../tests/streamql/regex/${c}/test.json`, "utf-8")
            .trim(),
        );

        const query = deserialize(input);
        if (test.expect === "err") {
          expect(query.isErr()).toBe(true);
        } else {
          const expr = query._unsafeUnwrap().websocket!.raw!;
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
          `../../tests/streamql/string/${c}/input.streamql`,
          "utf-8",
        );
        const test: Test = JSON.parse(
          fs
            .readFileSync(`../../tests/streamql/string/${c}/test.json`, "utf-8")
            .trim(),
        );

        const query = deserialize(input);
        if (test.expect === "err") {
          expect(query.isErr()).toBe(true);
        } else {
          const expr = query._unsafeUnwrap().websocket!.raw!;
          expect(expr.value === test.input).toBe(test.result);
        }
      });
    }
  });
});
