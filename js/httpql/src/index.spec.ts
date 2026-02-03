import * as fs from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

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

const readFile = (path: string) => {
  return fs.readFileSync(
    join(fileURLToPath(import.meta.url), "../../../../tests/httpql", path),
    "utf-8",
  );
};

describe("httpql", () => {
  describe("ast", () => {
    const cases = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    ];
    for (const c of cases) {
      it(`Case ${c}`, () => {
        const input = readFile(`ast/${c}/input.httpql`);
        const output = readFile(`ast/${c}/output.ast`).trim();

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
        const input = readFile(`error/${c}/input.httpql`);
        const query = deserialize(input);
        expect(query.isErr()).toBe(true);
      });
    }
  });

  describe("regex", () => {
    const cases = [1, 2, 3, 4, 5, 6, 7, 8];
    for (const c of cases) {
      it(`Case ${c}`, () => {
        const input = readFile(`regex/${c}/input.httpql`);
        const test: Test = JSON.parse(readFile(`regex/${c}/test.json`).trim());

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
        const input = readFile(`string/${c}/input.httpql`);
        const test: Test = JSON.parse(readFile(`string/${c}/test.json`).trim());

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
