import type { SyntaxNode } from "@lezer/common";
import { err, type Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import type { Query } from "../primitives.js";
import { isPresent } from "../utils.js";

import { deserializePresetQuery } from "./query.preset.js";
import { deserializeRequestQuery } from "./query.request.js";
import { deserializeResponseQuery } from "./query.response.js";
import { deserializeRowQuery } from "./query.row.js";
import { deserializeSourceQuery } from "./query.source.js";

export const deserializeSingleQuery = (
  node: SyntaxNode,
  doc: string,
): Result<Query, HTTPQLError> => {
  const rowQuery = node.getChild(terms.RowQuery);
  if (isPresent(rowQuery)) {
    return deserializeRowQuery(rowQuery, doc).map((row) => {
      return {
        row,
      };
    });
  }

  const requestQuery = node.getChild(terms.RequestQuery);
  if (isPresent(requestQuery)) {
    return deserializeRequestQuery(requestQuery, doc).map((request) => {
      return {
        request,
      };
    });
  }

  const responseQuery = node.getChild(terms.ResponseQuery);
  if (isPresent(responseQuery)) {
    return deserializeResponseQuery(responseQuery, doc).map((response) => {
      return {
        response,
      };
    });
  }

  const presetQuery = node.getChild(terms.PresetQuery);
  if (isPresent(presetQuery)) {
    return deserializePresetQuery(presetQuery, doc).map((preset) => {
      return {
        preset,
      };
    });
  }

  const sourceQuery = node.getChild(terms.SourceQuery);
  if (isPresent(sourceQuery)) {
    return deserializeSourceQuery(sourceQuery, doc).map((source) => {
      return {
        source,
      };
    });
  }

  return err(new InvalidQuery());
};
