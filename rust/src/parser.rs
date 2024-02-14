use pest::Parser;
use pest_derive::Parser;

use crate::{Query, Result};

#[derive(Parser)]
#[grammar = "httpql.pest"]
pub struct HTTPQLParser;

fn parse(input: &str) -> Result<Query> {
    let pairs = HTTPQLParser::parse(Rule::HTTPQL, input)?;

    for pair in pairs {
        match pair.as_rule() {
            _ => {}
        }
    }

    todo!()
}

#[cfg(test)]
mod tests {
    use super::*;
    use pest::Parser;

    #[test]
    fn parse_1() {
        let input = include_str!("../../tests/1.httpql");
        let pairs = HTTPQLParser::parse(Rule::HTTPQL, input).unwrap();
    }
}
