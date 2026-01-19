use lazy_static::lazy_static;
use pest::iterators::Pair;
use pest::pratt_parser::{Assoc, Op, PrattParser};
use pest::Parser;
use pest_derive::Parser;

use crate::error::*;
use crate::primitives::*;

#[derive(Parser)]
#[grammar = "wsql.pest"]
struct WSQLParser;

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

fn build_stream_clause_ast(pair: Pair<Rule>) -> Result<ClauseStream> {
    let mut clause = ClauseStream::default();

    let mut pair = pair.into_inner();
    let field = pair.next().required("StreamClause.field")?;
    let expr = pair.next().required("StreamClause.expr")?;
    match field.as_rule() {
        Rule::StreamIntFieldName => match field.as_str() {
            "port" => {
                clause.port = Some(build_expr_int_ast(expr)?);
            }
            t => unknown!("StreamIntFieldName.{}", t),
        },
        Rule::StreamStringFieldName => match field.as_str() {
            "host" => {
                clause.host = Some(build_expr_string_ast(expr)?);
            }
            "path" => {
                clause.path = Some(build_expr_string_ast(expr)?);
            }
            "source" => {
                clause.source = Some(build_expr_string_ast(expr)?);
            }
            "protocol" => {
                clause.protocol = Some(build_expr_string_ast(expr)?);
            }
            t => unknown!("StreamtringFieldName.{}", t),
        },
        Rule::StreamBoolFieldName => match field.as_str() {
            "tls" => {
                clause.is_tls = Some(build_expr_bool_ast(expr)?);
            }
            t => unknown!("StreamBoolFieldName.{}", t),
        },
        t => unknown!("StreamClause.field.{:?}", t),
    };

    Ok(clause)
}

fn build_ws_clause_ast(pair: Pair<Rule>) -> Result<ClauseWs> {
    let mut clause = ClauseWs::default();

    let mut pair = pair.into_inner();
    let field = pair.next().required("WsClause.field")?;
    let expr = pair.next().required("WsClause.expr")?;
    match field.as_rule() {
        Rule::WsStringFieldName => match field.as_str() {
            "direction" => {
                clause.direction = Some(build_expr_string_ast(expr)?);
            }
            "raw" => {
                clause.raw = Some(build_expr_string_ast(expr)?);
            }
            "format" => {
                clause.format = Some(build_expr_string_ast(expr)?);
            }
            t => unknown!("WsStringFieldName.{}", t),
        },
        Rule::WsDateFieldName => match field.as_str() {
            "created_at" => {
                clause.created_at = Some(build_expr_date_ast(expr)?);
            }
            t => unknown!("WsDateFieldName.{}", t),
        },

        t => unknown!("WsClause.field.{:?}", t),
    };

    Ok(clause)
}

fn build_string_clause_ast(pair: Pair<Rule>) -> Result<Query> {
    let mut pair = pair.into_inner();

    let value = pair.next().required("StringClause.value")?;
    let ParsedString { value, .. } = build_string_ast(value)?;

    Ok(Query {
        websocket: Some(ClauseWs {
            raw: Some(ExprString {
                value: value.clone(),
                operator: OperatorString::Cont,
                is_raw: false,
            }),
            ..Default::default()
        }),
        ..Default::default()
    })
}

fn build_clause_ast(pair: Pair<Rule>) -> Result<Query> {
    match pair.as_rule() {
        Rule::StreamClause => {
            let query = Query {
                stream: Some(build_stream_clause_ast(pair)?),
                ..Default::default()
            };
            Ok(query)
        }
        Rule::WsClause => {
            let query = Query {
                websocket: Some(build_ws_clause_ast(pair)?),
                ..Default::default()
            };
            Ok(query)
        }
        Rule::Query => build_query_ast(pair),
        Rule::StringClause => build_string_clause_ast(pair),
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
    let mut pairs = WSQLParser::parse(Rule::WSQL, input)?;

    let pair = pairs.next().required("WSQL")?;
    match pair.as_rule() {
        Rule::WSQL => {
            let pair = pair.into_inner().next().required("WSQL.query")?;
            build_query_ast(pair)
        }
        t => unknown!("WSQL.{:?}", t),
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
