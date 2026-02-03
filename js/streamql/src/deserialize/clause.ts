import type { SyntaxNode } from "@lezer/common";
import { err, type Result } from "neverthrow";

import { InvalidQuery, type StreamQLError } from "../errors.js";
import { terms } from "../parser/index.js";
import { type Query } from "../primitives.js";
import { isPresent } from "../utils.js";

import { deserializePresetClause } from "./clause.preset.js";
import { deserializeStreamClause } from "./clause.stream.js";
import { deserializeWsClause } from "./clause.websocket.js";

export const deserializeClause = (
  node: SyntaxNode,
  doc: string,
): Result<Query, StreamQLError> => {
  const presetClause = node.getChild(terms.PresetClause);
  if (isPresent(presetClause)) {
    return deserializePresetClause(presetClause, doc).map((preset) => ({
      preset,
    }));
  }

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
