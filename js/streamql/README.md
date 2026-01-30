# StreamQL

[<img alt="github" src="https://img.shields.io/badge/github-caido/httpql-8da0cb?style=for-the-badge&labelColor=555555&logo=github" height="20">](https://github.com/caido/httpql)
[<img alt="crates.io" src="https://img.shields.io/npm/v/@caido/streamql?style=for-the-badge" height="20">](https://www.npmjs.com/package/@caido/streamql)

This is the JS parser for the [StreamQL language](https://docs.caido.io/reference/streamql.html).

```typescript
import { deserialize, serialize } from "@caido/streamql";

const parsed = deserialize('ws.raw.cont:"HELLO"');
console.log(parsed);
const result = serialize(parsed);
console.log(result);
```
