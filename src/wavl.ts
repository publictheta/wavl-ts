/**
 * The ascending comparator using `<` and `>`.
 *
 * @param a The first value.
 * @param b The second value.
 * @returns -1 if `a < b`, 1 if `a > b`, or 0 otherwise.
 */
export function ascending<K>(a: K, b: K) {
    return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * The descending comparator using `<` and `>`.
 *
 * @param a The first value.
 * @param b The second value.
 * @returns 1 if `a < b`, -1 if `a > b`, or 0 otherwise.
 */
export function descending<K>(a: K, b: K) {
    return a > b ? -1 : a < b ? 1 : 0;
}

/**
 * The parity of the rank of a WAVL node. `Zero` means even, `One` means odd.
 *
 * The rank of a leaf node is 0 (`Zero`), and the rank of `NIL` is -1 (`One`).
 */
const enum RankParity {
    Zero = 0, // ~(-1)
    One = -1, // ~0
}

/**
 * A WAVL node.
 */
class WAVLNode<K, V> {
    /**
     * The key of this node.
     */
    readonly key: K;

    /**
     * The value of this node.
     */
    value: V;

    /**
     * The parity of the rank of this node.
     */
    parity: RankParity;

    /**
     * The parent of this node.
     */
    parent: WAVLNode<K, V>;

    /**
     * The left child of this node.
     */
    left: WAVLNode<K, V>;

    /**
     * The right child of this node.
     */
    right: WAVLNode<K, V>;

    /**
     * `true` if this node is removed from the tree.
     */
    removed: boolean;

    /**
     * Creates a new node. `left`, `right`, and `parent` are set to `this`.
     *
     * @param key The key.
     * @param value The value.
     * @param parity The parity of the rank.
     */
    constructor(key: K, value: V, parity: RankParity) {
        this.key = key;
        this.value = value;
        this.parity = parity;

        this.left = this;
        this.right = this;
        this.parent = this;
        this.removed = false;
    }
}

/**
 * A WAVL tree.
 */
class WAVLTree<K, V> {
    compare: (a: K, b: K) => number;
    root: WAVLNode<K, V> = NIL;
    size = 0;

    constructor(compare: (a: K, b: K) => number) {
        this.compare = compare;
    }
}

/**
 * Validates a node.
 *
 * @param node The node.
 */
function validate<K, V>(node: WAVLNode<K, V>): void {
    if (node.removed) {
        throw new Error("The node is removed.");
    }
}

/**
 * The `NIL` node.
 */
// deno-lint-ignore no-explicit-any
const NIL = new WAVLNode(undefined as any, undefined as any, RankParity.One);

/**
 * Increments the rank of a node by 1.
 *
 * @param node The node.
 */
function promote<K, V>(node: WAVLNode<K, V>): void {
    node.parity = ~node.parity;
}

/**
 * Decrements the rank of a node by 1.
 *
 * @param node The node.
 */
function demote<K, V>(node: WAVLNode<K, V>): void {
    node.parity = ~node.parity;
}

/**
 * Returns the minimum node in the subtree rooted at `node`.
 *
 * @param node The root of the subtree.
 * @returns The minimum node in the subtree.
 */
function minimum<K, V>(node: WAVLNode<K, V>): WAVLNode<K, V> {
    let curr = node.left;

    while (curr !== NIL) {
        node = curr;
        curr = curr.left;
    }

    return node;
}

/**
 * Returns the maximum node in the subtree rooted at `node`.
 *
 * @param node The root of the subtree.
 * @returns The maximum node in the subtree.
 */
function maximum<K, V>(node: WAVLNode<K, V>): WAVLNode<K, V> {
    let curr = node.right;

    while (curr !== NIL) {
        node = curr;
        curr = curr.right;
    }

    return node;
}

/**
 * Returns the predecessor of `node`.
 *
 * @param node The node.
 * @returns The predecessor of `node`, or `NIL` if `node` is the minimum
 * node.
 */
function predecessor<K, V>(node: WAVLNode<K, V>): WAVLNode<K, V> {
    if (node.left !== NIL) {
        return maximum(node.left);
    }

    let parent = node.parent;

    while (parent !== NIL && parent.left === node) {
        node = parent;
        parent = parent.parent;
    }

    return parent;
}

/**
 * Returns the successor of `node`.
 *
 * @param node The node.
 * @returns The successor of `node`, or `NIL` if `node` is the maximum
 * node.
 */
function successor<K, V>(node: WAVLNode<K, V>): WAVLNode<K, V> {
    if (node.right !== NIL) {
        return minimum(node.right);
    }

    let parent = node.parent;

    while (parent !== NIL && parent.right === node) {
        node = parent;
        parent = parent.parent;
    }

    return parent;
}

/**
 * Does a left rotation on `node`.
 *
 * ```text
 *    p              p
 *    |              |
 *    n      =>      r
 *   / \            / \
 *  A   r          n   C
 *     / \        / \
 *    B   C      A   B
 * ```
 */
function rotateLeft<K, V>(
    tree: WAVLTree<K, V>,
    node: WAVLNode<K, V>,
    right: WAVLNode<K, V>,
): void {
    if (node.parent === NIL) {
        tree.root = right;
    } else if (node.parent.left === node) {
        node.parent.left = right;
    } else {
        node.parent.right = right;
    }

    right.parent = node.parent;

    node.right = right.left;

    if (right.left !== NIL) {
        right.left.parent = node;
    }

    right.left = node;
    node.parent = right;
}

/**
 * Does a right rotation on `node`.
 *
 * ```text
 *      p          p
 *      |          |
 *      n    =>    l
 *     / \        / \
 *    l   C      A   n
 *   / \            / \
 *  A   B          B   C
 * ```
 */
function rotateRight<K, V>(
    tree: WAVLTree<K, V>,
    node: WAVLNode<K, V>,
    left: WAVLNode<K, V>,
): void {
    if (node.parent === NIL) {
        tree.root = left;
    } else if (node.parent.left === node) {
        node.parent.left = left;
    } else {
        node.parent.right = left;
    }

    left.parent = node.parent;

    node.left = left.right;

    if (left.right !== NIL) {
        left.right.parent = node;
    }

    left.right = node;
    node.parent = left;
}

/**
 * Does a left rotation on `node`, and then a right rotation on `parent`.
 *
 * ```text
 *     g             g             g
 *     |             |             |
 *     p             p             r
 *    / \           / \           / \
 *   n   D   =>    r   D   =>    n   p
 *  / \           / \           / \ / \
 * A   r         n   C         A  B C  D
 *    / \       / \
 *   B   C     A   B
 * ```
 */
function rotateLeftRight<K, V>(
    tree: WAVLTree<K, V>,
    parent: WAVLNode<K, V>,
    node: WAVLNode<K, V>,
    right: WAVLNode<K, V>,
): void {
    if (parent.parent === NIL) {
        tree.root = right;
    } else if (parent.parent.left === parent) {
        parent.parent.left = right;
    } else {
        parent.parent.right = right;
    }

    right.parent = parent.parent;

    parent.left = right.right;

    if (right.right !== NIL) {
        right.right.parent = parent;
    }

    node.right = right.left;

    if (right.left !== NIL) {
        right.left.parent = node;
    }

    right.left = node;
    node.parent = right;

    right.right = parent;
    parent.parent = right;
}

/**
 * Does a right rotation on `node`, and then a left rotation on `parent`.
 *
 * ```text
 *     g             g              g
 *     |             |              |
 *     p             p              l
 *    / \           / \            / \
 *   A   n    =>   A   l    =>    p   n
 *      / \           / \        / \ / \
 *     l   D         B   n      A  B C  D
 *    / \               / \
 *   B   C             C   D
 * ```
 */
function rotateRightLeft<K, V>(
    tree: WAVLTree<K, V>,
    parent: WAVLNode<K, V>,
    node: WAVLNode<K, V>,
    left: WAVLNode<K, V>,
): void {
    if (parent.parent === NIL) {
        tree.root = left;
    } else if (parent.parent.left === parent) {
        parent.parent.left = left;
    } else {
        parent.parent.right = left;
    }

    left.parent = parent.parent;

    parent.right = left.left;

    if (left.left !== NIL) {
        left.left.parent = parent;
    }

    node.left = left.right;

    if (left.right !== NIL) {
        left.right.parent = node;
    }

    left.left = parent;
    parent.parent = left;

    left.right = node;
    node.parent = left;
}

/**
 * Searches for a node with the given key in the tree.
 *
 * @param tree The tree.
 * @param key The key to search for.
 * @returns The node with the given key, or `NIL` if the key is not found.
 */
function search<K, V>(
    tree: WAVLTree<K, V>,
    key: K,
): WAVLNode<K, V> {
    const compare = tree.compare;
    let node = tree.root;

    while (node !== NIL) {
        const cmp = compare(key, node.key);

        if (cmp === 0) {
            return node;
        } else if (cmp < 0) {
            node = node.left;
        } else {
            node = node.right;
        }
    }

    return NIL;
}

/**
 * Replaces the value of a node.
 *
 * @param node The node.
 * @param value The new value.
 * @returns The old value.
 */
function replace<K, V>(
    node: WAVLNode<K, V>,
    value: V,
): V {
    const oldValue = node.value;
    node.value = value;
    return oldValue;
}

/**
 * Fixes the tree after an insertion.
 *
 * @param tree The tree.
 * @param parent The parent of the new node.
 */
function insertFixup<K, V>(tree: WAVLTree<K, V>, parent: WAVLNode<K, V>): void {
    promote(parent);

    let node = parent;

    while (node !== NIL) {
        const parent = node.parent;

        if (parent === NIL || parent.parity !== node.parity) {
            break;
        }

        if (node === parent.left) {
            if (parent.parity !== parent.right.parity) {
                promote(parent);
                node = parent;
                continue;
            }

            const child = node.right;

            if (node.parity === child.parity) {
                rotateRight(tree, parent, node);
                demote(parent);
            } else {
                rotateLeftRight(tree, parent, node, child);
                demote(parent);
                demote(node);
                promote(child);
            }
        } else {
            if (parent.parity !== parent.left.parity) {
                promote(parent);
                node = parent;
                continue;
            }

            const child = node.left;

            if (node.parity === child.parity) {
                rotateLeft(tree, parent, node);
                demote(parent);
            } else {
                rotateRightLeft(tree, parent, node, child);
                demote(parent);
                demote(node);
                promote(child);
            }
        }

        break;
    }
}

/**
 * Inserts a new node into the tree.
 *
 * @param tree The tree.
 * @param parent The parent of the new node.
 * @param branch The branch of the new node.
 * @param key The key of the new node.
 * @param value The value of the new node.
 * @returns The new node.
 */
function insertEmpty<K, V>(
    tree: WAVLTree<K, V>,
    parent: WAVLNode<K, V>,
    branch: Branch,
    key: K,
    value: V,
): WAVLNode<K, V> {
    const node = new WAVLNode(key, value, RankParity.Zero);

    node.parent = parent;
    node.left = NIL;
    node.right = NIL;

    if (parent === NIL) {
        tree.root = node;
    } else if (branch === Branch.Left) {
        parent.left = node;

        if (parent.right === NIL) {
            insertFixup(tree, parent);
        }
    } else {
        parent.right = node;

        if (parent.left === NIL) {
            insertFixup(tree, parent);
        }
    }

    tree.size++;

    return node;
}

/**
 * Inserts a key-value pair into the tree.
 *
 * @param tree The tree.
 * @param key The key to insert.
 * @param value The value to insert.
 * @returns The old value if the key already exists, or `undefined` if the
 * key does not exist.
 */
function insert<K, V>(
    tree: WAVLTree<K, V>,
    key: K,
    value: V,
): V | undefined {
    const compare = tree.compare;

    let parent: WAVLNode<K, V> = NIL;
    let branch = Branch.Left;
    let node = tree.root;

    while (node !== NIL) {
        parent = node;

        const cmp = compare(key, node.key);

        if (cmp === 0) {
            return replace(node, value);
        } else if (cmp < 0) {
            node = node.left;
            branch = Branch.Left;
        } else {
            node = node.right;
            branch = Branch.Right;
        }
    }

    insertEmpty(tree, parent, branch, key, value);
}

/**
 * Fixes the tree after a removal.
 *
 * @param tree The tree.
 * @param parent The parent of the removed node.
 * @param node The new node that replaced the removed node.
 */
function removeFixup<K, V>(
    tree: WAVLTree<K, V>,
    parent: WAVLNode<K, V>,
    node: WAVLNode<K, V>,
): void {
    function ascend() {
        node = parent;
        parent = parent.parent;
    }

    if (node === NIL && parent.parity === RankParity.One) {
        if (parent.left === node) {
            if (parent.right !== NIL) {
                return;
            }
        } else {
            if (parent.left !== NIL) {
                return;
            }
        }

        demote(parent);
        ascend();
    }

    while (parent !== NIL && parent.parity !== node.parity) {
        if (parent.left === node) {
            const sibling = parent.right;

            if (parent.parity === sibling.parity) {
                demote(parent);
                ascend();
                continue;
            }

            const nearNephew = sibling.left;
            const farNephew = sibling.right;

            if (sibling.parity === farNephew.parity) {
                if (sibling.parity === nearNephew.parity) {
                    demote(sibling);
                    demote(parent);
                    ascend();
                    continue;
                } else {
                    rotateRightLeft(tree, parent, sibling, nearNephew);
                    demote(sibling);
                    break;
                }
            }

            rotateLeft(tree, parent, sibling);
            promote(sibling);
        } else {
            const sibling = parent.left;

            if (parent.parity === sibling.parity) {
                demote(parent);
                ascend();
                continue;
            }

            const nearNephew = sibling.right;
            const farNephew = sibling.left;

            if (sibling.parity === farNephew.parity) {
                if (sibling.parity === nearNephew.parity) {
                    demote(sibling);
                    demote(parent);
                    ascend();
                    continue;
                } else {
                    rotateLeftRight(tree, parent, sibling, nearNephew);
                    demote(sibling);
                    break;
                }
            }

            rotateRight(tree, parent, sibling);
            promote(sibling);
        }

        if (parent.left !== NIL || parent.right !== NIL) {
            demote(parent);
        }

        break;
    }
}

/**
 * Removes a node from the tree.
 *
 * @param tree The tree.
 * @param node The node to remove.
 * @returns The removed node.
 */
function remove<K, V>(
    tree: WAVLTree<K, V>,
    node: WAVLNode<K, V>,
) {
    tree.size--;
    node.removed = true;

    let child;

    if (node.left === NIL) {
        child = node.right;
    } else if (node.right === NIL) {
        child = node.left;
    } else {
        // Swap the node with its predecessor,
        // and then remove the node from the tree.
        //
        // We prefer the predecessor over the successor
        // so that the successor does not change by the
        // removal.

        const predecessor = maximum(node.left);

        // We swap them by position, not by value, so that
        // the key and value of the node are not changed.
        //
        // ```
        //         o                    o
        //         |                    |
        //         n                    m
        //        / \                  / \
        //       q   A                q   A
        //      / \                  / \
        //     D   p                D   p
        //        / \                  / \
        //       C   m                C   B
        //          / \
        //         B  NIL
        // ```
        //
        // ```
        //         o                    o
        //         |                    |
        //         n                    m
        //        / \                  / \
        //       m   A                B   A
        //      / \
        //     B  NIL
        // ```

        let parent = predecessor.parent;
        child = predecessor.left;

        // parity
        predecessor.parity = node.parity;

        // m-A
        predecessor.right = node.right;
        node.right.parent = predecessor;

        if (parent === node) {
            parent = predecessor;
        } else {
            // m-q
            predecessor.left = node.left;
            node.left.parent = predecessor;

            // p-B
            parent.right = child;
            if (child !== NIL) {
                child.parent = parent;
            }
        }

        // o-m
        predecessor.parent = node.parent;
        if (node.parent === NIL) {
            tree.root = predecessor;
        } else if (node.parent.left === node) {
            node.parent.left = predecessor;
        } else {
            node.parent.right = predecessor;
        }

        removeFixup(tree, parent, child);
        return node;
    }

    const parent = node.parent;

    if (child !== NIL) {
        child.parent = parent;
    }

    if (parent === NIL) {
        tree.root = child;
    } else {
        if (parent.left === node) {
            parent.left = child;
        } else {
            parent.right = child;
        }

        removeFixup(tree, parent, child);
    }

    return node;
}

/**
 * Clears the tree.
 *
 * @param tree The tree.
 */
function clear<K, V>(tree: WAVLTree<K, V>): void {
    tree.root = NIL;
    tree.size = 0;
}

/**
 * The base class for a collection of key-value pairs iterables in order.
 */
abstract class Inorder<K, V> {
    /**
     * Returns an iterable of the nodes in the map, in order.
     */
    protected abstract inorder(): IterableIterator<WAVLNode<K, V>>;

    /**
     * Returns an iterable of the nodes in the map, in reverse order.
     */
    protected abstract inorderReverse(): IterableIterator<WAVLNode<K, V>>;

    /**
     * Returns an iterable of the keys in the map, in order.
     */
    *keys(): IterableIterator<K> {
        for (const node of this.inorder()) {
            yield node.key;
        }
    }

    /**
     * Returns an iterable of the values in the map, in order.
     */
    *values(): IterableIterator<V> {
        for (const node of this.inorder()) {
            yield node.value;
        }
    }

    /**
     * Returns an iterable of the entries in the map, in order.
     */
    *entries(): IterableIterator<[K, V]> {
        for (const node of this.inorder()) {
            yield [node.key, node.value];
        }
    }

    /**
     * Returns an iterable of the keys in the map, in reverse order.
     */
    *keysReverse(): IterableIterator<K> {
        for (const node of this.inorderReverse()) {
            yield node.key;
        }
    }

    /**
     * Returns an iterable of the values in the map, in reverse order.
     */
    *valuesReverse(): IterableIterator<V> {
        for (const node of this.inorderReverse()) {
            yield node.value;
        }
    }

    /**
     * Returns an iterable of the entries in the map, in reverse order.
     */
    *entriesReverse(): IterableIterator<[K, V]> {
        for (const node of this.inorderReverse()) {
            yield [node.key, node.value];
        }
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }

    toJSON(): [K, V][] {
        return [...this.entries()];
    }
}

/**
 * Searches for a node with the given key in the tree, and returns the node
 * if found, or `NIL`, the parent, and the branch if not found.
 *
 * @param tree The tree.
 * @param key The key to search for.
 * @returns The node, the parent, and the branch.
 */
function searchEntry<K, V>(
    tree: WAVLTree<K, V>,
    key: K,
) {
    const compare = tree.compare;

    let parent: WAVLNode<K, V> = NIL;
    let node = tree.root;
    let branch = Branch.Left;

    while (node !== NIL) {
        const cmp = compare(key, node.key);

        if (cmp === 0) {
            break;
        } else if (cmp < 0) {
            parent = node;
            node = node.left;
            branch = Branch.Left;
        } else {
            parent = node;
            node = node.right;
            branch = Branch.Right;
        }
    }

    return [node, parent, branch] as const;
}

/**
 * Searches for an entry with the given key in the tree.
 *
 * @param tree The tree.
 * @param key The key to search for.
 * @returns The entry with the given key, or an empty entry if the key is not
 * found.
 */
function entry<K, V>(
    tree: WAVLTree<K, V>,
    key: K,
): Occupied<K, V> | Vacant<K, V> {
    const [node, parent, branch] = searchEntry(tree, key);

    if (node === NIL) {
        return new Vacant(tree, parent, branch, key);
    } else {
        return new Occupied(tree, node);
    }
}

/**
 * An entry.
 */
interface Entry<K, V> {
    /**
     * Returns `true` if this entry is empty.
     */
    get isEmpty(): boolean;

    /**
     * The key of this entry.
     */
    get key(): K | undefined;

    /**
     * The value of this entry.
     */
    get value(): V | undefined;

    /**
     * The key and value of this entry.
     */
    get entry(): [K, V] | undefined;

    /**
     * Checks if this entry is still valid. If not, an error is thrown.
     */
    validate(): void;

    /**
     * The previous entry.
     *
     * @returns The previous entry.
     */
    prev(): Entry<K, V>;

    /**
     * The next entry.
     *
     * @returns The next entry.
     */
    next(): Entry<K, V>;

    /**
     * Inserts a new entry before this entry, and returns the new entry.
     *
     * The key of the new entry must be less than the key of this entry
     * and greater than the key of the previous entry. Otherwise, an
     * error is thrown.
     *
     * @param key The key of the new entry.
     * @param value The value of the new entry.
     * @returns The new entry.
     */
    insertBefore(key: K, value: V): Entry<K, V>;

    /**
     * Inserts a new entry after this entry, and returns the new entry.
     *
     * The key of the new entry must be greater than the key of this entry
     * and less than the key of the next entry. Otherwise, an error is
     * thrown.
     *
     * @param key The key of the new entry.
     * @param value The value of the new entry.
     * @returns The new entry.
     */
    insertAfter(key: K, value: V): Entry<K, V>;

    /**
     * Deletes this entry.
     *
     * @returns `true` if this entry was deleted, or `false` if this entry
     * was empty.
     */
    delete(): boolean;

    /**
     * Removes this entry.
     *
     * @returns The key and value of this entry, or `undefined` if this entry
     * was empty.
     */
    remove(): [K, V] | undefined;

    toJSON(): [K, V] | undefined;
}

interface Inner<K, V> extends Entry<K, V> {
    /**
     * The WAVL tree.
     */
    tree: WAVLTree<K, V>;
    /**
     * The WAVL node.
     */
    node: WAVLNode<K, V>;

    prev(): Inner<K, V>;
    next(): Inner<K, V>;

    insertBefore(key: K, value: V): Inner<K, V>;
    insertAfter(key: K, value: V): Inner<K, V>;
}

/**
 * Validates a key before inserting it into the tree.
 *
 * The key must be greater than the previous key and less than the next key.
 * Otherwise, an error is thrown.
 *
 * @param tree The tree.
 * @param prev The previous node.
 * @param key The key to validate.
 * @param next The next node.
 */
function validateKey<K, V>(
    tree: WAVLTree<K, V>,
    prev: WAVLNode<K, V>,
    key: K,
    next: WAVLNode<K, V>,
): void {
    const compare = tree.compare;

    if (prev !== NIL) {
        if (compare(prev.key, key) >= 0) {
            throw new Error("The key is not greater than the previous key.");
        }
    }

    if (next !== NIL) {
        if (compare(key, next.key) >= 0) {
            throw new Error("The key is not less than the next key.");
        }
    }
}

/**
 * An occupied entry.
 */
class Occupied<K, V> implements Inner<K, V> {
    constructor(
        /**
         * The WAVL tree.
         */
        public tree: WAVLTree<K, V>,
        /**
         * The WAVL node. Must not be `NIL`.
         */
        public node: WAVLNode<K, V>,
    ) {}

    get isEmpty(): false {
        return false;
    }

    get key(): K {
        return this.node.key;
    }

    get value(): V {
        return this.node.value;
    }

    get entry(): [K, V] {
        return [this.node.key, this.node.value];
    }

    validate(): void {
        validate(this.node);
    }

    prev(): Inner<K, V> {
        if (this.node.left !== NIL) {
            // ```
            //  node
            //  /
            // .
            //  \
            //   .
            //    \
            //    prev
            // ```
            return new Occupied(this.tree, maximum(this.node.left));
        }

        // ```
        //   prev
        //      \
        //       .
        //      /
        //     .
        //    /
        // node
        // ```

        const parent = predecessor(this.node);

        if (parent === NIL) {
            // ```
            //      root
            //      /
            //     .
            //    /
            // node
            // ```
            return new Vacant(this.tree, this.node, Branch.Left, undefined);
        }

        return new Occupied(this.tree, parent);
    }

    next(): Inner<K, V> {
        if (this.node.right !== NIL) {
            // ```
            //   node
            //      \
            //       .
            //      /
            //     .
            //    /
            // next
            // ```
            return new Occupied(this.tree, minimum(this.node.right));
        }

        // ```
        //  next
        //  /
        // .
        //  \
        //   .
        //    \
        //    node
        // ```

        const parent = successor(this.node);

        if (parent === NIL) {
            // ```
            // root
            //    \
            //     .
            //      \
            //      node
            // ```
            return new Vacant(this.tree, this.node, Branch.Right, undefined);
        }

        return new Occupied(this.tree, parent);
    }

    insertBefore(key: K, value: V): Occupied<K, V> {
        const prev = predecessor(this.node);

        validateKey(this.tree, prev, key, this.node);

        let node;

        if (this.node.left === NIL) {
            // ```
            // prev
            //    \
            //     .
            //      \
            //      node
            //      /
            //    NIL
            // ```

            node = insertEmpty(
                this.tree,
                this.node,
                Branch.Left,
                key,
                value,
            );
        } else {
            // ```
            //  node
            //  /
            // .
            //  \
            //  prev
            //    \
            //    NIL
            // ```

            node = insertEmpty(
                this.tree,
                prev,
                Branch.Right,
                key,
                value,
            );
        }

        return new Occupied(this.tree, node);
    }

    insertAfter(key: K, value: V): Occupied<K, V> {
        const next = successor(this.node);

        validateKey(this.tree, this.node, key, next);

        let node;

        if (this.node.right === NIL) {
            // ```
            //  next
            //  /
            // .
            //  \
            //  node
            //    \
            //    NIL
            // ```

            node = insertEmpty(
                this.tree,
                this.node,
                Branch.Right,
                key,
                value,
            );
        } else {
            // ```
            //  node
            //     \
            //      .
            //     /
            //  next
            //   /
            // NIL
            // ```

            node = insertEmpty(
                this.tree,
                next,
                Branch.Left,
                key,
                value,
            );
        }

        return new Occupied(this.tree, node);
    }

    delete(): true {
        remove(this.tree, this.node);
        return true;
    }

    remove(): [K, V] {
        const node = remove(this.tree, this.node);
        return [node.key, node.value];
    }

    toJSON(): [K, V] {
        return this.entry;
    }
}

/**
 * A branch of a node.
 */
const enum Branch {
    Left,
    Right,
}

/**
 * A vacant entry.
 */
class Vacant<K, V, I extends K | undefined = K> implements Inner<K, V> {
    constructor(
        /**
         * The WAVL tree.
         */
        public tree: WAVLTree<K, V>,
        /**
         * The parent node of the new entry. `NIL` if the tree is empty.
         */
        public node: WAVLNode<K, V>,
        /**
         * The branch into which the new entry will be inserted.
         */
        public branch: Branch,
        /**
         * The key of the new entry.
         */
        public key: I,
    ) {}

    get isEmpty(): true {
        return true;
    }

    get value(): undefined {
        return undefined;
    }

    get entry(): undefined {
        return undefined;
    }

    validate(): void {
        validate(this.node);
    }

    prev(): Inner<K, V> {
        if (this.node === NIL) {
            return new Vacant(this.tree, NIL, Branch.Left, undefined);
        }

        let node;

        if (this.branch === Branch.Left) {
            // ```
            //   node
            //   /
            // NIL
            //  ^
            // ```
            node = predecessor(this.node);

            if (node === NIL) {
                // First node.
                return this;
            }
        } else {
            // ```
            // node
            //    \
            //    NIL
            //     ^
            // ```
            node = this.node;
        }

        return new Occupied(this.tree, node);
    }

    next(): Inner<K, V> {
        if (this.node === NIL) {
            return new Vacant(this.tree, NIL, Branch.Right, undefined);
        }

        let node;

        if (this.branch === Branch.Right) {
            // ```
            // node
            //    \
            //    NIL
            //     ^
            // ```
            node = successor(this.node);

            if (node === NIL) {
                // Last node.
                return this;
            }
        } else {
            // ```
            //   node
            //   /
            // NIL
            //  ^
            // ```
            node = this.node;
        }

        return new Occupied(this.tree, node);
    }

    private insert(key: K, value: V) {
        let prev;
        let next;

        if (this.branch === Branch.Left) {
            // ```
            //  prev
            //     \
            //      .
            //     /
            //  node
            //   /
            // NIL
            //  ^
            // ```
            prev = predecessor(this.node);
            next = this.node;
        } else {
            // ```
            //  next
            //  /
            // .
            //  \
            //  node
            //    \
            //    NIL
            //     ^
            // ```
            prev = this.node;
            next = successor(this.node);
        }

        validateKey(this.tree, prev, key, next);

        const node = insertEmpty(
            this.tree,
            this.node,
            this.branch,
            key,
            value,
        );

        return new Occupied(this.tree, node);
    }

    insertBefore(key: K, value: V): Occupied<K, V> {
        return this.insert(key, value);
    }

    insertAfter(key: K, value: V): Occupied<K, V> {
        return this.insert(key, value);
    }

    delete(): false {
        return false;
    }

    remove(): undefined {
        return undefined;
    }

    toJSON(): undefined {
        return undefined;
    }
}

/**
 * An entry in a WAVL map.
 */
export class WAVLMapEntry<K, V> implements Entry<K, V> {
    get [Symbol.toStringTag](): string {
        return "WAVLMapEntry";
    }

    /**
     * CAUTION: This constructor is only for internal use. Use
     * {@link WAVLMap.first()} or {@link WAVLMap.last()} instead.
     */
    constructor(
        protected inner: Inner<K, V>,
    ) {}

    get isEmpty(): boolean {
        return this.inner.isEmpty;
    }

    get key(): K | undefined {
        return this.inner.key;
    }

    get value(): V | undefined {
        return this.inner.value;
    }

    get entry(): [K, V] | undefined {
        return this.inner.entry;
    }

    validate(): void {
        this.inner.validate();
    }

    prev(): WAVLMapEntry<K, V> {
        this.validate();

        return new WAVLMapEntry(this.inner.prev());
    }

    next(): WAVLMapEntry<K, V> {
        this.validate();

        return new WAVLMapEntry(this.inner.next());
    }

    insertBefore(key: K, value: V): WAVLMapEntry<K, V> {
        this.validate();

        const inner = this.inner.insertBefore(key, value);

        if (this.inner.isEmpty) {
            this.inner = inner;
        }

        return new WAVLMapEntry(inner);
    }

    insertAfter(key: K, value: V): WAVLMapEntry<K, V> {
        this.validate();

        const inner = this.inner.insertAfter(key, value);

        if (this.inner.isEmpty) {
            this.inner = inner;
        }

        return new WAVLMapEntry(inner);
    }

    delete(): boolean {
        this.validate();

        return this.inner.delete();
    }

    remove(): [K, V] | undefined {
        this.validate();

        return this.inner.remove();
    }

    toJSON(): [K, V] | undefined {
        return this.inner.toJSON();
    }
}

/**
 * An entry in a WAVL map.
 */
export class WAVLMapEntryWithKey<K, V> extends WAVLMapEntry<K, V> {
    get [Symbol.toStringTag](): string {
        return "WAVLMapEntryWithKey";
    }

    /**
     * CAUTION: This constructor is only for internal use. Use
     * {@link WAVLMap.entry()} instead.
     */
    constructor(
        protected inner: Occupied<K, V> | Vacant<K, V>,
    ) {
        super(inner);
    }

    /**
     * Sets the value of this entry and returns the entry with the new value.
     *
     * If this entry is empty, a new entry is inserted into the map,
     * and `this` is updated to the new entry. Otherwise, the value of
     * this entry is replaced.
     *
     * @param value The value of the new entry.
     * @returns This map.
     */
    set(value: V): WAVLMapEntryWithKey<K, V> {
        this.insert(value);

        return this;
    }

    /**
     * Inserts a value into this entry and returns the old value.
     *
     * If this entry is empty, a new entry is inserted into the map,
     * and `this` is updated to the new entry. Otherwise, the value of
     * this entry is replaced.
     *
     * @param value The value to insert.
     * @returns The old value if exists, or `undefined` if this entry is
     * empty.
     */
    insert(value: V): V | undefined {
        this.validate();

        if (this.inner.isEmpty) {
            const node = insertEmpty(
                this.inner.tree,
                this.inner.node,
                this.inner.branch,
                this.inner.key,
                value,
            );

            this.inner = new Occupied(this.inner.tree, node);
        } else {
            return replace(this.inner.node, value);
        }
    }
}

/**
 * The kind of a range. All kinds except `Kind.Default` are empty.
 */
const enum Kind {
    /**
     * The range is inclusive (`[lower, upper]`) and not empty.
     */
    Default,
    /**
     * The range is exclusive (`(lower, upper)`) and empty.
     */
    Exclusive,
    /**
     * The range is before the first key.
     */
    Before,
    /**
     * The range is after the last key.
     */
    After,
    /**
     * The range is removed.
     */
    Removed,
}

function isEmpty(kind: Kind): boolean {
    return kind !== Kind.Default;
}

/**
 * Searches for the range of nodes with the given start and end keys.
 *
 * If `start` is greater than `end`, an error is thrown.
 *
 * A range is defined by a start key and an end key. The start key is always
 * inclusive, and the end key is exclusive if `exclusive` is `true`, or
 * inclusive if `exclusive` is `false`.
 *
 * - `[start, end]` if `exclusive` is `false`
 * - `[start, end)` if `exclusive` is `true`
 *
 * If `start` is `undefined`, the range starts from the first key. If `end`
 * is `undefined`, the range ends at the last key.
 *
 * By default, we use a closed range `[lower, upper]` to represent the range
 * of nodes. `kind` is `Kind.Default` for this case.
 *
 * However, there are some special cases where the range is empty:
 *
 * 1. the tree is empty
 * 2. both `start` and `end` are less than the first key
 * 3. both `start` and `end` are greater than the last key
 * 4. both `start` and `end` are between the same two keys
 * 5. both `start` and `end` are equal to the same key, and `exclusive` is
 *    `true`
 *
 * In the case 1-3, both `lower` and `upper` are `NIL`.
 *
 * In the case 1 and 2, `kind` is `Kind.Before`. This means that the range is
 * before the first key.
 *
 * In the case 3, `kind` is `Kind.After`. This means that the range is after
 * the last key.
 *
 * In the case 4-5, both `lower` and `upper` are not `NIL`, and `kind` is
 * `Kind.Empty`.
 *
 * In the case 4, `lower` is the predecessor of `upper`, and `upper` is the
 * successor of `lower`. This means that the range is between `lower` and
 * `upper`, and the range is empty.
 *
 * In the case 5, `lower` and `upper` are the same node. This means that the
 * range is at the node, but the range is empty.
 *
 * @param map The map.
 * @param tree The tree.
 * @param start The start key (inclusive). If `undefined`, the range starts
 * from the first key.
 * @param end The end key. If `undefined`, the range ends at the last key.
 * @param exclusive `true` if the end key is exclusive, or `false` if the end
 * key is inclusive.
 * @returns The lower node, the upper node, and the kind of the range.
 */
function searchRange<K, V>(
    map: WAVLMap<K, V>,
    tree: WAVLTree<K, V>,
    start: K | undefined,
    end: K | undefined,
    exclusive: boolean,
): [WAVLNode<K, V>, WAVLNode<K, V>, Kind] {
    if (start !== undefined && end !== undefined) {
        const compare = map.compare;

        if (compare(start, end) > 0) {
            throw new Error("The start key is greater than the end key.");
        }
    }

    const root = tree.root;

    if (root === NIL) {
        // Empty.
        return [NIL, NIL, Kind.Before];
    }

    // ```
    //       4
    //     /   \
    //   2       6
    //  / \     / \
    //
    // 1 2 3 4 5 6 7: key
    // 2 2 4 4 6 6 N: lower (inclusive)
    // N 2 2 4 4 6 6: upper (inclusive)
    // N N 2 2 4 4 6: upper (exclusive)
    //   2   4   6  : node
    // 2   2   6   6: parent
    // L   R   L   R: branch
    // *   *   *   *: swap (inclusive)
    // * * * * * * *: swap (exclusive)
    // ```

    let lower;
    let prev;

    if (start === undefined) {
        // First.
        lower = minimum(root);
    } else {
        const [node, parent, branch] = searchEntry(tree, start);

        if (node !== NIL) {
            // Found.

            lower = node;

            if (exclusive) {
                prev = predecessor(node);
            } else {
                prev = NIL;
            }
        } else {
            // Not found.

            if (branch === Branch.Left) {
                // Left.
                lower = parent;
                prev = predecessor(parent);
            } else {
                // Right.
                lower = successor(parent);

                if (lower === NIL) {
                    // After.
                    return [NIL, NIL, Kind.After];
                }

                prev = parent;
            }
        }
    }

    let upper;

    if (end === undefined) {
        // Last.
        upper = maximum(root);
    } else {
        const [node, parent, branch] = searchEntry(tree, end);

        if (node !== NIL) {
            // Found.

            if (exclusive) {
                if (lower === node) {
                    // At the same node.
                    return [node, node, Kind.Exclusive];
                }

                upper = predecessor(node);
            } else {
                upper = node;
            }
        } else {
            // Not found.

            if (branch === Branch.Right) {
                upper = parent;
            } else {
                upper = predecessor(parent);

                if (upper === NIL) {
                    // First.
                    return [NIL, NIL, Kind.Before];
                }
            }

            if (prev === upper) {
                // Between the same two keys.
                return [upper, lower, Kind.Exclusive];
            }
        }
    }

    return [lower, upper, Kind.Default];
}

/**
 * Searches for the range of nodes with the given start and end keys.
 *
 * If `start` is greater than `end`, an error is thrown.
 *
 * @param map The map.
 * @param tree The tree.
 * @param start The start key (inclusive). If `undefined`, the range starts
 * from the first key.
 * @param end The end key. If `undefined`, the range ends at the last key.
 * @param exclusive `true` if the end key is exclusive, or `false` if the end
 * key is inclusive.
 * @returns The range of nodes with the given start and end keys.
 */
function range<K, V>(
    map: WAVLMap<K, V>,
    tree: WAVLTree<K, V>,
    start: K | undefined,
    end: K | undefined,
    exclusive: boolean,
): WAVLMapRange<K, V> {
    const [lower, upper, kind] = searchRange(map, tree, start, end, exclusive);

    return new WAVLMapRange(map, tree, lower, upper, kind);
}

/**
 * A range of entries in a WAVL map.
 */
export class WAVLMapRange<K, V> extends Inorder<K, V> {
    get [Symbol.toStringTag](): string {
        return "WAVLMapRange";
    }

    /**
     * CAUTION: This constructor is only for internal use. Use
     * `WAVLMap.range()` instead.
     */
    constructor(
        /**
         * The WAVL map.
         */
        private map: WAVLMap<K, V>,
        /**
         * The WAVL tree.
         */
        private tree: WAVLTree<K, V>,
        /**
         * The lower bound of the range.
         */
        private lower: WAVLNode<K, V>,
        /**
         * The upper bound of the range.
         */
        private upper: WAVLNode<K, V>,
        /**
         * The kind of the range.
         */
        private kind = Kind.Default,
    ) {
        super();
    }

    /**
     * Executes a callback function for each node in this range.
     *
     * @param callbackfn The function to execute for each node.
     * @param remove `true` if this range should be removed after iteration.
     */
    private forEachNode(
        callbackfn: (node: WAVLNode<K, V>) => void,
        remove = false,
    ) {
        const kind = this.kind;

        if (kind === Kind.Removed) {
            return;
        }

        if (remove) {
            this.kind = Kind.Removed;
        }

        if (isEmpty(kind)) {
            return;
        }

        validate(this.lower);
        validate(this.upper);

        let node = this.lower;

        while (node !== NIL) {
            const next = node === this.upper ? NIL : successor(node);
            callbackfn(node);
            node = next;
        }
    }

    /**
     * Returns `true` if this range is empty.
     */
    get isEmpty(): boolean {
        return isEmpty(this.kind);
    }

    /**
     * Returns the first entry in this range.
     *
     * @returns The first entry, or an empty entry if this range is empty.
     */
    first(): WAVLMapEntry<K, V> {
        validate(this.lower);

        let inner;

        switch (this.kind) {
            case Kind.Default: {
                // inclusive
                inner = new Occupied(this.tree, this.lower);
                break;
            }
            case Kind.Exclusive: {
                //  exclusive
                let node;
                let branch;

                if (this.lower.right === NIL) {
                    node = this.lower;
                    branch = Branch.Right;
                } else {
                    node = minimum(this.lower.right);
                    branch = Branch.Left;
                }

                inner = new Vacant(this.tree, node, branch, undefined);
                break;
            }
            case Kind.Before: {
                // before
                const node = minimum(this.tree.root);
                inner = new Vacant(this.tree, node, Branch.Left, undefined);
                break;
            }
            case Kind.After: {
                // after
                const node = maximum(this.tree.root);
                inner = new Vacant(this.tree, node, Branch.Right, undefined);
                break;
            }
            case Kind.Removed: {
                // removed
                throw new Error("This range is removed.");
            }
        }

        return new WAVLMapEntry(inner);
    }

    /**
     * Returns the last entry in this range.
     *
     * @returns The last entry, or an empty entry if this range is empty.
     */
    last(): WAVLMapEntry<K, V> {
        validate(this.upper);

        let inner;

        switch (this.kind) {
            case Kind.Default: {
                // inclusive
                inner = new Occupied(this.tree, this.upper);
                break;
            }
            case Kind.Exclusive: {
                //  exclusive
                let node;
                let branch;

                if (this.upper.left === NIL) {
                    node = this.upper;
                    branch = Branch.Left;
                } else {
                    node = maximum(this.upper.left);
                    branch = Branch.Right;
                }

                inner = new Vacant(this.tree, node, branch, undefined);
                break;
            }
            case Kind.Before: {
                // before
                const node = minimum(this.tree.root);
                inner = new Vacant(this.tree, node, Branch.Left, undefined);
                break;
            }
            case Kind.After: {
                // after
                const node = maximum(this.tree.root);
                inner = new Vacant(this.tree, node, Branch.Right, undefined);
                break;
            }
            case Kind.Removed: {
                // removed
                throw new Error("This range is removed.");
            }
        }

        return new WAVLMapEntry(inner);
    }

    /**
     * Counts the number of entries in this range.
     *
     * @returns The number of entries in this range.
     */
    count(): number {
        let count = 0;

        this.forEachNode(() => {
            count++;
        });

        return count;
    }

    /**
     * Deletes all entries in this range.
     *
     * @returns The number of entries deleted.
     */
    delete(): number {
        let count = 0;

        this.forEachNode((node) => {
            remove(this.tree, node);
            count++;
        }, true);

        return count;
    }

    /**
     * Removes all entries in this range.
     *
     * @returns An array of the removed entries.
     */
    remove(): [K, V][] {
        const removed: [K, V][] = [];

        this.forEachNode((node) => {
            removed.push([node.key, node.value]);
            remove(this.tree, node);
        }, true);

        return removed;
    }

    /**
     * Executes a callback function for each entry in this range, in order.
     *
     * @param callbackfn The function to execute for each entry.
     * @param thisArg The `this` value for the callback function.
     */
    forEach(
        callbackfn: (value: V, key: K, map: Map<K, V>) => void,
        thisArg?: unknown,
    ): void {
        if (isEmpty(this.kind)) {
            return;
        }

        validate(this.lower);
        validate(this.upper);

        let node = this.lower;

        while (node !== NIL) {
            callbackfn.call(thisArg, node.value, node.key, this.map);

            if (node === this.upper) {
                break;
            }

            node = successor(node);
        }
    }

    /**
     * Executes a callback function for each entry in this range, in reverse order.
     *
     * @param callbackfn The function to execute for each entry.
     * @param thisArg The `this` value for the callback function.
     */
    forEachReverse(
        callbackfn: (value: V, key: K, map: Map<K, V>) => void,
        thisArg?: unknown,
    ): void {
        if (isEmpty(this.kind)) {
            return;
        }

        validate(this.lower);
        validate(this.upper);

        let node = this.upper;

        while (node !== NIL) {
            callbackfn.call(thisArg, node.value, node.key, this.map);

            if (node === this.lower) {
                break;
            }

            node = predecessor(node);
        }
    }

    protected *inorder(): IterableIterator<WAVLNode<K, V>> {
        if (isEmpty(this.kind)) {
            return;
        }

        validate(this.lower);
        validate(this.upper);

        let node = this.lower;

        while (node !== NIL) {
            yield node;

            if (node === this.upper) {
                break;
            }

            node = successor(node);
        }
    }

    protected *inorderReverse(): IterableIterator<WAVLNode<K, V>> {
        if (isEmpty(this.kind)) {
            return;
        }

        validate(this.lower);
        validate(this.upper);

        let node = this.upper;

        while (node !== NIL) {
            yield node;

            if (node === this.lower) {
                break;
            }

            node = predecessor(node);
        }
    }
}

/**
 * A map that uses a WAVL tree to store the entries in order.
 */
export class WAVLMap<K, V> extends Inorder<K, V> {
    get [Symbol.toStringTag](): string {
        return "WAVLMap";
    }

    /**
     * The WAVL tree.
     */
    private tree: WAVLTree<K, V>;

    /**
     * Creates a new WAVL map with the default compare function.
     *
     * The default compare function uses the `<` operator to order the keys
     * in ascending order.
     */
    constructor();
    /**
     * Creates a new WAVL map with the given entries and the default compare function.
     *
     * The default compare function uses the `<` operator to order the keys
     * in ascending order.
     *
     * @param iterable The entries to add to the map.
     */
    constructor(iterable: Iterable<readonly [K, V]>);
    /**
     * Creates a new WAVL map with the given compare function.
     *
     * The compare function is used to order the keys in the map. It should
     * return a negative number if `a` is less than `b`, a positive number
     * if `a` is greater than `b`, or `0` if `a` is equal to `b`.
     *
     * @param compare The compare function.
     */
    constructor(compare: (a: K, b: K) => number);
    /**
     * Creates a new WAVL map with the given compare function and entries.
     *
     * The compare function is used to order the keys in the map. It should
     * return a negative number if `a` is less than `b`, a positive number
     * if `a` is greater than `b`, or `0` if `a` is equal to `b`.
     *
     * @param compare The compare function.
     * @param iterable The entries to add to the map.
     */
    constructor(
        compare: (a: K, b: K) => number,
        iterable: Iterable<readonly [K, V]>,
    );
    constructor(
        a?: Iterable<readonly [K, V]> | ((a: K, b: K) => number),
        b?: Iterable<readonly [K, V]>,
    ) {
        super();

        if (typeof a === "function") {
            this.tree = new WAVLTree(a);
        } else {
            this.tree = new WAVLTree(ascending);
            b = a;
        }

        if (b !== undefined) {
            for (const [key, value] of b) {
                this.insert(key, value);
            }
        }
    }

    /**
     * Returns `true` if this map is empty.
     */
    get isEmpty(): boolean {
        return this.tree.root === NIL;
    }

    /**
     * The number of entries in this map.
     */
    get size(): number {
        return this.tree.size;
    }

    /**
     * The compare function used to order the keys in this map.
     */
    get compare(): (a: K, b: K) => number {
        return this.tree.compare;
    }

    /**
     * Clears this map.
     */
    clear(): void {
        clear(this.tree);
    }

    /**
     * Returns `true` if this map contains the given key.
     *
     * @param key The key to search for.
     * @returns `true` if this map contains the given key.
     */
    has(key: K): boolean {
        return search(this.tree, key) !== NIL;
    }

    /**
     * Returns the value associated with the given key.
     *
     * @param key The key to search for.
     * @returns The value associated with the given key, or `undefined` if
     * this map does not contain the given key.
     */
    get(key: K): V | undefined {
        const node = search(this.tree, key);

        return node === NIL ? undefined : node.value;
    }

    /**
     * Returns the first entry in this map.
     *
     * @returns The first entry in this map, or an empty entry if this map is empty.
     */
    first(): WAVLMapEntry<K, V> {
        const node = minimum(this.tree.root);

        let inner;

        if (node === NIL) {
            inner = new Vacant(this.tree, NIL, Branch.Left, undefined);
        } else {
            inner = new Occupied(this.tree, node);
        }

        return new WAVLMapEntry(inner);
    }

    /**
     * Returns the last entry in this map.
     *
     * @returns The last entry in this map, or an empty entry if this map is empty.
     */
    last(): WAVLMapEntry<K, V> {
        const node = maximum(this.tree.root);

        let inner;

        if (node === NIL) {
            inner = new Vacant(this.tree, NIL, Branch.Right, undefined);
        } else {
            inner = new Occupied(this.tree, node);
        }

        return new WAVLMapEntry(inner);
    }

    /**
     * Returns the entry associated with the given key.
     *
     * @param key The key to search for.
     * @returns The entry associated with the given key.
     */
    entry(key: K): WAVLMapEntryWithKey<K, V> {
        return new WAVLMapEntryWithKey(entry(this.tree, key));
    }

    /**
     * Returns the range of entries between the given keys.
     *
     * @param start The start of the range (inclusive).
     * @param end The end of the range.
     * @param exclusive `true` if the end of the range is exclusive, or `false`
     * if the end of the range is inclusive. Defaults to `false`.
     * @returns The range of entries between the given keys.
     */
    range(start?: K, end?: K, exclusive = false): WAVLMapRange<K, V> {
        return range(this, this.tree, start, end, exclusive);
    }

    /**
     * Adds a new entry to this map. If an entry with the same key already exists,
     * the entry will be updated.
     *
     * @param key The key of the new entry.
     * @param value The value of the new entry.
     * @returns This map.
     */
    set(key: K, value: V): this {
        insert(this.tree, key, value);
        return this;
    }

    /**
     * Inserts a new entry to this map. If an entry with the same key already exists,
     * the entry will be updated.
     *
     * @param key The key of the new entry.
     * @param value The value of the new entry.
     * @returns The old value, or `undefined` if this map did not contain the given key.
     */
    insert(key: K, value: V): V | undefined {
        return insert(this.tree, key, value);
    }

    /**
     * Deletes the entry associated with the given key. If the entry does not exist,
     * this method does nothing.
     *
     * @param key The key of the entry to delete.
     * @returns `true` if the entry was deleted, or `false` if the entry did not exist.
     */
    delete(key: K): boolean {
        const node = search(this.tree, key);

        if (node === NIL) {
            return false;
        }

        remove(this.tree, node);
        return true;
    }

    /**
     * Removes the entry associated with the given key. If the entry does not exist,
     * this method does nothing.
     *
     * @param key The key of the entry to remove.
     * @returns The value of the removed entry, or `undefined` if the entry did not exist.
     */
    remove(key: K): V | undefined {
        const node = search(this.tree, key);

        if (node === NIL) {
            return undefined;
        }

        return remove(this.tree, node).value;
    }

    /**
     * Executes a callback function for each entry in this map, in order.
     *
     * @param callbackfn The callback function.
     * @param thisArg The `this` value for the callback function.
     */
    forEach(
        callbackfn: (value: V, key: K, map: Map<K, V>) => void,
        thisArg?: unknown,
    ): void {
        let node = minimum(this.tree.root);

        while (node !== NIL) {
            callbackfn.call(thisArg, node.value, node.key, this);
            node = successor(node);
        }
    }

    /**
     * Executes a callback function for each entry in this map, in reverse order.
     *
     * @param callbackfn The callback function.
     * @param thisArg The `this` value for the callback function.
     */
    forEachReverse(
        callbackfn: (value: V, key: K, map: Map<K, V>) => void,
        thisArg?: unknown,
    ): void {
        let node = maximum(this.tree.root);

        while (node !== NIL) {
            callbackfn.call(thisArg, node.value, node.key, this);
            node = predecessor(node);
        }
    }

    protected *inorder(): IterableIterator<WAVLNode<K, V>> {
        let node = minimum(this.tree.root);

        while (node !== NIL) {
            yield node;
            node = successor(node);
        }
    }

    protected *inorderReverse(): IterableIterator<WAVLNode<K, V>> {
        let node = maximum(this.tree.root);

        while (node !== NIL) {
            yield node;
            node = predecessor(node);
        }
    }
}
