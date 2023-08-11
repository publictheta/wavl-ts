# wavl

[![npm](https://img.shields.io/npm/v/wavl)](https://www.npmjs.com/package/wavl)
[![deno](https://deno.land/badge/wavl/version)](https://deno.land/x/wavl)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-green.svg)](http://www.apache.org/licenses/LICENSE-2.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

This is a TypeScript implementation of a sorted map based on [WAVL] tree. It has API compatible with
JavaScript's [`Map`] and Entry/Range API inspired by Rust's [`BTreeMap`].

[WAVL]: https://en.wikipedia.org/wiki/WAVL_tree
[`Map`]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map
[`BTreeMap`]: https://doc.rust-lang.org/std/collections/struct.BTreeMap.html

## Usage

### Map API

`WAVLMap` has API compatible with JavaScript's [`Map`]:

```ts
import { WAVLMap } from "wavl";

let map = new WAVLMap<number, string>();

map.set(1, "one");
map.set(2, "two");
map.set(3, "three");

console.log(map.size); // 3
console.log(map.has(2)); // true
console.log(map.get(2)); // two

map.delete(2);

console.log(map.size); // 2
console.log(map.has(2)); // false
console.log(map.get(2)); // undefined

map.clear();

console.log(map.size); // 0
console.log(map.has(1)); // false
console.log(map.get(1)); // undefined

map = new WAVLMap<number, string>([
    [1, "one"],
    [2, "two"],
    [3, "three"],
]);

console.log(map.size); // 3

// 1, 2, 3
for (const key of map.keys()) {
    console.log(key);
}

// "one", "two", "three"
for (const value of map.values()) {
    console.log(value);
}

// [1, "one"], [2, "two"], [3, "three"]
for (const [key, value] of map.entries()) {
    console.log(key, value);
}

// 1, "one", 2, "two", 3, "three"
map.forEach((value, key) => {
    console.log(key, value);
});
```

It also has the following methods:

```ts
import { WAVLMap } from "wavl";

let map = new WAVLMap<number, string>();

console.log(map.insert(1, "one")); // undefined
console.log(map.insert(1, "uno")); // "one"

console.log(map.remove(1)); // "uno"
console.log(map.remove(1)); // undefined

map = new WAVLMap<number, string>([
    [1, "one"],
    [2, "two"],
    [3, "three"],
]);

// 3, 2, 1
for (const key of map.keysReverse()) {
    console.log(key);
}

// "three", "two", "one"
for (const value of map.valuesReverse()) {
    console.log(value);
}

// [3, "three"], [2, "two"], [1, "one"]
for (const [key, value] of map.entriesReverse()) {
    console.log(key, value);
}

// 3, "three", 2, "two", 1, "one"
map.forEachReverse((value, key) => {
    console.log(key, value);
});
```

Use compare functions to change the order:

```ts
import { ascending, descending, WAVLMap } from "wavl";

// default comparator is ascending using < and >
let map = new WAVLMap<number, string>(ascending);

map.set(1, "one");
map.set(2, "two");
map.set(3, "three");

console.log([...map.keys()]); // [1, 2, 3]

// descending using > and <
map = new WAVLMap<number, string>(descending);

map.set(1, "one");
map.set(2, "two");
map.set(3, "three");

console.log([...map.keys()]); // [3, 2, 1]

// custom comparator
map = new WAVLMap<number, string>((a, b) => a - b);
```

### Entry API

`entry(key)`, `first()`, and `last()` return an entry object with the following methods and properties:

```ts
import { WAVLMap } from "wavl";

const map = new WAVLMap<number, string>();

// insert
map.entry(1).insert("one");
map.entry(2).insert("two");
map.entry(3).insert("three");

// insertBefore/insertAfter
map.entry(1).insertBefore(0, "zero");
map.entry(3).insertAfter(4, "four");

// key/value/entry
console.log(map.entry(1).key); // 1
console.log(map.entry(1).value); // "one"
console.log(map.entry(1).entry); // [1, "one"]

// prev/next
console.log(map.entry(1).prev().key); // 0
console.log(map.entry(1).next().key); // 2

// first/last
console.log(map.first().key); // 0
console.log(map.last().key); // 4

// remove (returns removed entry)
console.log(map.first().remove()); // [0, "zero"]
console.log(map.last().remove()); // [4, "four"]

console.log([...map.keys()]); // [1, 2, 3]

// delete (returns true if deleted)
console.log(map.entry(2).delete()); // true
console.log(map.entry(2).delete()); // false

console.log([...map.keys()]); // [1, 3]
```

### Range API

`range(start, end, exclusive)` returns a range object with the following methods and properties:

```ts
import { WAVLMap } from "wavl";

const map = new WAVLMap<number, string>();

map.set(1, "one");
map.set(2, "two");
map.set(3, "three");
map.set(4, "four");
map.set(5, "five");

// default
console.log([...map.range(2, 4).keys()]); // [2, 3, 4]
console.log([...map.range(2, 4).values()]); // ["two", "three", "four"]
console.log([...map.range(2, 4).entries()]); // [[2, "two"], [3, "three"], [4, "four"]]
console.log(map.range(2, 4).count()); // 3
console.log(map.range(2, 4).isEmpty); // false

// exclude end
console.log([...map.range(2, 4, true).keys()]); // [2, 3]
console.log([...map.range(2, 4, true).values()]); // ["two", "three"]
console.log([...map.range(2, 4, true).entries()]); // [[2, "two"], [3, "three"]]
console.log(map.range(2, 4, true).count()); // 2
console.log(map.range(2, 4, true).isEmpty); // false

// first/last
console.log(map.range(2, 4).first().entry); // [2, "two"]
console.log(map.range(2, 4).last().entry); // [4, "four"]

// remove (returns removed entries)
console.log(map.range(2, 4).remove()); // [[2, "two"], [3, "three"], [4, "four"]]
console.log([...map.entries()]); // [[1, "one"], [5, "five"]]

// delete (returns number of entries deleted)
console.log(map.range(1, 5).delete()); // 2
console.log([...map.entries()]); // []
```

### Deno

```ts
import { WAVLMap } from "https://deno.land/x/wavl/mod.ts";
```

## Development

This library uses [Deno] for development.

[Deno]: https://deno.land/

### Build

To build the npm package (`0.0.0` for example):

```shell
deno run -A scripts/build_npm.ts 0.0.0
```

### Test

To run tests:

```shell
deno test
```

## License

Licensed under either of

- Apache License, Version 2.0
  ([LICENSE-APACHE](LICENSE-APACHE) or <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT License
  ([LICENSE-MIT](LICENSE-MIT) or <http://opensource.org/licenses/MIT>)

at your option.

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.
