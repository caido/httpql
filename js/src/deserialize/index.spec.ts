import { describe, expect, it } from "vitest";

import {
  FilterOperatorInt,
  FilterOperatorString,
  type FilterPreset,
} from "../primitives";

import { deserialize } from "./index";

const BACKSLASH = "\\";

describe("deserialize", () => {
  it("should fail given an invalid syntax", () => {
    const query = "req.method.eq:";

    const result = deserialize(query);

    expect(result.isErr()).to.be.true;
  });

  it("should parse empty query", () => {
    const query = "";

    const result = deserialize(query);

    expect(result.isOk()).to.be.true;
  });

  it("should parse empty group", () => {
    const query = "()";

    const result = deserialize(query);

    expect(result.isOk()).to.be.true;
  });

  it("should parse HTTPQL expression with escaped backslash", () => {
    const query = `req.method.eq:"GET${BACKSLASH + BACKSLASH}"`;

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      request: {
        method: {
          operator: FilterOperatorString.Eq,
          value: `GET${BACKSLASH}`,
        },
      },
    });
  });

  it("should parse HTTPQL expression with escaped quote", () => {
    const query = `req.method.eq:"GET${BACKSLASH + '"'}"`;

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      request: {
        method: {
          operator: FilterOperatorString.Eq,
          value: `GET"`,
        },
      },
    });
  });

  it("should parse HTTPQL request expression", () => {
    const query = 'req.method.eq:"GET"';

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      request: {
        method: {
          operator: FilterOperatorString.Eq,
          value: "GET",
        },
      },
    });
  });

  it("should parse HTTPQL response expression", () => {
    const query = "resp.code.eq:404";

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      response: {
        statusCode: {
          operator: FilterOperatorInt.Eq,
          value: 404,
        },
      },
    });
  });

  it("should parse HTTPQL preset alias expression", () => {
    const query = "preset:my-preset";
    const presets: FilterPreset[] = [
      {
        id: "my-preset-id",
        alias: "my-preset",
        name: "My preset",
      },
    ];

    const filter = deserialize(query, {
      presets,
    })._unsafeUnwrap();

    expect(filter).to.deep.equal({
      preset: {
        id: "my-preset-id",
      },
    });
  });

  it("should parse HTTPQL preset name expression", () => {
    const query = 'preset:"My preset"';
    const presets: FilterPreset[] = [
      {
        id: "my-preset-id",
        alias: "my-preset",
        name: "My preset",
      },
    ];

    const filter = deserialize(query, {
      presets,
    })._unsafeUnwrap();

    expect(filter).to.deep.equal({
      preset: {
        id: "my-preset-id",
      },
    });
  });

  it("should not parse HTTPQL if no presets given", () => {
    const query = 'preset:"My preset"';
    const result = deserialize(query);

    expect(result.isErr()).to.be.true;
  });

  it("should not parse HTTPQL if no presets found", () => {
    const query = 'preset:"does not exist"';
    const presets: FilterPreset[] = [
      {
        id: "my-preset-id",
        alias: "my-preset",
        name: "My preset",
      },
    ];

    const result = deserialize(query, { presets });

    expect(result.isErr()).to.be.true;
  });

  it("should parse HTTPQL AND expression", () => {
    const query = 'req.method.eq:"GET" AND req.host.cont:"google.com"';

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      AND: [
        {
          request: {
            method: {
              operator: FilterOperatorString.Eq,
              value: "GET",
            },
          },
        },
        {
          request: {
            host: {
              operator: FilterOperatorString.Cont,
              value: "google.com",
            },
          },
        },
      ],
    });
  });

  it("should parse HTTPQL OR expression", () => {
    const query = 'req.method.eq:"GET" OR req.host.cont:"google.com"';

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      OR: [
        {
          request: {
            method: {
              operator: FilterOperatorString.Eq,
              value: "GET",
            },
          },
        },
        {
          request: {
            host: {
              operator: FilterOperatorString.Cont,
              value: "google.com",
            },
          },
        },
      ],
    });
  });

  it("should parse HTTPQL group expression", () => {
    const query =
      '(req.method.eq:"GET" AND req.host.cont:"google.com") OR req.method.eq:"POST"';

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      OR: [
        {
          AND: [
            {
              AND: [
                {
                  request: {
                    method: {
                      operator: FilterOperatorString.Eq,
                      value: "GET",
                    },
                  },
                },
                {
                  request: {
                    host: {
                      operator: FilterOperatorString.Cont,
                      value: "google.com",
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          request: {
            method: {
              operator: FilterOperatorString.Eq,
              value: "POST",
            },
          },
        },
      ],
    });
  });
});
