pub use self::error::*;
pub use self::primitives::*;

mod error;
mod parser;
mod primitives;

pub struct HTTPQL;

impl HTTPQL {
    pub fn parse(input: &str) -> Result<Query> {
        parser::parse(input)
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
    #[case(5)]
    #[case(6)]
    fn test_httpql(#[case] case: u32) {
        let (input, output) = read_case(case);
        let query = HTTPQL::parse(&input).unwrap();
        assert_eq!(output.trim(), query.to_string().trim());
    }
}
