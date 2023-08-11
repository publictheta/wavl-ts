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
