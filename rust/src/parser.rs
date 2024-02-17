use pest::iterators::Pair;
use pest::Parser;
use pest_derive::Parser;

use crate::error::*;
use crate::primitives::*;

#[derive(Parser)]
#[grammar = "httpql.pest"]
struct HTTPQLParser;

fn build_expr_string_ast(pair: Pair<Rule>) -> Result<ExprString> {
    let mut pair = pair.into_inner();
    let operator = pair.next().unwrap();
    let operator = match operator.as_rule() {
        Rule::StringOperator => match operator.as_str() {
            "eq" => OperatorString::Eq,
            "ne" => OperatorString::Ne,
            "cont" => OperatorString::Cont,
            "ncont" => OperatorString::Ncont,
            "like" => OperatorString::Like,
            "nlike" => OperatorString::Nlike,
            "regex" => OperatorString::Regex,
            "nregex" => OperatorString::Nregex,
            _ => unreachable!(),
        },
        _ => unreachable!(),
    };
    let value = pair.next().unwrap();
    let value = match value.as_rule() {
        Rule::StringValue => value.into_inner().next().unwrap().as_str().to_string(),
        _ => unreachable!(),
    };
    Ok(ExprString { value, operator })
}

fn build_expr_int_ast(pair: Pair<Rule>) -> Result<ExprInt> {
    let mut pair = pair.into_inner();
    let operator = pair.next().unwrap();
    let operator = match operator.as_rule() {
        Rule::IntOperator => match operator.as_str() {
            "lt" => OperatorInt::Lt,
            "lte" => OperatorInt::Lte,
            "gt" => OperatorInt::Gt,
            "gte" => OperatorInt::Gte,
            "eq" => OperatorInt::Eq,
            "ne" => OperatorInt::Ne,
            _ => unreachable!(),
        },
        _ => unreachable!(),
    };
    let value = pair.next().unwrap();
    let value = match value.as_rule() {
        Rule::IntValue => value.as_str().parse().unwrap(),
        _ => unreachable!(),
    };
    Ok(ExprInt { value, operator })
}

fn build_expr_preset_ast(pair: Pair<Rule>) -> Result<ExprPreset> {
    let mut pair = pair.into_inner();
    let value = pair.next().unwrap();
    let expr = match value.as_rule() {
        Rule::StringValue => {
            let name = value.into_inner().next().unwrap().as_str().to_string();
            ExprPreset::Name(name)
        }
        Rule::SymbolValue => {
            let alias = value.as_str().to_string();
            ExprPreset::Alias(alias)
        }
        _ => unreachable!(),
    };
    Ok(expr)
}

fn build_request_clause_ast(pair: Pair<Rule>) -> Result<ClauseRequest> {
    let mut clause = ClauseRequest::default();

    let mut pair = pair.into_inner();
    let field = pair.next().unwrap();
    let expr = pair.next().unwrap();
    match field.as_rule() {
        Rule::RequestIntFieldName => match field.as_str() {
            "port" => {
                clause.port = Some(build_expr_int_ast(expr)?);
            }
            _ => unreachable!(),
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
            "raw" => {
                clause.raw = Some(build_expr_string_ast(expr)?);
            }
            _ => unreachable!(),
        },
        _ => unreachable!(),
    };

    Ok(clause)
}

fn build_response_clause_ast(pair: Pair<Rule>) -> Result<ClauseResponse> {
    let mut clause = ClauseResponse::default();

    let mut pair = pair.into_inner();
    let field = pair.next().unwrap();
    let expr = pair.next().unwrap();
    match field.as_rule() {
        Rule::ResponseIntFieldName => match field.as_str() {
            "code" => {
                clause.status_code = Some(build_expr_int_ast(expr)?);
            }
            _ => unreachable!(),
        },
        Rule::ResponseStringFieldName => match field.as_str() {
            "raw" => {
                clause.raw = Some(build_expr_string_ast(expr)?);
            }
            _ => unreachable!(),
        },
        _ => unreachable!(),
    };

    Ok(clause)
}

fn build_string_clause_ast(pair: Pair<Rule>) -> Result<Query> {
    let mut pair = pair.into_inner();

    let value = pair.next().unwrap();
    let value = match value.as_rule() {
        Rule::StringValue => value.into_inner().next().unwrap().as_str().to_string(),
        _ => unreachable!(),
    };

    Ok(Query {
        and: Some((
            Box::new(Query {
                request: Some(ClauseRequest {
                    raw: Some(ExprString {
                        value: value.clone(),
                        operator: OperatorString::Cont,
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

    let expr = pair.next().unwrap();
    let expr = match expr.as_rule() {
        Rule::PresetAliasExpression => build_expr_preset_ast(expr)?,
        Rule::PresetNameExpression => build_expr_preset_ast(expr)?,
        _ => unreachable!(),
    };

    Ok(Query {
        preset: Some(expr),
        ..Default::default()
    })
}

fn build_clause_ast(pair: Pair<Rule>) -> Result<Query> {
    match pair.as_rule() {
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
        _ => unreachable!(),
    }
}

fn build_query_ast(pair: Pair<Rule>) -> Result<Query> {
    let mut pair = pair.into_inner();

    let clause = pair.next().unwrap();
    let mut query = build_clause_ast(clause)?;

    while let Some(operator) = pair.next() {
        let clause = pair.next().unwrap();
        let clause = build_clause_ast(clause)?;

        match operator.as_rule() {
            Rule::Or => {
                query = Query {
                    or: Some((Box::new(query), Box::new(clause))),
                    ..Default::default()
                }
            }
            Rule::And => {
                query = Query {
                    and: Some((Box::new(query), Box::new(clause))),
                    ..Default::default()
                }
            }
            _ => unreachable!(),
        }
    }

    Ok(query)
}

pub fn parse(input: &str) -> Result<Query> {
    let mut pairs = HTTPQLParser::parse(Rule::HTTPQL, input)?;

    let pair = pairs.next().unwrap();
    match pair.as_rule() {
        Rule::HTTPQL => {
            let pair = pair.into_inner().next().unwrap();
            build_query_ast(pair)
        }
        _ => unreachable!(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_1() {
        let input = include_str!("../../tests/basic.httpql");
        let query = parse(input).unwrap();
        println!("query: {}", query);
    }
}
