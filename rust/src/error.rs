use thiserror::Error;

#[derive(Error, Debug)]
pub enum HTTPQLError {
    #[error("Parser error")]
    ParserError(),

    #[error("Lexer Error")]
    LexerError(#[source] Box<pest::error::Error<crate::parser::Rule>>),
}

impl From<pest::error::Error<crate::parser::Rule>> for HTTPQLError {
    fn from(err: pest::error::Error<crate::parser::Rule>) -> Self {
        HTTPQLError::LexerError(Box::new(err))
    }
}

pub(super) type Result<T> = std::result::Result<T, HTTPQLError>;
