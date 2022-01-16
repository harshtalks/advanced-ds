/**
 * D way Heap
 * D >= 2 => priority queue
 * D = 1 => sorted array
 *
 * What is Heap =>
 * heap is the most used version of priority queues. It allows elements to be inserted and retrieved in either ascending or descending order, one at a time.
 */

/**
 * WeakMap => The WeakMap object is a collection of key/value pairs in which the keys are weakly referenced. The keys must be objects and the values can be arbitrary values.
 */

const _branchingFactor = new WeakMap()
const _elements = new WeakMap()
const _positions = new WeakMap()
const _compare = new WeakMap()
const _bubbleUp = new WeakMap()
const _pushDown = new WeakMap()
const _setElementToPosition = new WeakMap()
const _removeElementFromPosition = new WeakMap()
const _getElementPosition = new WeakMap()


// ERROR HANDLING

const ERROR_MSG_DWAYHEAP_CONSTRUCTOR_BRANCHINGFACTOR =
    (val) => `Illegal argument for DwayHeap constructor: branchingFactor ${val}`

const ERROR_MSG_DWAYHEAP_CONSTRUCTOR_ELEMENTS =
    (val) => `Illegal argument for DwayHeap constructor: elements ${val}`

const ERROR_MSG_DWAYHEAP_CONSTRUCTOR_COMPARE =
    (val) => `Illegal argument for DwayHeap constructor: compare ${val}`

const ERROR_MSG_DWAY_PUSH = val => `Illegal argument for push: ${val}`

const ERROR_MSG_DWAYHEAP_EMPTY_HEAP = () => `Invalid Status: Empty Heap`;

const ERROR_MSG_DWAYHEAP_CHECK = () => `Heap Properties Violated`;

const ERROR_MSG_DWAYHEAP_UPDATE_PRIORITY = (val) => `Out of range argument: element ${val} not stored in the heap`;

const ERROR_MSG_DWAYHEAP_UPDATE_PRIORITY_API = (val) => `Illegal argument for updatePriority: ${val}`;

const ERROR_MSG_DWAYHEAP_ELEMENT_POSITION = (val) => `Error: can't find position for elem:  ${val}`;



/**
 * @name defaultCompare
 * @description
 * to compare two of the arguments provided
 *
 * @param {!Number}x first element
 * @param {!Number}y second element
 * @returns {!Number} boolean value ( -1,0,1 }
 */

const defaultCompare = (x, y) => {
    if (x < y) {
        return -1
    }
    else if ( x > y) {
        return 1
    } else return 0
}


 /**
 * @name validateElement
 * @for DWayHeap
 * @private
 * @description
 *
 * Validate an element.
 *
 * @param {*} value
 * @returns {boolean} True iff it is possible to store this value in the heap
 */


const validateElement = value => {
    return typeof value !== 'undefined' && typeof value !== 'function' && value !== null
}

/**
 * @name setElementPosition
 * @for DWayHeap
 * @private
 * @description
 *
 * Set an element position in the heap, updating its location, if necessary.
 * (We must keep track of the location of each element to speed up the updatePriority method,
 * which is heavily used in Prim and Dijkstra algorithms).
 *
 *
 * @param {!Array} elements The array of elements in the heap.
 * @param {!Map} positions A map for each (unique) elem in the to the positions in which it is stored.
 * @param {!*} elem  The element to be stored in the heap.
 * @param {!Number} index   The index of the new position of elem in the heap array.
 * @param {?Number} oldIndex  Optional parameter: The old index of elem inside the array.
 *
 * @return {undefined}
 */

const setElementPosition = (elements,positions,elem,index,oldIndex) => {

    if(!positions.has(elem)) {
        positions.set(elem,[index])
    }else {
        oldIndex = parseInt(oldIndex,10)
        if (!Number.isNaN(oldIndex)){
            let i = positions.get(elem).indexOf(oldIndex)
            if (i => 0) {
                positions.get(elem).splice(i,1)
            }
        }
        positions.get(elem).push(index)
    }

    elements[index] = elem
}
/**
 * @name removeElementPosition
 * @for DWayHeap
 * @private
 * @description
 *
 * Remove an element at a certain position in the heap, updating its location, if necessary.
 * (We must keep track of the location of each element to speed up the updatePriority method,
 * which is heavily used in Prim and Dijkstra algorithms).
 * @param {!Array} elements The array of elements in the heap.
 * @param {!Map} positions A map for each (unique) elem in the to the positions in which it is stored.
 * @param {!Number} index   The index of the new position of elem in the heap array.
 * @param {?Boolean} splice   Optional parameter: flag to state if the element must also be esponged from the array.
 *
 * @return {*} The element stored at index.
 */

const removeElementPosition = (elements, positions, index, splice) => {
    const elem = elements[index]

    // we have to remove exactly one occurrence of this element at a given index.
    const i = positions.get(elem).indexOf(index)

    if (i => 0) {
        // this element was present at that index so remove it from the index element map
        positions.get(elem).splice(i,1)
    }

    if(splice) {
        // remove it from the elements array too
        elements.splice(index,1)
    }

    return elem
}

/**
 * @name getElementPosition
 * @for DWayHeap
 * @private
 *
 * @description
 *
 * Get the position of the passed element in the heap.
 * (We must keep track of the location of each element to speed up the updatePriority method,
 * which is heavily used in Prim and Dijkstra algorithms).
 *
 * @param {!Map} positions A map for each (unique) elem in the to the positions in which it is stored.
 * @param {!*} elem  The element whose position is to be retrieved.
 *
 * @return {Number}  The position of the element in the heap elements array. If the same element appears
 *                   in more than one positions, the first one in the list is returned (not necessarily
 *                   the smallest one).
 *                   If the element is not contained in the heap, returns -1.
 */

const getElementPosition = (positions,elem) => {
    if (positions.get(elem) && positions.get(elem).length > 0) {
        return positions.get(elem)
    }
    else {
        return null
    }
}

/**
 * @name getParent
 * @param {!Number}index
 * @param {!Number}branchingFactor
 * @return {number}
 */

const getParent = (index, branchingFactor) => Math.floor((index-1)/branchingFactor)

/**
 * @name bubbleUp
 * @for DWayHeap
 * @private
 * @description
 *
 * Reinstate the properties of the heap by bubbling an element up to the root
 *
 * @param {!Array} elements The array of elements in the heap.
 * @param {!Map} positions A map for each (unique) elem in the to the positions in which it is stored.
 * @param {!Number} branchingFactor The branching factor of the heap.
 * @param {!Function} compare A comparator for heap's elements.
 * @param {!Number} index The index of the element to move towards the root of the heap.
 *
 * @return {Number} The new position for the element.
 */

const bubbleUp = (elements, positions, branchingFactor, compare, index) => {
    const current = elements[index]

    let i = index

    while (i > 0) {
        const parentIndex = getParent(i,branchingFactor)
        if (compare(current,elements[parentIndex]) < 0) {
            setElementPosition(elements,positions,elements[parentIndex],i,parentIndex)
            i = parentIndex
        }else break
    }

    if (i !== index) {
        setElementPosition(elements,positions,current,i,index)
    }
    return i
}

/**
 * @name pushDown
 * @for DWayHeap
 * @private
 * @description
 *
 * Reinstate the properties of the heap by pushing down an element towards the leaves
 *
 * @param {!Array} elements The array of elements in the heap.
 * @param {!Map} positions A map for each (unique) elem in the to the positions in which it is stored.
 * @param {!Number} branchingFactor The branching factor of the heap.
 * @param {!Function} compare A comparator for heap's elements.
 * @param {Number} index The index of the element to push down the heap.
 *
 * @return {Number} The new position for the element.
 */

const pushDown = (elements, positions, branchingFactor, compare, index) => {
    const current = elements[index]
    const n = elements.length
    let parentIndex = index
    let smallestChildIndex = index * branchingFactor + 1;

    while (smallestChildIndex < n) {
        let smallestChild = elements[smallestChildIndex]
        let m = Math.min(n,smallestChildIndex + branchingFactor)
        for (let i = smallestChildIndex + 1; i < m; i++) {
            if(compare(elements[i], smallestChild) < 0) {
                smallestChildIndex = i
                smallestChild = elements[i]
            }
        }

        if (compare(smallestChild,current) < 0) {
            setElementPosition(elements,positions,smallestChild,parentIndex,smallestChildIndex)
            parentIndex=smallestChildIndex
            smallestChildIndex = parentIndex * branchingFactor + 1
        }else{
            break
        }
    }

    if (index !== parentIndex) {
        setElementPosition(elements,positions,current,parentIndex,index)
    }

    return parentIndex
}

/**
 * @name heapify
 * @for DWayHeap
 * @private
 * @description
 *
 * Initialize a heap with a set of elements.
 * INVARIANT: elements contains been checked before being passed to heapify,
 *            and MUST be a valid non-empty array.
 * @param {!Array}elements
 * @param {!Map}positions
 * @param {!Number}branchingFactor
 * @param {!Function}compare
 * @param {!Array}initialElements
 */

const heapify = (elements, positions, branchingFactor, compare, initialElements) => {
    const n = initialElements.length

    for (let i =0; i < n; i++) {
        setElementPosition(elements, positions, initialElements[i], i)
    }

    const lastInnerNode = Math.floor((n-1)/branchingFactor)

    for (let i = lastInnerNode; i >=0 ; i--) {
        pushDown(elements, positions, branchingFactor, compare, i)
    }

    // debugging
    console.log(check(elements,branchingFactor,compare))
}

//debugging function

const check = (elements,  branchingFactor, compare) => {
    const n = elements.length;

    for (let parentIndex = 0; parentIndex < n; parentIndex++){
        let parent = elements[parentIndex]
        let childIndex = parentIndex * branchingFactor + 1
        let m = Math.min(n, childIndex + branchingFactor)
        for(; childIndex < m; childIndex++){
            if(compare(elements[childIndex],parent) < 0) {
                throw new Error(ERROR_MSG_DWAYHEAP_CHECK())
            }
        }
    }

    return true
}

/**
 * @class DWayHeap
 *
 * A d-way heap (aka d-ary heap or d-heap) is a priority queue data structure, a generalization of the binary
 * heap in which the nodes have d children instead of 2. Thus, a binary heap is a 2-heap.
 * D-way heaps are pretty useful in practice in the implementation of Dijkstra and Prim algorithms
 * for graphs, among many other things.
 * While Fibonacci's heaps would be theoretically faster, no simple and fast implementation of such data structures is known.
 * In practice, a 4-way heap is the best solution for the priority queues in these algorithms.
 *
 * This implementation uses a Map to store keys positions inside the heap.
 * This has 3 important consequences:
 * 1. You can store both literals and objects in the heap.
 * 2. If you store an object, to retrieve it you need to pass to .get() the same object. Different objects, even if
 *    containing the same fields, are not considered equal. This is due to a limitation of Maps
 *    (see http://www.2ality.com/2015/01/es6-maps-sets.html).
 * 3. References to the objects stored are held until they are removed from the heap. If we used a WeakMap instead,
 *    references would have been held weakly, allowing garbage collector to dispose those objects if not used elsewhere.
 *    So, for example:
 *
 *      const map = new Map();
 *      let x = [], y = [];
 *      map.set(x, 1);
 *      console.log(map.has(x)); // Will print false
 *
 *    WeekMaps, however, doesn't allow primitive values, so heap keys would have had to be objects.
 */

class DWayHeap {
    //constructor
    constructor(branchingFactor = 2, elements = [], compare = defaultCompare) {

        const bf = parseInt(branchingFactor,10)
        if(Number.isNaN(bf) || bf < 2) {
            throw new TypeError(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_BRANCHINGFACTOR(bf))
        }

        if(elements === undefined || elements === null || !Array.isArray(elements)) {
            throw new TypeError(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_ELEMENT(elements))
        }

        if (typeof compare !== 'undefined' && (typeof compare !== 'function' || compare.length !== 2)) {
            throw new TypeError(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_COMPARE(compare))
        }

        // weakMaps and the functions defined earliers will be bound to this class

        _branchingFactor.set(this,bf)
        _compare.set(this,compare)
        _positions.set(this,new Map())
        _elements.set(this,[])

        _bubbleUp.set(
            this,
            bubbleUp.bind(this,_elements.get(this),_positions.get(this),_branchingFactor.get(this),_compare.get(this))
        )

        _pushDown.set(
            this,
            pushDown.bind(this,_elements.get(this),_positions.get(this),_branchingFactor.get(this),_compare.get(this))
        )

        _setElementToPosition.set(
            this,
            setElementPosition.bind(this,_elements.get(this),_positions.get(this))
        )

        _removeElementFromPosition.set(
            this,
            removeElementPosition.bind(this,_elements.get(this),_positions.get(this))
        )

        _getElementPosition.set(
            this,
            getElementPosition.bind(this, getElementPosition.bind(this, _positions.get(this)))
        )

        heapify(_elements.get(this), _positions.get(this), _branchingFactor.get(this), _compare.get(this), elements)
    }

    /**
     * @name size
     * @for DWayHeap
     * @getter
     * @description
     *
     * Return the number of elements stored in the heap.
     *
     * @return {Number} The number of elements in the heap.
     */

    get size() {
        return _elements.get(this).length
    }

    /**
     * @name isEmpty
     * @for DWayHeap
     * @description
     *
     * Check if the heap is empty.
     *
     * @return {Boolean} True <=> the heap is empty, false otherwise.
     */
    isEmpty() {
        return this.size === 0;
    }

    /**
     * @name branchFactor
     * @for DWayHeap
     * @getter
     * @description
     * Return the branch factor of current heap.
     *
     * @returns {number} The branch factor for this heap.
     */


    get branchFactor() {
        return _branchingFactor.get(this);
    }

    /**
     * @name contains
     * @for DWayHeap
     *
     * Returns true if the element is stored in the heap, false otherwise
     *
     * @param {!*} elem  The element to look for.
     *
     * @return {Boolean}   true <=> The element is stored in the heap.
     */

    contains(elem) {
        let ps = _positions.get(this)(elem)
        return ps !== null && ps.length > 0
    }


    /**
     * @name peek
     * @for DWayHeap
     *
     * If the heap is not empty, return a reference to the first element in the heap.
     *
     * @return {*} A deep copy of the top element in the heap
     * @throws {Error(ERROR_MSG_DWAYHEAP_EMPTY_HEAP)}  Throws an error if the heap is empty.
     */

    peek (){
        if(this.isEmpty()){
            throw new Error(ERROR_MSG_DWAYHEAP_EMPTY_HEAP())
        }

        return JSON.parse(JSON.stringify(_elements.get(this)[0]))
    }

    /**
     * @name push
     * @for DWayHeap
     *
     * Add an element to the heap, taking care of reinstating heap's properties.
     *
     * @param {*} elem   The element to add to the heap. Must be a comparable element.
     *
     * @return {Object} The heap itself, to comply with the chaining pattern.
     * @throws {TypeError(ERROR_MSG_DWAYHEAP_PUSH)}  Throws an error if the first parameter is undefined or null.
     */

    push(elem) {
        const n = this.size

        if (!validateElement(elem)) {
            throw new TypeError(ERROR_MSG_DWAY_PUSH())
        }

        _setElementToPosition.get(this)(elem, n)
        _bubbleUp.get(this)(n)

        return this
    }

    /**
     * @name top
     * @for DWayHeap
     *
     * If the heap is not empty, return the first element in the heap, after removing it from the data structure;
     * The heap properties are then reinstated.
     *
     * @return {*} A reference to the top element in the heap
     * @throws {Error(ERROR_MSG_DWAYHEAP_EMPTY_HEAP)}  Throws an error if the heap is empty.
     */


    top() {
        const n = this.size

        switch (n){
            case 0:
                throw new Error(ERROR_MSG_DWAYHEAP_EMPTY_HEAP());
            case 1:
                return _removeElementFromPosition.get(this)(0,true)
            default:
                let topElem = _removeElementFromPosition.get(this)(0,false)

                let elem = _removeElementFromPosition.get(this)(n-1,true)
                _setElementToPosition.get(this)(elem,0,n-1)
                _pushDown.get(this)(0)

        }
    }

    /**
     * @name updatePriority
     * @for DWayHeap
     *
     * Updates all the element stored in the heap matching oldValue, possibly changing its priority;
     * then it takes care of reinstating heap's properties.
     * If the new priority is greater (i.e. newValue < oldValue) the new element will be pushed toward the root,
     * if it's smaller (i.e. newValue > oldValue) it will be pushed towards the leaves.
     * **WARNING** Be advised that all the occurrences of the old value will be replaced with the instance of the new value passed.
     *             In case `newValue` is an object, the same reference will replace all the occurrences of oldValue.
     *
     * @param {*} oldValue   The element to be updated. MUST be in the heap.
     * @param {*} newValue   The new value for the element.
     *
     * @return {Object} The heap itself, to comply with the chaining pattern.
     * @throws {RangeError(ERROR_MSG_DWAYHEAP_UPDATE_PRIORITY)}  Throws an error if the first parameter is undefined or null.
     * @throws {RangeError(ERROR_MSG_DWAYHEAP_ELEMENT_POSITION)}  Throws an error if the first parameter is undefined or null.
     */


    updatePriority(oldValue, newValue) {
        const compareResult = _compare.get(this)(newValue,oldValue)
        const n = this.size;

        if(!this.contains(oldValue)) {
            throw new RangeError(ERROR_MSG_DWAYHEAP_ELEMENT_POSITION(oldValue))
        }

        let indices = _getElementPosition.get(this)(oldValue)

        if(!validateElement(newValue)){
            throw new TypeError(ERROR_MSG_DWAYHEAP_UPDATE_PRIORITY_API(newValue))
        }


        for (let i of indices) {
            if (i < 0 || i > n){
                throw new RangeError(ERROR_MSG_DWAYHEAP_UPDATE_PRIORITY(newValue))
            }

            _setElementToPosition.get(this)(newValue, i)
        }

        if(compareResult < 0) {
            indices = indices.sort((x,y) => x-y)
            for (let i of indices){
                _bubbleUp.get(this)(i)
            }
        }else if(compareResult > 0){
            indices = indices.sort((x, y) => y - x);
            for (let i of indices) {
                _pushDown.get(this)(i);
            }


        }

        return this

    }

    /**
     * @name sorted
     * @for DWayHeap
     *
     * Return a sorted array with all the elements in the heap.
     * WARNING: all the elements will be removed from the heap!
     *
     * @return  {Array} The sorted array with all elements (possibility empty).
     */

    sorted() {
        let res = []
        while (this.size > 0) {
            res.push(this.top())
        }

        return res
    }

    view() {
        _elements.get(this).forEach(el => console.log(el))
    }

}

export default DWayHeap



