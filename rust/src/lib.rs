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
