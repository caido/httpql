use thiserror::Error;

#[derive(Error, Debug)]
pub enum HTTPQLError {
    #[error("Parse error: {0}")]
    ParseError(#[from] pest::error::Error<crate::parser::Rule>),
}

pub(super) type Result<T> = std::result::Result<T, HTTPQLError>;
