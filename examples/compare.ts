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
