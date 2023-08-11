import {
    assertEquals,
    assertThrows,
} from "https://deno.land/std/assert/mod.ts";
import { random } from "random";
import { ascending, descending, WAVLMap } from "./wavl.ts";

Deno.test(`ascending/descending`, () => {
    assertEquals(ascending(0, 0), 0);
    assertEquals(ascending(0, 1), -1);
    assertEquals(ascending(1, 0), 1);

    assertEquals(descending(0, 0), 0);
    assertEquals(descending(0, 1), 1);
    assertEquals(descending(1, 0), -1);
});

const SMALL = 10;
const MEDIUM = 100;
const LARGE = 1000;

const RATIO = 0.5;

const ITERATION = 20;

/**
 * Returns an array of numbers in the range `[min, max)`.
 *
 * @param min The minimum value (inclusive).
 * @param max The maximum value (exclusive).
 * @returns An array of numbers.
 */
function sequence(min: number, max: number) {
    const array: number[] = [];

    for (let i = min; i < max; i++) {
        array.push(i);
    }

    return array;
}

Deno.test(`Symbol.toStringTag`, () => {
    const map = new WAVLMap<number, number>();

    assertEquals(Object.prototype.toString.call(map), "[object WAVLMap]");
});

Deno.test(`constructor`, () => {
    const ordered = sequence(0, SMALL);
    const reverse = ordered.slice().reverse();

    // empty
    let map = new WAVLMap<number, number>();

    for (const n of ordered) {
        map.set(n, n);
    }

    assertEquals([...map.values()], ordered);

    // entries
    const entries = ordered.map((n) => [n, n] as const);

    map = new WAVLMap<number, number>(entries);

    assertEquals([...map.values()], ordered);

    // compare
    map = new WAVLMap<number, number>(descending);

    for (const n of ordered) {
        map.set(n, n);
    }

    assertEquals([...map.values()], reverse);

    // compare + entries
    map = new WAVLMap<number, number>(descending, entries);

    assertEquals([...map.values()], reverse);
});

Deno.test(`isEmpty/size/clear`, () => {
    const map = new WAVLMap<number, number>();

    assertEquals(map.isEmpty, true);
    assertEquals(map.size, 0);

    for (let i = 0; i < SMALL; i++) {
        map.set(i, i);
    }

    assertEquals(map.isEmpty, false);
    assertEquals(map.size, SMALL);

    map.clear();

    assertEquals(map.isEmpty, true);
    assertEquals(map.size, 0);
});

Deno.test(`has/get`, () => {
    const map = new WAVLMap<number, number>();

    assertEquals(map.has(0), false);
    assertEquals(map.get(0), undefined);

    for (let i = 0; i < SMALL; i++) {
        map.set(i, i);
    }

    for (let i = 0; i < SMALL; i++) {
        assertEquals(map.has(i), true);
        assertEquals(map.get(i), i);
    }
});

Deno.test(`set/delete`, () => {
    const map = new WAVLMap<number, number>();

    // set returns `this`
    assertEquals(map.set(0, 0), map);

    for (let i = 0; i < ITERATION; i++) {
        random.reset(i);

        const map = new WAVLMap<number, number>();
        const set = new Set<number>();

        // random set/delete

        for (const n of random.iter(LARGE).int(0, LARGE * RATIO)) {
            if (random.boolean()) {
                map.set(n, n);
                set.add(n);
            } else {
                // boolean
                assertEquals(
                    map.delete(n),
                    set.delete(n),
                );
            }
        }

        // size
        assertEquals(map.size, set.size);

        const actual = [...map.values()];
        const expected = [...set.values()].sort(map.compare);

        // values
        assertEquals(actual, expected);
    }
});

Deno.test(`insert/remove`, () => {
    const map = new WAVLMap<number, number>();

    // insert
    for (let i = 0; i < SMALL; i++) {
        assertEquals(map.insert(i, i), undefined);
    }

    assertEquals(map.size, SMALL);

    // insert (overwrite)
    for (let i = 0; i < SMALL; i++) {
        assertEquals(map.insert(i, i), i);
    }

    assertEquals(map.size, SMALL);

    // remove
    for (let i = 0; i < SMALL; i++) {
        assertEquals(map.remove(i), i);
    }

    assertEquals(map.size, 0);

    // remove (empty)
    for (let i = 0; i < SMALL; i++) {
        assertEquals(map.remove(i), undefined);
    }

    assertEquals(map.size, 0);
});

Deno.test(`iterator`, () => {
    random.reset(0);

    const ordered = sequence(0, MEDIUM);
    const reverse = ordered.slice().reverse();
    const input = random.shuffle(ordered.slice());

    const map = new WAVLMap<number, number>();

    for (const i of input) {
        map.set(i, i);
    }

    // forEach

    let i = 0;

    map.forEach((value, key) => {
        assertEquals(key, ordered[i]);
        assertEquals(value, ordered[i]);
        i++;
    });

    assertEquals(i, ordered.length);

    // forEachReverse

    i = 0;

    map.forEachReverse((value, key) => {
        assertEquals(key, reverse[i]);
        assertEquals(value, reverse[i]);
        i++;
    });

    assertEquals(i, reverse.length);

    // keys/keyReverse

    assertEquals([...map.keys()], ordered);
    assertEquals([...map.keysReverse()], reverse);

    // values/valuesReverse

    assertEquals([...map.values()], ordered);
    assertEquals([...map.valuesReverse()], reverse);

    // entries/entriesReverse

    assertEquals([...map.entries()], ordered.map((n) => [n, n]));
    assertEquals([...map.entriesReverse()], reverse.map((n) => [n, n]));

    // iterable

    assertEquals([...map], ordered.map((n) => [n, n]));

    // toJSON

    assertEquals(map.toJSON(), ordered.map((n) => [n, n]));
});

Deno.test(`entry`, () => {
    const map = new WAVLMap<number, number>();

    // empty

    let first = map.first();
    let last = map.last();

    assertEquals(first.isEmpty, true);
    assertEquals(first.key, undefined);
    assertEquals(first.value, undefined);
    assertEquals(first.entry, undefined);
    assertEquals(first.toJSON(), undefined);

    assertEquals(last.isEmpty, true);
    assertEquals(last.key, undefined);
    assertEquals(last.value, undefined);
    assertEquals(last.entry, undefined);
    assertEquals(last.toJSON(), undefined);

    assertEquals(
        Object.prototype.toString.call(first),
        "[object WAVLMapEntry]",
    );

    let entry = map.entry(0);

    assertEquals(entry.isEmpty, true);
    assertEquals(entry.key, 0);
    assertEquals(entry.value, undefined);
    assertEquals(entry.entry, undefined);
    assertEquals(entry.toJSON(), undefined);

    assertEquals(
        Object.prototype.toString.call(entry),
        "[object WAVLMapEntryWithKey]",
    );

    // insert 0

    entry.insert(0);

    assertEquals(entry.isEmpty, false);
    assertEquals(entry.key, 0);
    assertEquals(entry.value, 0);
    assertEquals(entry.entry, [0, 0]);
    assertEquals(entry.toJSON(), [0, 0]);

    assertEquals(map.size, 1);
    assertEquals([...map.keys()], [0]);

    first = map.first();
    last = map.last();

    assertEquals(first.entry, [0, 0]);
    assertEquals(last.entry, [0, 0]);

    let prev = entry.prev();
    let next = entry.next();

    assertEquals(prev.entry, undefined);
    assertEquals(next.entry, undefined);

    // insert 0 (overwrite)

    assertEquals(entry.insert(0), 0);

    // insert 0 before/after 0

    assertThrows(() => entry.insertBefore(0, 0));
    assertThrows(() => entry.insertAfter(0, 0));

    // insert -2/2

    prev = entry.insertBefore(-2, -2);
    next = entry.insertAfter(2, 2);

    assertEquals(prev.entry, [-2, -2]);
    assertEquals(next.entry, [2, 2]);

    assertEquals(map.size, 3);
    assertEquals([...map.keys()], [-2, 0, 2]);

    // insert -1/1

    prev = entry.insertBefore(-1, -1);
    next = entry.insertAfter(1, 1);

    assertEquals(prev.entry, [-1, -1]);
    assertEquals(next.entry, [1, 1]);

    assertEquals(map.size, 5);
    assertEquals([...map.keys()], [-2, -1, 0, 1, 2]);

    prev = entry.prev();
    next = entry.next();

    assertEquals(prev.entry, [-1, -1]);
    assertEquals(next.entry, [1, 1]);

    first = map.first();
    last = map.last();

    assertEquals(first.entry, [-2, -2]);
    assertEquals(last.entry, [2, 2]);

    // get 0

    entry = map.entry(0);

    assertEquals(entry.entry, [0, 0]);

    // get -1/1

    prev = map.entry(-1);
    next = map.entry(1);

    assertEquals(prev.entry, [-1, -1]);
    assertEquals(next.entry, [1, 1]);

    // get -2/2

    first = map.entry(-2);
    last = map.entry(2);

    assertEquals(first.entry, [-2, -2]);
    assertEquals(last.entry, [2, 2]);

    // prev/next

    assertEquals(entry.prev().entry, [-1, -1]);
    assertEquals(entry.next().entry, [1, 1]);

    assertEquals(prev.prev().entry, [-2, -2]);
    assertEquals(next.next().entry, [2, 2]);

    assertEquals(first.prev().entry, undefined);
    assertEquals(last.next().entry, undefined);

    // remove 0
    assertEquals(entry.remove(), [0, 0]);
    assertEquals(map.size, 4);
    assertEquals([...map.keys()], [-2, -1, 1, 2]);

    // remove -1/1
    assertEquals(prev.remove(), [-1, -1]);
    assertEquals(next.remove(), [1, 1]);
    assertEquals(map.size, 2);
    assertEquals([...map.keys()], [-2, 2]);

    // remove -2/2
    assertEquals(first.remove(), [-2, -2]);
    assertEquals(last.remove(), [2, 2]);
    assertEquals(map.size, 0);
    assertEquals([...map.keys()], []);

    // remove 0 after remove
    assertThrows(() => entry.remove());

    // set 0
    entry = map.entry(0).set(0).set(0);

    assertEquals(entry.entry, [0, 0]);

    assertEquals(map.size, 1);
    assertEquals([...map.keys()], [0]);

    // prev/next (empty)

    prev = entry.prev();
    next = entry.next();

    assertEquals(prev.entry, undefined);
    assertEquals(next.entry, undefined);

    assertEquals(prev.prev(), prev);
    assertEquals(next.next(), next);

    assertEquals(prev.next().entry, [0, 0]);
    assertEquals(next.prev().entry, [0, 0]);

    // insert -1/1 (insertAfter/insertBefore)

    assertEquals(prev.insertAfter(-1, -1).entry, [-1, -1]);
    assertEquals(next.insertBefore(1, 1).entry, [1, 1]);

    assertEquals(map.size, 3);
    assertEquals([...map.keys()], [-1, 0, 1]);

    // insert -2/2 (insertBefore/insertAfter)

    first = prev.insertBefore(-2, -2);
    last = next.insertAfter(2, 2);

    assertEquals(first.entry, [-2, -2]);
    assertEquals(last.entry, [2, 2]);

    assertEquals(map.size, 5);

    // delete 0

    assertEquals(entry.delete(), true);

    assertEquals(map.size, 4);

    // delete -1/1

    assertEquals(prev.delete(), true);
    assertEquals(next.delete(), true);

    assertEquals(map.size, 2);

    // delete -2/2

    assertEquals(first.delete(), true);
    assertEquals(last.delete(), true);

    assertEquals(map.size, 0);

    // empty

    entry = map.entry(0);

    // prev/next empty
    assertEquals(entry.prev().entry, undefined);
    assertEquals(entry.next().entry, undefined);

    // remove empty

    assertEquals(entry.remove(), undefined);

    // delete empty

    assertEquals(entry.delete(), false);
});

Deno.test(`range`, () => {
    const items = sequence(0, MEDIUM);
    const itemsReverse = items.slice().reverse();
    const entries = items.map((n) => [n, n] as const);
    const entriesReverse = entries.slice().reverse();

    const bounds = [
        undefined,
        -1,
        -0.5,
        0,
        0.5,
        1,
        Math.round(MEDIUM / 2),
        MEDIUM - 1,
        MEDIUM - 0.5,
        MEDIUM,
        MEDIUM + 0.5,
        MEDIUM + 1,
    ];

    type Row = { start?: number; end?: number; exclusive: boolean };

    function slice(row: Row) {
        let start;
        let end;

        if (row.start === undefined) {
            start = 0;
        } else {
            if (Number.isInteger(row.start)) {
                start = row.start;
            } else {
                start = Math.ceil(row.start);
            }

            start = Math.max(start, 0);
        }

        if (row.end === undefined) {
            end = items.length;
        } else {
            if (Number.isInteger(row.end)) {
                if (row.exclusive) {
                    end = row.end;
                } else {
                    end = row.end + 1;
                }
            } else {
                end = Math.ceil(row.end);
            }

            end = Math.min(end, items.length);
        }

        if (start > end) {
            return {
                ordered: [],
                reverse: [],
                entries: [],
                entriesReverse: [],
            };
        }

        const reverseStart = items.length - end;
        const reverseEnd = items.length - start;

        return {
            ordered: items.slice(start, end),
            reverse: itemsReverse.slice(reverseStart, reverseEnd),
            entries: entries.slice(start, end),
            entriesReverse: entriesReverse.slice(reverseStart, reverseEnd),
        };
    }

    const matrix: Row[] = [];

    for (const start of bounds) {
        for (const end of bounds) {
            matrix.push({ start, end, exclusive: false });
            matrix.push({ start, end, exclusive: true });
        }
    }

    function reset() {
        return new WAVLMap<number, number>(entries);
    }

    for (const row of matrix) {
        const { start, end, exclusive } = row;

        let map = reset();

        if (start !== undefined && end !== undefined && start > end) {
            assertThrows(() => map.range(start, end, exclusive));
            continue;
        }

        let range = map.range(start, end, exclusive);

        const { ordered, reverse, entries, entriesReverse } = slice(row);

        assertEquals(range.isEmpty, ordered.length === 0);
        assertEquals(range.count(), ordered.length);

        assertEquals([...range.keys()], ordered);
        assertEquals([...range.keysReverse()], reverse);
        assertEquals([...range.values()], ordered);
        assertEquals([...range.valuesReverse()], reverse);
        assertEquals([...range.entries()], entries);
        assertEquals([...range.entriesReverse()], entriesReverse);
        assertEquals([...range], entries);
        assertEquals(range.toJSON(), entries);

        assertEquals(range.first().key, ordered[0]);
        assertEquals(range.last().key, reverse[0]);

        let i = 0;

        range.forEach((value, key) => {
            assertEquals(key, ordered[i]);
            assertEquals(value, ordered[i]);
            i++;
        });

        assertEquals(i, ordered.length);

        i = 0;

        range.forEachReverse((value, key) => {
            assertEquals(key, reverse[i]);
            assertEquals(value, reverse[i]);
            i++;
        });

        assertEquals(i, reverse.length);

        assertEquals(range.delete(), ordered.length);
        assertEquals(map.size, items.length - ordered.length);

        map = reset();
        range = map.range(start, end, exclusive);

        assertEquals(range.remove(), entries);
        assertEquals(map.size, items.length - ordered.length);

        assertEquals(range.isEmpty, true);
        assertEquals(range.count(), 0);
        assertEquals([...range.keys()], []);
        assertEquals([...range.keysReverse()], []);
        assertEquals([...range.values()], []);
        assertEquals([...range.valuesReverse()], []);
        assertEquals([...range.entries()], []);
        assertEquals([...range.entriesReverse()], []);
        assertEquals([...range], []);
        assertEquals(range.toJSON(), []);
        assertThrows(() => range.first());
        assertThrows(() => range.last());

        i = 0;

        range.forEach((value, key) => {
            assertEquals(key, ordered[i]);
            assertEquals(value, ordered[i]);
            i++;
        });

        assertEquals(i, 0);

        i = 0;

        range.forEachReverse((value, key) => {
            assertEquals(key, reverse[i]);
            assertEquals(value, reverse[i]);
            i++;
        });

        assertEquals(i, 0);

        assertEquals(range.delete(), 0);
        assertEquals(range.remove(), []);
    }

    // empty

    const map = new WAVLMap<number, number>();
    const range = map.range();

    assertEquals(range.isEmpty, true);
    assertEquals(range.first().isEmpty, true);
    assertEquals(range.last().isEmpty, true);

    // Symbol.toStringTag

    assertEquals(
        Object.prototype.toString.call(range),
        "[object WAVLMapRange]",
    );
});
