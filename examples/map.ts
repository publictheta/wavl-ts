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
