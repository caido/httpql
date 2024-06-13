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
    use regex::Regex;
    use rstest::rstest;
    use serde::Deserialize;

    use super::*;

    #[derive(Deserialize)]
    #[serde(tag = "expect", rename_all = "snake_case")]
    enum Test {
        Ok { input: String, result: bool },
        Err,
    }

    #[rstest]
    #[case(1)]
    #[case(2)]
    #[case(3)]
    #[case(4)]
    #[case(5)]
    #[case(6)]
    #[case(7)]
    #[case(8)]
    fn test_ast(#[case] case: u32) {
        let input = std::fs::read_to_string(format!("../tests/ast/{case}/input.httpql")).unwrap();
        let output = std::fs::read_to_string(format!("../tests/ast/{case}/output.ast")).unwrap();
        let query = HTTPQL::parse(&input).unwrap();
        assert_eq!(output.trim(), query.to_string().trim());
    }

    #[rstest]
    #[case(1)]
    #[case(2)]
    #[case(3)]
    #[case(4)]
    #[case(5)]
    #[case(6)]
    #[case(7)]
    #[case(8)]
    fn test_regex(#[case] case: u32) {
        let input =
            std::fs::read_to_string(format!("../tests/regex/{}/input.httpql", case)).unwrap();
        let test = serde_json::from_str::<Test>(
            &std::fs::read_to_string(format!("../tests/regex/{}/test.json", case)).unwrap(),
        )
        .unwrap();

        let query = HTTPQL::parse(&input);
        match test {
            Test::Err if query.is_err() => (),
            Test::Err => panic!("Expected error"),
            Test::Ok { input, result } => {
                let expr = query.unwrap().request.unwrap().raw.unwrap();
                let regex = Regex::new(&expr.value).unwrap();
                assert_eq!(regex.is_match(&input), result);
            }
        }
    }

    #[rstest]
    #[case(1)]
    #[case(2)]
    fn test_string(#[case] case: u32) {
        let input =
            std::fs::read_to_string(format!("../tests/string/{}/input.httpql", case)).unwrap();
        let test = serde_json::from_str::<Test>(
            &std::fs::read_to_string(format!("../tests/string/{}/test.json", case)).unwrap(),
        )
        .unwrap();

        let query = HTTPQL::parse(&input);
        match test {
            Test::Err if query.is_err() => (),
            Test::Err => panic!("Expected error"),
            Test::Ok { input, result } => {
                let expr = query.unwrap().request.unwrap().raw.unwrap();
                assert_eq!(expr.value == input, result);
            }
        }
    }
}
