# HTTPQL

[<img alt="github" src="https://img.shields.io/badge/github-caido/httpql-8da0cb?style=for-the-badge&labelColor=555555&logo=github" height="20">](https://github.com/caido/httpql)
[<img alt="crates.io" src="https://img.shields.io/npm/v/@caido/httpql?style=for-the-badge" height="20">](https://www.npmjs.com/package/@caido/httpql)

This is the JS parser for the [HTTPQL language](https://docs.caido.io/internals/httpql.html).

```typescript
import { deserialize, serialize } from "@caido/httpql";

const parsed = deserialize('req.ext.cont:"HELLO"');
console.log(parsed);
const result = serialize(parsed);
console.log(result);
```
