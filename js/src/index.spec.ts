import * as fs from "fs";

import { describe, expect, it } from "vitest";

import type { Options } from "./primitives";

import { deserialize, serialize } from "./index";

describe("httpql", () => {
  const cases = [1, 2, 3, 4, 5];
  const options: Options = {
    presets: [
      {
        id: "1",
        name: "test lol",
        alias: "test_lol",
      },
      {
        id: "2",
        name: "My Alias",
        alias: "my_alias",
      },
      {
        id: "3",
        name: "Test Characters",
        alias: "abc123-_",
      },
    ],
  };

  for (const c of cases) {
    it(`Case ${c}`, () => {
      const input = fs.readFileSync(`../tests/${c}/input.httpql`, "utf-8");
      const output = fs
        .readFileSync(`../tests/${c}/output.ast`, "utf-8")
        .trim();

      const result = deserialize(input, options)._unsafeUnwrap();
      const ast = serialize(result, options)._unsafeUnwrap();

      expect(ast).toBe(output);
    });
  }
});
