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
  console.log(fileURLToPath(import.meta.url));
  return fs.readFileSync(
    join(fileURLToPath(import.meta.url), "../../../../tests/streamql", path),
    "utf-8"
  );
}

describe("streamql", () => {
  describe("ast", () => {
    const cases = [1, 2, 3, 4];
    for (const c of cases) {
      it(`Case ${c}`, () => {
        const input = readFile(`ast/${c}/input.streamql`);
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
        const input = readFile(`error/${c}/input.streamql`);
        const query = deserialize(input);
        expect(query.isErr()).toBe(true);
      });
    }
  });

  describe("regex", () => {
    const cases = [1, 2, 3, 4, 5, 6, 7, 8];
    for (const c of cases) {
      it(`Case ${c}`, () => {
        const input = readFile(`regex/${c}/input.streamql`);
        const test: Test = JSON.parse(
          readFile(`regex/${c}/test.json`).trim(),
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
        const input = readFile(`string/${c}/input.streamql`);
        const test: Test = JSON.parse(
          readFile(`string/${c}/test.json`).trim(),
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
