import type { SyntaxNode } from "@lezer/common";
import { err, type Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import { type Query } from "../primitives.js";
import { isPresent } from "../utils.js";

import { deserializePresetClause } from "./clause.preset.js";
import { deserializeRequestClause } from "./clause.request.js";
import { deserializeResponseClause } from "./clause.response.js";
import { deserializeRowClause } from "./clause.row.js";
import { deserializeSourceClause } from "./clause.source.js";
import { deserializeStringClause } from "./clause.string.js";

export const deserializeClause = (
  node: SyntaxNode,
  doc: string,
): Result<Query, HTTPQLError> => {
  const rowClause = node.getChild(terms.RowClause);
  if (isPresent(rowClause)) {
    return deserializeRowClause(rowClause, doc).map((row) => ({ row }));
  }

  const requestClause = node.getChild(terms.RequestClause);
  if (isPresent(requestClause)) {
    return deserializeRequestClause(requestClause, doc).map((request) => ({
      request,
    }));
  }

  const responseClause = node.getChild(terms.ResponseClause);
  if (isPresent(responseClause)) {
    return deserializeResponseClause(responseClause, doc).map((response) => ({
      response,
    }));
  }

  const stringClause = node.getChild(terms.StringClause);
  if (isPresent(stringClause)) {
    return deserializeStringClause(stringClause, doc);
  }

  const presetClause = node.getChild(terms.PresetClause);
  if (isPresent(presetClause)) {
    return deserializePresetClause(presetClause, doc).map((preset) => ({
      preset,
    }));
  }

  const sourceClause = node.getChild(terms.SourceClause);
  if (isPresent(sourceClause)) {
    return deserializeSourceClause(sourceClause, doc).map((source) => ({
      source,
    }));
  }

  return err(new InvalidQuery());
};
