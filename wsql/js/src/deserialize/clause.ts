import type { SyntaxNode } from "@lezer/common";
import { err, type Result } from "neverthrow";

import { type WSQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import { type Query } from "../primitives.js";
import { isPresent } from "../utils.js";

import { deserializeWsClause } from "./clause.websocket.js";
import { deserializeStreamClause } from "./clause.stream.js";

export const deserializeClause = (
  node: SyntaxNode,
  doc: string,
): Result<Query, WSQLError> => {

  const streamClause = node.getChild(terms.StreamClause);
  if (isPresent(streamClause)) {
    return deserializeStreamClause(streamClause, doc).map((stream) => ({
      stream,
    }));
  }

  const wsClause = node.getChild(terms.WsClause);
  if (isPresent(wsClause)) {
    return deserializeWsClause(wsClause, doc).map((websocket) => ({
      websocket,
    }));
  }

  return err(new InvalidQuery());
};
