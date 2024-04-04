import type { SyntaxNode } from "@lezer/common";
import { err, ok, type Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors";
import { terms } from "../parser";
import type { ExprPreset, Options } from "../primitives";
import { ExprPresetSource } from "../primitives";
import { getChildString, isPresent } from "../utils";

import { deserializeString } from "./string";

export const deserializePresetQuery = (
  node: SyntaxNode,
  doc: string,
  options: Options,
): Result<ExprPreset, HTTPQLError> => {
  const presets = options.presets ?? [];
  const nameNode = node.getChild(terms.PresetNameExpression);

  if (isPresent(nameNode)) {
    const parsed = deserializeString(nameNode, doc);
    if (parsed.isErr()) {
      return err(parsed.error);
    }

    const preset = presets.find((p) => {
      return p.name.toLowerCase() === parsed.value.toLowerCase();
    });

    if (isPresent(preset)) {
      return ok({
        id: preset.id,
        source: ExprPresetSource.Name,
      });
    }
  }

  const aliasStr = getChildString(node, terms.PresetAliasExpression, doc);
  if (isPresent(aliasStr)) {
    const preset = presets.find((p) => {
      return p.alias.toLowerCase() === aliasStr.toLowerCase();
    });

    if (isPresent(preset)) {
      return ok({
        id: preset.id,
        source: ExprPresetSource.Alias,
      });
    }
  }

  return err(new InvalidQuery());
};
