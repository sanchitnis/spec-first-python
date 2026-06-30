# Lab 2: Property-Based Testing and Bug Hunting

## Learning Objectives

By the end of this lab, you will:
1. Write property-based tests using Hypothesis
2. Find bugs in "obviously correct" code
3. Derive properties from specifications
4. Use stateful testing for complex objects
5. Apply AI assistance to discover properties

## Duration: 3 hours

---

## Part 1: The Bug Safari (45 minutes)

You are given code that looks correct but has hidden bugs. Find them using property-based testing!

### Exercise 2.1: Find Bugs in "Correct" Code

File: `lab2_bugs.py` (intentionally buggy - DON'T READ THE IMPLEMENTATION FIRST!)

```python
from typing import List, TypeVar

T = TypeVar('T')

def buggy_sort(arr: List[int]) -> List[int]:
    """"Sorts" a list. Or does it?"""
    # DON'T READ THIS - write properties first!
    pass

def buggy_reverse(s: str) -> str:
    """"Reverses" a string. Or does it?"""
    pass

def buggy_intersection(list1: List[int], list2: List[int]) -> List[int]:
    """Finds "intersection" of two lists. Or does it?"""
    pass

def buggy_unique(arr: List[int]) -> List[int]:
    """Returns "unique" elements. Or does it?"""
    pass
```

**Instructions:**
1. For each function, write 3+ properties BEFORE looking at the implementation
2. Write Hypothesis tests for each property
3. Run the tests and watch them fail (finding bugs!)
4. Fix the bugs and verify all properties pass
5. Document each bug found and the property that caught it

### Example Property Set for `buggy_sort`:

```python
from hypothesis import given, strategies as st

# Property 1: Result is sorted (most important!)
@given(st.lists(st.integers()))
def test_sort_sortedness(arr):
    result = buggy_sort(arr)
    assert all(result[i] <= result[i+1] for i in range(len(result)-1))

# Property 2: Length preserved
@given(st.lists(st.integers()))
def test_sort_length_preserved(arr):
    assert len(buggy_sort(arr)) == len(arr)

# Property 3: Permutation (same elements)
@given(st.lists(st.integers()))
def test_sort_permutation(arr):
    result = buggy_sort(arr)
    assert sorted(arr) == sorted(result)

# Property 4: Idempotence (sorting twice is same as once)
@given(st.lists(st.integers()))
def test_sort_idempotent(arr):
    once = buggy_sort(arr)
    twice = buggy_sort(once)
    assert once == twice

# Property 5: Min element is first
@given(st.lists(st.integers(), min_size=1))
def test_sort_min_first(arr):
    result = buggy_sort(arr)
    assert result[0] == min(arr)
```

**Deliverable:** List of bugs found, properties that caught them, and your fixed implementations.

---

## Part 2: Deriving Properties from Specifications (45 minutes)

### Exercise 2.2: Specification → Property Mapping

Given these specifications, write Hypothesis tests for ALL properties:

**Specification A: `merge_sorted(list1, list2)`**
```
Pre: list1 is sorted, list2 is sorted
Post: result is sorted
Post: result is a permutation of list1 + list2
Post: len(result) == len(list1) + len(list2)
Post: All elements from list1 appear in result in same relative order
Post: All elements from list2 appear in result in same relative order
```

**Specification B: `rotate_list(arr, k)`**
```
Pre: arr is non-empty
Pre: k is non-negative integer
Post: result is a rotation of arr by k positions
Post: len(result) == len(arr)
Post: rotate(rotate(arr, k), len(arr)-k) == arr (inverse property)
Post: rotate(arr, 0) == arr (identity property)
Post: rotate(arr, len(arr)) == arr (periodicity property)
```

**Specification C: `group_by_key(records, key)`**
```
Pre: records is a list of dictionaries
Pre: key is a string
Post: result is a dictionary mapping key values to lists of records
Post: All records from input appear in output (no loss)
Post: No record appears in more than one group
Post: Sum of lengths of all groups == len(records)
```

**Deliverable:** Complete `test_lab2_properties.py` with all properties tested.

---

## Part 3: Stateful Testing (45 minutes)

### Exercise 2.3: State Machine Testing for a Stack

Implement a `StatefulStack` test using Hypothesis stateful testing:

```python
from hypothesis.stateful import RuleBasedStateMachine, rule, invariant, precondition
from hypothesis import strategies as st
from typing import List

class StatefulStackTest(RuleBasedStateMachine):
    """
    Test a Stack implementation using stateful property-based testing.
    
    Rules:
    - push(item): Push item onto stack
    - pop(): Pop item from stack (if not empty)
    - peek(): View top item (if not empty)
    
    Invariants:
    - size >= 0
    - size == len(internal_list)
    - If not empty, peek() == last pushed item
    - pop() returns items in LIFO order
    """
    
    def __init__(self):
        super().__init__()
        self.model: List[int] = []  # Reference model
        self.implementation = Stack()  # Implementation under test
    
    @rule(item=st.integers())
    def push(self, item):
        self.model.append(item)
        self.implementation.push(item)
    
    @rule()
    @precondition(lambda self: len(self.model) > 0)
    def pop(self):
        expected = self.model.pop()
        result = self.implementation.pop()
        assert result == expected, f"Expected {expected}, got {result}"
    
    @rule()
    @precondition(lambda self: len(self.model) > 0)
    def peek(self):
        expected = self.model[-1]
        result = self.implementation.peek()
        assert result == expected
    
    @invariant()
    def size_consistent(self):
        assert self.implementation.size() == len(self.model)
    
    @invariant()
    def size_non_negative(self):
        assert self.implementation.size() >= 0

TestStack = StatefulStackTest.TestCase
```

**Tasks:**
1. Implement the `Stack` class (with type annotations and contracts)
2. Run the stateful test: `pytest test_stateful_stack.py -v --hypothesis-show-statistics`
3. Observe the test sequences generated by Hypothesis
4. If tests fail, debug and fix the implementation
5. Add a `clear()` rule and invariant (stack is empty after clear)

**Deliverable:** Working `Stack` class and passing stateful tests with statistics.

---

## Part 4: AI-Assisted Property Discovery (45 minutes)

### Exercise 2.4: AI Property Discovery Challenge

Use the AI TA to discover properties for a `LRUCache` class:

```python
from typing import TypeVar, Generic, Optional
from dataclasses import dataclass
from collections import OrderedDict

K = TypeVar('K')
V = TypeVar('V')

class LRUCache(Generic[K, V]):
    """
    Least Recently Used Cache with fixed capacity.
    
    Specification:
    - get(key): Returns value if exists, None otherwise. Marks as recently used.
    - put(key, value): Adds key-value pair. If at capacity, evicts least recently used.
    - capacity: Fixed maximum size.
    
    Invariants:
    - len(cache) <= capacity
    - If key exists, get(key) returns its value
    - After get(key), key is most recently used
    - After put(key, value), key is most recently used
    - If at capacity and new key added, oldest key is removed
    """
    
    def __init__(self, capacity: int):
        self.capacity = capacity
        self._cache: OrderedDict[K, V] = OrderedDict()
    
    def get(self, key: K) -> Optional[V]:
        if key not in self._cache:
            return None
        self._cache.move_to_end(key)
        return self._cache[key]
    
    def put(self, key: K, value: V) -> None:
        if key in self._cache:
            self._cache.move_to_end(key)
        self._cache[key] = value
        if len(self._cache) > self.capacity:
            self._cache.popitem(last=False)
    
    def size(self) -> int:
        return len(self._cache)
```

**Tasks:**
1. **Your attempt:** Write 5 properties you think should hold
2. **AI assistance:** Use the AI TA with this prompt:
   ```
   I have an LRU Cache implementation. Suggest 10 properties I should test
   with Hypothesis stateful testing. Include properties about:
   - Capacity limits
   - Eviction behavior
   - Recency ordering
   - Hit/miss behavior
   - Duplicate key handling
   ```
3. **Comparison:** Compare your properties with AI's suggestions
4. **Implementation:** Write all properties as tests
5. **Evaluation:** Score the AI: How many properties were correct? How many caught real issues?

**Deliverable:** Complete test suite + AI evaluation report (300 words).

---

## Part 5: The Grand Challenge - Find the Bug (45 minutes)

### Exercise 2.5: The Grand Challenge

You are given a "production-ready" `sorted_set` implementation. Use PBT to find all bugs:

```python
from typing import List, TypeVar, Iterator

T = TypeVar('T', int, str, float)

class SortedSet:
    """
    A set that maintains elements in sorted order.
    
    Specification:
    - add(item): Add item if not present. Maintain sorted order.
    - remove(item): Remove item if present.
    - contains(item): Return True if item is in set.
    - __iter__(): Iterate in sorted order.
    - __len__(): Return number of elements.
    """
    
    def __init__(self):
        self._items: List[T] = []
    
    def add(self, item: T) -> bool:
        """Add item. Return True if added, False if already present."""
        # Implementation hidden - find bugs with PBT!
        pass
    
    def remove(self, item: T) -> bool:
        """Remove item. Return True if removed, False if not present."""
        pass
    
    def contains(self, item: T) -> bool:
        """Check if item is in set."""
        pass
    
    def __iter__(self) -> Iterator[T]:
        return iter(self._items)
    
    def __len__(self) -> int:
        return len(self._items)
```

**Hints for finding bugs:**
1. Test with duplicate additions
2. Test removal of non-existent items
3. Test iteration order after mixed operations
4. Test with empty set
5. Test with single element
6. Test with all same elements
7. Test with negative numbers
8. Test with large lists (performance)

**Deliverable:** List of all bugs found, with the PBT test that caught each one and the fix.

---

## Submission Checklist

- [ ] All buggy code fixed with passing tests
- [ ] Properties derived from specifications (5+ per spec)
- [ ] Stateful stack test passing with statistics
- [ ] AI property discovery report complete
- [ ] Grand challenge bugs found and documented
- [ ] All tests pass with `pytest -v --hypothesis-show-statistics`
- [ ] Learning journal entry completed

---

## Learning Journal Entry

```markdown
## Lab 2: Property-Based Testing

### Bugs Found
- [List each bug and how you found it]

### Properties Discovered
- [List the most interesting properties]

### AI Property Discovery
- [How useful was the AI? What did it miss?]

### Stateful Testing
- [What surprised you about state machine testing?]

### Confidence Level (1-10):
```

---

## Bonus: Mutation Testing

Install and run mutation testing to see how strong your tests really are:

```bash
pip install mutmut
mutmut run --paths-to-mutate=lab2_bugs.py
mutmut results
```

Can you achieve 100% mutation score? This means your tests catch ALL possible bugs that mutation testing can introduce!
