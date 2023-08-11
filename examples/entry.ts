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
