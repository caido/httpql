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
    let operator = pair.next().required("StringExpression.operator")?;
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
            t => unknown!("StringOperator.{}", t),
        },
        t => unknown!("StringExpression.operator.{:?}", t),
    };
    let value = pair.next().required("StringExpression.value")?;
    let value = match value.as_rule() {
        Rule::StringValue => value
            .into_inner()
            .next()
            .required("StringValue.content")?
            .as_str()
            .to_string(),
        t => unknown!("StringExpression.value.{:?}", t),
    };
    Ok(ExprString { value, operator })
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

fn build_expr_preset_ast(pair: Pair<Rule>) -> Result<ExprPreset> {
    let mut pair = pair.into_inner();
    let value = pair.next().required("PresetExpression.value")?;
    let expr = match value.as_rule() {
        Rule::StringValue => {
            let name = value
                .into_inner()
                .next()
                .required("StringValue.content")?
                .as_str()
                .to_string();
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

fn build_request_clause_ast(pair: Pair<Rule>) -> Result<ClauseRequest> {
    let mut clause = ClauseRequest::default();

    let mut pair = pair.into_inner();
    let field = pair.next().required("RequestClause.field")?;
    let expr = pair.next().required("RequestClause.expr")?;
    match field.as_rule() {
        Rule::RequestIntFieldName => match field.as_str() {
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
    let value = match value.as_rule() {
        Rule::StringValue => value
            .into_inner()
            .next()
            .required("StringValue.content")?
            .as_str()
            .to_string(),
        t => unknown!("StringClause.value.{:?}", t),
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
        t => unknown!("Clause.{:?}", t),
    }
}

fn build_query_ast(pair: Pair<Rule>) -> Result<Query> {
    let mut pair = pair.into_inner();

    let clause = pair.next().required("Query.clause")?;
    let mut query = build_clause_ast(clause)?;

    while let Some(operator) = pair.next() {
        let clause = pair.next().required("Query.clause")?;
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
            t => unknown!("Query.operator.{:?}", t),
        }
    }

    Ok(query)
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

    fn read_case(case: u32) -> (String, String) {
        let input = std::fs::read_to_string(format!("../tests/{}/input.httpql", case)).unwrap();
        let output = std::fs::read_to_string(format!("../tests/{}/output.ast", case)).unwrap();
        (input, output)
    }

    #[rstest]
    #[case(1)]
    #[case(2)]
    #[case(3)]
    #[case(4)]
    fn test_parse(#[case] case: u32) {
        let (input, output) = read_case(case);
        let query = parse(&input).unwrap();
        assert_eq!(output.trim(), query.to_string().trim());
    }
}
