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
  WsNamespace: tags.attributeName,
  StreamNamespace: tags.attributeName,

  // Fields
  WsStringFieldName: tags.attributeName,
  WsDateFieldName: tags.attributeName,
  StreamBoolFieldName: tags.attributeName,
  StreamIntFieldName: tags.attributeName,
  StreamStringFieldName: tags.attributeName,

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
