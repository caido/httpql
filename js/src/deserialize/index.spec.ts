import { describe, expect, it } from "vitest";

import { OperatorInt, OperatorString, type Preset } from "../primitives.js";

import { deserialize } from "./index.js";

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

  it("should parse space query", () => {
    const query = "   ";

    const result = deserialize(query);

    expect(result.isOk()).to.be.true;
  });

  it("should parse empty group", () => {
    const query = "()";

    const result = deserialize(query);

    expect(result.isOk()).to.be.true;
  });

  it("should parse HTTPQL expression with escaped backslash", () => {
    const query = `req.method.eq:"GET${BACKSLASH}${BACKSLASH}"`;

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      request: {
        method: {
          operator: OperatorString.Eq,
          value: `GET${BACKSLASH}${BACKSLASH}`,
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
          operator: OperatorString.Eq,
          value: `GET${BACKSLASH}"`,
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
          operator: OperatorString.Eq,
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
          operator: OperatorInt.Eq,
          value: 404,
        },
      },
    });
  });

  it("should parse HTTPQL preset alias expression", () => {
    const query = "preset:my-preset";
    const presets: Preset[] = [
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
        source: "ALIAS",
      },
    });
  });

  it("should parse HTTPQL preset name expression", () => {
    const query = 'preset:"My preset"';
    const presets: Preset[] = [
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
        source: "NAME",
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
    const presets: Preset[] = [
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
              operator: OperatorString.Eq,
              value: "GET",
            },
          },
        },
        {
          request: {
            host: {
              operator: OperatorString.Cont,
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
              operator: OperatorString.Eq,
              value: "GET",
            },
          },
        },
        {
          request: {
            host: {
              operator: OperatorString.Cont,
              value: "google.com",
            },
          },
        },
      ],
    });
  });

  it("should parse HTTPQL from left to right", () => {
    const query =
      'req.ext.nlike:"%.apng" AND req.ext.nlike:"%.avif" AND req.ext.nlike:"%.gif"';

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      AND: [
        {
          AND: [
            {
              request: {
                fileExtension: {
                  operator: OperatorString.Nlike,
                  value: "%.apng",
                },
              },
            },
            {
              request: {
                fileExtension: {
                  operator: OperatorString.Nlike,
                  value: "%.avif",
                },
              },
            },
          ],
        },
        {
          request: {
            fileExtension: {
              operator: OperatorString.Nlike,
              value: "%.gif",
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
              request: {
                method: {
                  operator: OperatorString.Eq,
                  value: "GET",
                },
              },
            },
            {
              request: {
                host: {
                  operator: OperatorString.Cont,
                  value: "google.com",
                },
              },
            },
          ],
        },
        {
          request: {
            method: {
              operator: OperatorString.Eq,
              value: "POST",
            },
          },
        },
      ],
    });
  });
});
