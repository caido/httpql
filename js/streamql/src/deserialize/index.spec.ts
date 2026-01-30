import { describe, expect, it } from "vitest";

import { OperatorInt, OperatorString } from "../primitives.js";

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

  it("should parse StreamQL expression with escaped backslash", () => {
    const query = `stream.host.eq:"test.com${BACKSLASH}${BACKSLASH}"`;

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      stream: {
        host: {
          operator: OperatorString.Eq,
          value: `test.com\\`,
          isRaw: false,
        },
      },
    });
  });

  it("should parse StreamQL expression with escaped quote", () => {
    const query = `stream.host.eq:"test.com${BACKSLASH + '"'}"`;

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      stream: {
        host: {
          operator: OperatorString.Eq,
          value: `test.com"`,
          isRaw: false,
        },
      },
    });
  });

  it("should parse StreamQL stream expression", () => {
    const query = 'stream.host.eq:"test.com"';

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      stream: {
        host: {
          operator: OperatorString.Eq,
          value: "test.com",
          isRaw: false,
        },
      },
    });
  });

  it("should parse StreamQL ws expression", () => {
    const query = 'ws.format.eq:"binary"';

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      websocket: {
        format: {
          operator: OperatorInt.Eq,
          value: "binary",
          isRaw: false,
        },
      },
    });
  });

  it("should parse StreamQL AND expression", () => {
    const query = 'stream.host.cont:"test.com" AND ws.direction.eq:"client"';

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      AND: [
        {
          stream: {
            host: {
              operator: OperatorString.Cont,
              value: "test.com",
              isRaw: false,
            },
          },
        },
        {
          websocket: {
            direction: {
              operator: OperatorString.Eq,
              value: "client",
              isRaw: false,
            },
          },
        },
      ],
    });
  });

  it("should parse StreamQL OR expression", () => {
    const query = "stream.port.eq:440 OR stream.tls.eq:true";

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      OR: [
        {
          stream: {
            port: {
              operator: OperatorString.Eq,
              value: 440,
            },
          },
        },
        {
          stream: {
            isTLS: {
              operator: OperatorString.Eq,
              value: true,
            },
          },
        },
      ],
    });
  });

  it("should parse StreamQL from left to right", () => {
    const query =
      'stream.path.nlike:"%.apng" AND stream.protocol.ne:"ws" AND stream.source.like:"%automate"';

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      AND: [
        {
          AND: [
            {
              stream: {
                path: {
                  operator: OperatorString.Nlike,
                  value: "%.apng",
                  isRaw: false,
                },
              },
            },
            {
              stream: {
                protocol: {
                  operator: OperatorString.Ne,
                  value: "ws",
                  isRaw: false,
                },
              },
            },
          ],
        },
        {
          stream: {
            source: {
              operator: OperatorString.Like,
              value: "%automate",
              isRaw: false,
            },
          },
        },
      ],
    });
  });

  it("should parse StreamQL group expression", () => {
    const query =
      '(stream.host.eq:"test.com" AND ws.direction.ne:"server") OR ws.direction.eq:"server"';

    const filter = deserialize(query)._unsafeUnwrap();

    expect(filter).to.deep.equal({
      OR: [
        {
          AND: [
            {
              stream: {
                host: {
                  operator: OperatorString.Eq,
                  value: "test.com",
                  isRaw: false,
                },
              },
            },
            {
              websocket: {
                direction: {
                  operator: OperatorString.Ne,
                  value: "server",
                  isRaw: false,
                },
              },
            },
          ],
        },
        {
          websocket: {
            direction: {
              operator: OperatorString.Eq,
              value: "server",
              isRaw: false,
            },
          },
        },
      ],
    });
  });
});
