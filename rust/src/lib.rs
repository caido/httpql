use pest::Parser;
use pest_derive::Parser;

#[derive(Parser)]
#[grammar = "httpql.pest"]
pub struct HTTPQLParser;

#[cfg(test)]
mod tests {
    use super::HTTPQLParser;
    use pest::Parser;

    #[test]
    fn parse_1() {
        let input = include_str!("../../tests/1.httpql");
        let pairs = HTTPQLParser::parse(crate::Rule::HTTPQL, input).unwrap();
    }
}
