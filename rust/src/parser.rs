use lazy_static::lazy_static;
use pest::iterators::Pair;
use pest::pratt_parser::{Assoc, Op, PrattParser};
use pest::Parser;
use pest_derive::Parser;

use crate::error::*;
use crate::primitives::*;

#[derive(Parser)]
#[grammar = "httpql.pest"]
struct HTTPQLParser;

lazy_static! {
    static ref PRATT_PARSER: PrattParser<Rule> = PrattParser::new()
        .op(Op::infix(Rule::Or, Assoc::Left))
        .op(Op::infix(Rule::And, Assoc::Left));
}

struct ParsedString {
    value: String,
    is_raw: bool,
}

fn build_string_ast(pair: Pair<Rule>) -> Result<ParsedString> {
    let result = match pair.as_rule() {
        Rule::StringValue => match serde_json::from_str(pair.as_str()) {
            Ok(serde_json::Value::String(value)) => ParsedString {
                value,
                is_raw: false,
            },
            _ => invalid!("StringValue.content"),
        },
        Rule::RegexValue => ParsedString {
            value: pair
                .into_inner()
                .next()
                .required("RegexValue.content")?
                .as_str()
                .to_string(),
            is_raw: true,
        },
        t => unknown!("StringExpression.value.{:?}", t),
    };
    Ok(result)
}

fn build_expr_string_ast(pair: Pair<Rule>) -> Result<ExprString> {
    let mut pair = pair.into_inner();
    let operator = pair.next().required("StringExpression.operator")?;
    let operator = match operator.as_rule() {
        Rule::StringOperator => match operator.as_str() {
            "eq" => OperatorString::Eq,
            "ne" => OperatorString::Ne,
            "cont" => OperatorString::Cont,
            "ncont" => OperatorString::Ncont,
            "like" => OperatorString::Like,
            "nlike" => OperatorString::Nlike,
            t => unknown!("StringOperator.{}", t),
        },
        Rule::RegexOperator => match operator.as_str() {
            "regex" => OperatorString::Regex,
            "nregex" => OperatorString::Nregex,
            t => unknown!("RegexOperator.{}", t),
        },
        t => unknown!("StringExpression.operator.{:?}", t),
    };
    let value = pair.next().required("StringExpression.value")?;
    let ParsedString { value, is_raw } = build_string_ast(value)?;
    Ok(ExprString {
        value,
        operator,
        is_raw,
    })
}

fn build_expr_int_ast(pair: Pair<Rule>) -> Result<ExprInt> {
    let mut pair = pair.into_inner();
    let operator = pair.next().required("IntExpression.operator")?;
    let operator = match operator.as_rule() {
        Rule::IntOperator => match operator.as_str() {
            "lt" => OperatorInt::Lt,
            "lte" => OperatorInt::Lte,
            "gt" => OperatorInt::Gt,
            "gte" => OperatorInt::Gte,
            "eq" => OperatorInt::Eq,
            "ne" => OperatorInt::Ne,
            t => unknown!("IntOperator.{}", t),
        },
        t => unknown!("IntExpression.operator.{:?}", t),
    };
    let value = pair.next().required("IntExpression.value")?;
    let value = match value.as_rule() {
        Rule::IntValue => value.as_str().parse().required("IntValue")?,
        t => unknown!("IntExpression.value.{:?}", t),
    };
    Ok(ExprInt { value, operator })
}

fn build_expr_date_ast(pair: Pair<Rule>) -> Result<ExprDate> {
    let mut pair = pair.into_inner();
    let operator = pair.next().required("DateExpression.operator")?;
    let operator = match operator.as_rule() {
        Rule::DateOperator => match operator.as_str() {
            "lt" => OperatorDate::Lt,
            "gt" => OperatorDate::Gt,
            t => unknown!("DateOperator.{}", t),
        },
        t => unknown!("DateExpression.operator.{:?}", t),
    };
    let value = pair.next().required("DateExpression.value")?;
    let ParsedString { value, is_raw } = build_string_ast(value)?;
    if is_raw {
        invalid!("DateExpression.value");
    }
    Ok(ExprDate { value, operator })
}

fn build_expr_bool_ast(pair: Pair<Rule>) -> Result<ExprBool> {
    let mut pair = pair.into_inner();
    let operator = pair.next().required("BoolExpression.operator")?;
    let operator = match operator.as_rule() {
        Rule::BoolOperator => match operator.as_str() {
            "eq" => OperatorBool::Eq,
            "ne" => OperatorBool::Ne,
            t => unknown!("BoolOperator.{}", t),
        },
        t => unknown!("BoolExpression.operator.{:?}", t),
    };
    let value = pair.next().required("BoolExpression.value")?;
    let value = match value.as_rule() {
        Rule::BoolValue => value.as_str().parse().required("BoolValue")?,
        t => unknown!("BoolExpression.value.{:?}", t),
    };
    Ok(ExprBool { value, operator })
}

fn build_expr_preset_ast(pair: Pair<Rule>) -> Result<ExprPreset> {
    let mut pair = pair.into_inner();
    let value = pair.next().required("PresetExpression.value")?;
    let expr = match value.as_rule() {
        Rule::StringValue => {
            let ParsedString { value: name, .. } = build_string_ast(value)?;
            ExprPreset::Name(name)
        }
        Rule::SymbolValue => {
            let alias = value.as_str().to_string();
            ExprPreset::Alias(alias)
        }
        t => unknown!("PresetExpression.value.{:?}", t),
    };
    Ok(expr)
}

fn build_expr_source_ast(pair: Pair<Rule>) -> Result<ExprSource> {
    let mut pair = pair.into_inner();
    let value = pair.next().required("SourceExpression.value")?;
    let expr = match value.as_rule() {
        Rule::StringValue => {
            let ParsedString {
                value: name,
                is_raw,
            } = build_string_ast(value)?;
            if is_raw {
                invalid!("SourceExpression.value");
            }
            ExprSource { name }
        }
        t => unknown!("SourceExpression.value.{:?}", t),
    };
    Ok(expr)
}

fn build_row_clause_ast(pair: Pair<Rule>) -> Result<ClauseRow> {
    let mut clause = ClauseRow::default();

    let mut pair = pair.into_inner();
    let field = pair.next().required("ClauseRow.field")?;
    let expr = pair.next().required("ClauseRow.expr")?;
    match field.as_rule() {
        Rule::RowIntFieldName => match field.as_str() {
            "id" => {
                clause.id = Some(build_expr_int_ast(expr)?);
            }
            t => unknown!("RowIntFieldName.{}", t),
        },
        t => unknown!("ClauseRow.field.{:?}", t),
    };

    Ok(clause)
}

fn build_request_clause_ast(pair: Pair<Rule>) -> Result<ClauseRequest> {
    let mut clause = ClauseRequest::default();

    let mut pair = pair.into_inner();
    let field = pair.next().required("RequestClause.field")?;
    let expr = pair.next().required("RequestClause.expr")?;
    match field.as_rule() {
        Rule::RequestIntFieldName => match field.as_str() {
            "len" => {
                clause.length = Some(build_expr_int_ast(expr)?);
            }
            "port" => {
                clause.port = Some(build_expr_int_ast(expr)?);
            }
            t => unknown!("RequestIntFieldName.{}", t),
        },
        Rule::RequestStringFieldName => match field.as_str() {
            "ext" => {
                clause.file_extension = Some(build_expr_string_ast(expr)?);
            }
            "host" => {
                clause.host = Some(build_expr_string_ast(expr)?);
            }
            "method" => {
                clause.method = Some(build_expr_string_ast(expr)?);
            }
            "path" => {
                clause.path = Some(build_expr_string_ast(expr)?);
            }
            "query" => {
                clause.query = Some(build_expr_string_ast(expr)?);
            }
            "raw" => {
                clause.raw = Some(build_expr_string_ast(expr)?);
            }
            t => unknown!("RequestStringFieldName.{}", t),
        },
        Rule::RequestDateFieldName => match field.as_str() {
            "created_at" => {
                clause.created_at = Some(build_expr_date_ast(expr)?);
            }
            t => unknown!("RequestDateFieldName.{}", t),
        },
        Rule::RequestBoolFieldName => match field.as_str() {
            "tls" => {
                clause.is_tls = Some(build_expr_bool_ast(expr)?);
            }
            t => unknown!("RequestBoolFieldName.{}", t),
        },
        t => unknown!("RequestClause.field.{:?}", t),
    };

    Ok(clause)
}

fn build_response_clause_ast(pair: Pair<Rule>) -> Result<ClauseResponse> {
    let mut clause = ClauseResponse::default();

    let mut pair = pair.into_inner();
    let field = pair.next().required("ResponseClause.field")?;
    let expr = pair.next().required("ResponseClause.expr")?;
    match field.as_rule() {
        Rule::ResponseIntFieldName => match field.as_str() {
            "code" => {
                clause.status_code = Some(build_expr_int_ast(expr)?);
            }
            "len" => {
                clause.length = Some(build_expr_int_ast(expr)?);
            }
            "roundtrip" => {
                clause.roundtrip_time = Some(build_expr_int_ast(expr)?);
            }
            t => unknown!("ResponseIntFieldName.{}", t),
        },
        Rule::ResponseStringFieldName => match field.as_str() {
            "raw" => {
                clause.raw = Some(build_expr_string_ast(expr)?);
            }
            t => unknown!("ResponseStringFieldName.{}", t),
        },
        t => unknown!("ResponseClause.field.{:?}", t),
    };

    Ok(clause)
}

fn build_string_clause_ast(pair: Pair<Rule>) -> Result<Query> {
    let mut pair = pair.into_inner();

    let value = pair.next().required("StringClause.value")?;
    let ParsedString { value, .. } = build_string_ast(value)?;

    Ok(Query {
        or: Some((
            Box::new(Query {
                request: Some(ClauseRequest {
                    raw: Some(ExprString {
                        value: value.clone(),
                        operator: OperatorString::Cont,
                        is_raw: false,
                    }),
                    ..Default::default()
                }),
                ..Default::default()
            }),
            Box::new(Query {
                response: Some(ClauseResponse {
                    raw: Some(ExprString {
                        value,
                        operator: OperatorString::Cont,
                        is_raw: false,
                    }),
                    ..Default::default()
                }),
                ..Default::default()
            }),
        )),
        ..Default::default()
    })
}

fn build_preset_clause_ast(pair: Pair<Rule>) -> Result<Query> {
    let mut pair = pair.into_inner();

    let expr = pair.next().required("PresetClause.expr")?;
    let expr = match expr.as_rule() {
        Rule::PresetAliasExpression => build_expr_preset_ast(expr)?,
        Rule::PresetNameExpression => build_expr_preset_ast(expr)?,
        t => unknown!("PresetClause.expr.{:?}", t),
    };

    Ok(Query {
        preset: Some(expr),
        ..Default::default()
    })
}

fn build_source_clause_ast(pair: Pair<Rule>) -> Result<Query> {
    let mut pair = pair.into_inner();

    let expr = pair.next().required("SourceClause.expr")?;
    let expr = match expr.as_rule() {
        Rule::SourceNameExpression => build_expr_source_ast(expr)?,
        t => unknown!("SourceClause.expr.{:?}", t),
    };

    Ok(Query {
        source: Some(expr),
        ..Default::default()
    })
}

fn build_clause_ast(pair: Pair<Rule>) -> Result<Query> {
    match pair.as_rule() {
        Rule::RowClause => {
            let query = Query {
                row: Some(build_row_clause_ast(pair)?),
                ..Default::default()
            };
            Ok(query)
        }
        Rule::RequestClause => {
            let query = Query {
                request: Some(build_request_clause_ast(pair)?),
                ..Default::default()
            };
            Ok(query)
        }
        Rule::ResponseClause => {
            let query = Query {
                response: Some(build_response_clause_ast(pair)?),
                ..Default::default()
            };
            Ok(query)
        }
        Rule::Query => build_query_ast(pair),
        Rule::StringClause => build_string_clause_ast(pair),
        Rule::PresetClause => build_preset_clause_ast(pair),
        Rule::SourceClause => build_source_clause_ast(pair),
        t => unknown!("Clause.{:?}", t),
    }
}

fn build_query_ast(pair: Pair<Rule>) -> Result<Query> {
    let pair = pair.into_inner();

    if pair.peek().is_none() {
        return Ok(Query::default());
    }

    PRATT_PARSER
        .map_primary(|primary| build_clause_ast(primary))
        .map_infix(|lhs, op, rhs| {
            let lhs = lhs?;
            let rhs = rhs?;

            let query = match op.as_rule() {
                Rule::Or => Query {
                    or: Some((Box::new(lhs), Box::new(rhs))),
                    ..Default::default()
                },
                Rule::And => Query {
                    and: Some((Box::new(lhs), Box::new(rhs))),
                    ..Default::default()
                },
                t => unknown!("Query.operator.{:?}", t),
            };

            Ok(query)
        })
        .parse(pair)
}

pub fn parse(input: &str) -> Result<Query> {
    let mut pairs = HTTPQLParser::parse(Rule::HTTPQL, input)?;

    let pair = pairs.next().required("HTTPQL")?;
    match pair.as_rule() {
        Rule::HTTPQL => {
            let pair = pair.into_inner().next().required("HTTPQL.query")?;
            build_query_ast(pair)
        }
        t => unknown!("HTTPQL.{:?}", t),
    }
}

#[cfg(test)]
mod tests {
    use rstest::rstest;

    use super::*;

    #[rstest]
    #[case("", "()")]
    #[case("   ", "()")]
    fn test_parse(#[case] input: String, #[case] output: String) {
        let query = parse(&input).unwrap();
        assert_eq!(output, query.to_string(),);
    }
}
