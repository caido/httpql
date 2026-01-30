pub use self::error::*;
pub use self::primitives::*;

mod error;
mod parser;
mod primitives;

pub struct StreamQL;

impl StreamQL {
    pub fn parse(input: &str) -> Result<Query> {
        parser::parse(input)
    }
}

#[cfg(test)]
mod tests {
    use regex::Regex;
    use rstest::rstest;

    use super::*;
    use serde::Deserialize;

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
    fn test_ast(#[case] case: u32) {
        let input =
            std::fs::read_to_string(format!("../../tests/streamql/ast/{case}/input.streamql"))
                .unwrap();
        let output =
            std::fs::read_to_string(format!("../../tests/streamql/ast/{case}/output.ast")).unwrap();
        let query = StreamQL::parse(&input).unwrap();
        assert_eq!(output.trim(), query.to_string().trim());
    }

    #[rstest]
    #[case(1)]
    #[case(2)]
    #[case(3)]
    #[case(4)]
    #[case(5)]
    #[case(6)]
    fn test_error(#[case] case: u32) {
        let input =
            std::fs::read_to_string(format!("../../tests/streamql/error/{case}/input.streamql"))
                .unwrap();
        assert!(StreamQL::parse(&input).is_err());
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
        let input = std::fs::read_to_string(format!(
            "../../tests/streamql/regex/{}/input.streamql",
            case
        ))
        .unwrap();
        let test = serde_json::from_str::<Test>(
            &std::fs::read_to_string(format!("../../tests/streamql/regex/{}/test.json", case))
                .unwrap(),
        )
        .unwrap();

        let query = StreamQL::parse(&input);
        match test {
            Test::Err if query.is_err() => (),
            Test::Err => panic!("Expected error"),
            Test::Ok { input, result } => {
                let expr = query.unwrap().websocket.unwrap().raw.unwrap();
                let regex = Regex::new(&expr.value).unwrap();
                assert_eq!(regex.is_match(&input), result);
            }
        }
    }

    #[rstest]
    #[case(1)]
    #[case(2)]
    fn test_string(#[case] case: u32) {
        let input = std::fs::read_to_string(format!(
            "../../tests/streamql/string/{}/input.streamql",
            case
        ))
        .unwrap();
        let test = serde_json::from_str::<Test>(
            &std::fs::read_to_string(format!("../../tests/streamql/string/{}/test.json", case))
                .unwrap(),
        )
        .unwrap();

        let query = StreamQL::parse(&input);
        match test {
            Test::Err if query.is_err() => (),
            Test::Err => panic!("Expected error"),
            Test::Ok { input, result } => {
                let expr = query.unwrap().websocket.unwrap().raw.unwrap();
                assert_eq!(expr.value == input, result);
            }
        }
    }
}
