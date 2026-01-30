import { describe, expect, it } from "vitest";

import { getString } from "../utils.js";

import { parser } from "./parser.js";
import {
  And,
  Clause,
  GroupQuery,
  IntValue,
  LogicalQuery,
  Or,
  Query,
  StreamClause,
  StringValue,
} from "./parser.terms.js";

describe("parser", () => {
  it("Should parse single clause", () => {
    const doc = 'ws.direction.eq:"server"';

    const tree = parser.parse(doc);

    const clause = tree.topNode.getChild(Query)!.getChild(Clause)!;

    const value = getString(clause, doc);
    expect(value).to.equal('ws.direction.eq:"server"');
  });

  it("Should parse logical query", () => {
    const doc = 'stream.source.eq:"automate" AND stream.path.cont:"google.com"';

    const tree = parser.parse(doc);

    const logicalQuery = tree.topNode.getChild(Query)!.getChild(LogicalQuery)!;

    const operator = logicalQuery.getChild(And)!;

    const operatorValue = getString(operator, doc);
    expect(operatorValue).to.equal("AND");

    const clauses = logicalQuery
      .getChildren(Query)
      .map((n) => n.getChild(Clause)!);

    const values = clauses.map((n) => getString(n, doc));
    expect(values).to.deep.equal([
      'stream.source.eq:"automate"',
      'stream.path.cont:"google.com"',
    ]);
  });

  it("Should parse group query", () => {
    const doc = '(stream.host.eq:"test.com" OR stream.port.eq:200)';

    const tree = parser.parse(doc);

    const logicalQuery = tree.topNode
      .getChild(Query)!
      .getChild(GroupQuery)!
      .getChild(Query)!
      .getChild(LogicalQuery)!;

    const operator = logicalQuery.getChild(Or)!;

    const operatorValue = getString(operator, doc);
    expect(operatorValue).to.equal("OR");

    const clauses = logicalQuery
      .getChildren(Query)
      .map((n) => n.getChild(Clause)!);

    const values = clauses.map((n) => getString(n, doc));
    expect(values).to.deep.equal([
      'stream.host.eq:"test.com"',
      "stream.port.eq:200",
    ]);
  });

  it("Should not parse if string applied to int operator", () => {
    const query = 'stream.port.eq:"GET"';

    const tree = parser.parse(query);

    const node = tree.topNode
      .getChild(Query)!
      .getChild(Clause)!
      .getChild(StreamClause)!
      .getChild(IntValue);

    expect(node).to.be.null;
  });

  it("Should not parse if int applied to string operator", () => {
    const query = "stream.path.eq:200";

    const tree = parser.parse(query);

    const node = tree.topNode
      .getChild(Query)!
      .getChild(Clause)!
      .getChild(StreamClause)!
      .getChild(StringValue);

    expect(node).to.be.null;
  });
});
