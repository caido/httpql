import * as fs from "fs";

import { describe, expect, it } from "vitest";

import { deserialize, serialize } from "./index.js";

describe("httpql", () => {
  const cases = [1, 2, 3, 4, 5];

  for (const c of cases) {
    it(`Case ${c}`, () => {
      const input = fs.readFileSync(`../tests/${c}/input.httpql`, "utf-8");
      const output = fs
        .readFileSync(`../tests/${c}/output.ast`, "utf-8")
        .trim();

      const result = deserialize(input)._unsafeUnwrap();
      const ast = serialize(result)._unsafeUnwrap();

      expect(ast).toBe(output);
    });
  }
});
