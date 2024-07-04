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
  RequestClause,
  StringValue,
} from "./parser.terms.js";

describe("parser", () => {
  it("Should parse single clause", () => {
    const doc = 'request.method.eq:"GET"';

    const tree = parser.parse(doc);

    const clause = tree.topNode.getChild(Query)!.getChild(Clause)!;

    const value = getString(clause, doc);
    expect(value).to.equal('request.method.eq:"GET"');
  });

  it("Should parse logical query", () => {
    const doc = 'request.method.eq:"GET" AND request.host.eq:"google.com"';

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
      'request.method.eq:"GET"',
      'request.host.eq:"google.com"',
    ]);
  });

  it("Should parse group query", () => {
    const doc = '(request.method.eq:"GET" OR request.port.eq:200)';

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
      'request.method.eq:"GET"',
      "request.port.eq:200",
    ]);
  });

  it("Should not parse if string applied to int operator", () => {
    const query = 'request.port.eq:"GET"';

    const tree = parser.parse(query);

    const node = tree.topNode
      .getChild(Query)!
      .getChild(Clause)!
      .getChild(RequestClause)!
      .getChild(IntValue);

    expect(node).to.be.null;
  });

  it("Should not parse if int applied to string operator", () => {
    const query = "request.method.eq:200";

    const tree = parser.parse(query);

    const node = tree.topNode
      .getChild(Query)!
      .getChild(Clause)!
      .getChild(RequestClause)!
      .getChild(StringValue);

    expect(node).to.be.null;
  });
});
