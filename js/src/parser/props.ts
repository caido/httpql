import type { NodePropSource } from "@lezer/common";
import { styleTags, tags } from "@lezer/highlight";

export const highlight: NodePropSource = styleTags({
  // Operators
  "IntExpression/IntOperator": tags.operator,
  "StringExpression/StringOperator": tags.operator,
  "StringExpression/RegexOperator": tags.operator,
  "DateExpression/DateOperator": tags.operator,
  "BoolExpression/BoolOperator": tags.operator,

  // Namespaces
  RequestNamespace: tags.attributeName,
  ResponseNamespace: tags.attributeName,
  PresetNamespace: tags.attributeName,
  SourceNamespace: tags.attributeName,
  RowNamespace: tags.attributeName,

  // Fields
  RequestIntFieldName: tags.attributeName,
  RequestStringFieldName: tags.attributeName,
  RequestDateFieldName: tags.attributeName,
  RequestBoolFieldName: tags.attributeName,
  ResponseIntFieldName: tags.attributeName,
  ResponseStringFieldName: tags.attributeName,
  RowIntFieldName: tags.attributeName,

  // Values
  SymbolValue: tags.literal,
  "IntExpression/IntValue": tags.integer,
  "BoolExpression/BoolValue": tags.bool,
  "StringValue/...": tags.string,
  "RegexValue/...": tags.string,

  // Comments
  "BlockComment/...": tags.comment,
  LineComment: tags.comment,
});
