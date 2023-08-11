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
