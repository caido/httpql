import { describe, expect, it } from "vitest";

import { getString } from "../utils";

import { parser } from "./parser";
import {
  And,
  CombinedQuery,
  GroupQuery,
  IntValue,
  Or,
  Query,
  RequestQuery,
  SingleQuery,
  StringValue,
} from "./parser.terms";

describe("parser", () => {
  it("Should parse single query", () => {
    const doc = 'request.method.eq:"GET"';

    const tree = parser.parse(doc);

    const singleQuery = tree.topNode.getChild(Query)!.getChild(SingleQuery)!;

    const value = getString(singleQuery, doc);
    expect(value).to.equal('request.method.eq:"GET"');
  });

  it("Should parse combined query", () => {
    const doc = 'request.method.eq:"GET" AND request.host.eq:"google.com"';

    const tree = parser.parse(doc);

    const combinedQuery = tree.topNode
      .getChild(Query)!
      .getChild(CombinedQuery)!;

    const operator = combinedQuery.getChild(And)!;

    const operatorValue = getString(operator, doc);
    expect(operatorValue).to.equal("AND");

    const querys = combinedQuery
      .getChildren(Query)
      .map((n) => n.getChild(SingleQuery)!);

    const values = querys.map((n) => getString(n, doc));
    expect(values).to.deep.equal([
      'request.method.eq:"GET"',
      'request.host.eq:"google.com"',
    ]);
  });

  it("Should parse group query", () => {
    const doc = '(request.method.eq:"GET" OR request.port.eq:200)';

    const tree = parser.parse(doc);

    const combinedQuery = tree.topNode
      .getChild(Query)!
      .getChild(GroupQuery)!
      .getChild(Query)!
      .getChild(CombinedQuery)!;

    const operator = combinedQuery.getChild(Or)!;

    const operatorValue = getString(operator, doc);
    expect(operatorValue).to.equal("OR");

    const querys = combinedQuery
      .getChildren(Query)
      .map((n) => n.getChild(SingleQuery)!);

    const values = querys.map((n) => getString(n, doc));
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
      .getChild(SingleQuery)!
      .getChild(RequestQuery)!
      .getChild(IntValue);

    expect(node).to.be.null;
  });

  it("Should not parse if int applied to string operator", () => {
    const query = "request.method.eq:200";

    const tree = parser.parse(query);

    const node = tree.topNode
      .getChild(Query)!
      .getChild(SingleQuery)!
      .getChild(RequestQuery)!
      .getChild(StringValue);

    expect(node).to.be.null;
  });
});
