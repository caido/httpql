import type { SyntaxNode } from "@lezer/common";
import { err, ok, type Result } from "neverthrow";

import type { FilterExprPresetInput } from "../primitives";
import { getChildString, isPresent } from "../utils";
import { terms } from "../parser";
import { HTTPQLError, InvalidQuery } from "../errors";

import type { Options } from "./types";

export const deserializePresetQuery = (
  node: SyntaxNode,
  doc: string,
  options: Options
): Result<FilterExprPresetInput, HTTPQLError> => {
  const presets = options.presets ?? [];
  const nameStr = getChildString(node, terms.PresetNameExpression, doc);

  if (isPresent(nameStr)) {
    try {
      const parsed = JSON.parse(nameStr);
      const preset = presets.find((p) => {
        return p.name.toLowerCase() === parsed.toLowerCase();
      });

      if (isPresent(preset)) {
        return ok({
          id: preset.id,
        });
      }
    } catch {
      return err(new InvalidQuery());
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
      });
    }
  }

  return err(new InvalidQuery());
};
