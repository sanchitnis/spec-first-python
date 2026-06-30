# Chapter 5: Property-Based Testing with Hypothesis

## Why This Chapter Matters

> **"Testing can only prove the presence of bugs, not their absence. Property-based testing can prove the absence of bugs... across all possible inputs."** — Adapted from Dijkstra

Unit tests check specific examples. Property-based tests check **universal properties**. This chapter transforms your testing practice from "I tested 5 cases" to "I tested millions of cases, automatically generated, with minimal bugs found."

---

## 5.1 The Hypothesis Philosophy

### Example-Based Testing vs. Property-Based Testing

```python
# Example-based testing (what you probably know)
def test_sort_example():
    assert sorted([3, 1, 2]) == [1, 2, 3]
    assert sorted([5]) == [5]
    assert sorted([]) == []

# Property-based testing (what you're learning)
from hypothesis import given, strategies as st

@given(st.lists(st.integers()))
def test_sort_idempotent(input_list):
    """Property: Sorting a sorted list is a no-op."""
    assert sorted(sorted(input_list)) == sorted(input_list)

@given(st.lists(st.integers()))
def test_sort_preserves_length(input_list):
    """Property: Sorting preserves length."""
    assert len(sorted(input_list)) == len(input_list)

@given(st.lists(st.integers()))
def test_sort_min_first(input_list):
    """Property: First element is minimum (if non-empty)."""
    if input_list:
        result = sorted(input_list)
        assert result[0] == min(input_list)
```

**Key Differences:**
- Example-based: You think of test cases → might miss edge cases
- Property-based: You define properties → Hypothesis generates thousands of test cases automatically, including edge cases you never thought of

---

## 5.2 Core Hypothesis Strategies

### Basic Strategies

```python
from hypothesis import given, strategies as st

# Integers with constraints
@given(st.integers(min_value=0, max_value=100))
def test_positive_integers(x):
    assert x >= 0
    assert x <= 100

# Floats (be careful with NaN and infinity!)
@given(st.floats(allow_nan=False, allow_infinity=False))
def test_finite_floats(x):
    assert not (x != x)  # Not NaN

# Strings
@given(st.text(min_size=1, max_size=100))
def test_non_empty_strings(s):
    assert len(s) > 0

# Lists with constraints
@given(st.lists(st.integers(), min_size=1, max_size=50))
def test_non_empty_lists(lst):
    assert len(lst) > 0

# Composite strategies ( tuples, dicts )
@given(st.tuples(st.integers(), st.text()))
def test_tuples(t):
    assert isinstance(t[0], int)
    assert isinstance(t[1], str)

@given(st.dictionaries(st.text(), st.integers(), min_size=1))
def test_non_empty_dicts(d):
    assert len(d) > 0
```

### Custom Strategies

```python
from hypothesis import given, strategies as st
from dataclasses import dataclass
from typing import List

@dataclass
class User:
    name: str
    age: int
    email: str

# Define a custom strategy for generating valid users
user_strategy = st.builds(
    User,
    name=st.text(min_size=1, max_size=50),
    age=st.integers(min_value=0, max_value=150),
    email=st.emails()  # Built-in email strategy
)

@given(user_strategy)
def test_user_properties(user):
    assert len(user.name) > 0
    assert 0 <= user.age <= 150
    assert "@" in user.email

# Recursive strategy (e.g., for trees)
tree_strategy = st.deferred(lambda: st.one_of(
    st.integers(),  # Leaf node
    st.tuples(st.just("node"), st.lists(tree_strategy))  # Internal node
))

@given(tree_strategy)
def test_tree_structure(tree):
    # Property: tree is either an int or a tuple
    assert isinstance(tree, int) or (isinstance(tree, tuple) and tree[0] == "node")
```

### Exercise 5.1: Custom Strategy Design

Design custom Hypothesis strategies for these domains:

```python
from hypothesis import strategies as st
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class Event:
    title: str
    start_time: datetime
    duration_minutes: int

# TODO: Create a strategy that generates valid Events:
# - title: 1-100 characters, non-empty
# - start_time: within last 5 years to next 5 years
# - duration_minutes: 1-480 (8 hours max)
# - No overlapping events (when generating lists)

event_strategy = st.builds(
    Event,
    # TODO: fill in
)

# TODO: Create a strategy for non-overlapping event lists
def non_overlapping_events():
    pass
```

---

## 5.3 Specification-Derived Properties

### Deriving Properties from Specifications

Given a specification, we can derive testable properties:

```python
# Specification: "reverse(reverse(x)) == x"
@given(st.lists(st.integers()))
def test_reverse_involution(x):
    assert list(reversed(list(reversed(x)))) == x

# Specification: "filter(p, filter(p, x)) == filter(p, x)" (idempotence)
@given(st.lists(st.integers()), st.functions(st.booleans(), st.integers()))
def test_filter_idempotent(x, p):
    result1 = [item for item in x if p(item)]
    result2 = [item for item in result1 if p(item)]
    assert result1 == result2

# Specification: "map(f, map(g, x)) == map(f∘g, x)" (functor composition)
@given(st.lists(st.integers()))
def test_map_composition(x):
    f = lambda n: n * 2
    g = lambda n: n + 1
    result1 = [f(g(item)) for item in x]
    result2 = [f(item) for item in [g(item) for item in x]]
    assert result1 == result2

# Specification: "len(groupby(key, x)) <= len(x)" (monotonicity)
from itertools import groupby
@given(st.lists(st.integers()))
def test_groupby_length(x):
    groups = [key for key, _ in groupby(sorted(x))]
    assert len(groups) <= len(x)
```

### Exercise 5.2: Property Discovery

For each function below, write at least 3 properties that SHOULD hold, then test them with Hypothesis:

```python
from typing import List, TypeVar

T = TypeVar('T')

def deduplicate_preserve_order(items: List[T]) -> List[T]:
    """Remove duplicates while preserving first occurrence order."""
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

def interleave(list1: List[T], list2: List[T]) -> List[T]:
    """Interleave two lists. If one is longer, append remainder."""
    result = []
    for i in range(max(len(list1), len(list2))):
        if i < len(list1):
            result.append(list1[i])
        if i < len(list2):
            result.append(list2[i])
    return result

def sliding_window(items: List[T], size: int) -> List[List[T]]:
    """Return all contiguous windows of given size."""
    if size <= 0 or size > len(items):
        return []
    return [items[i:i+size] for i in range(len(items) - size + 1)]
```

**Requirements:**
1. Write 3+ properties per function
2. Use appropriate Hypothesis strategies
3. Run tests and document any failures (these are bugs!)
4. Fix the bugs and verify properties hold

---

## 5.4 Stateful Testing

Hypothesis can test stateful systems (objects with mutable state) by generating sequences of operations.

```python
from hypothesis import given, note, settings
from hypothesis.stateful import RuleBasedStateMachine, rule, invariant, precondition
from typing import List

class StackMachine(RuleBasedStateMachine):
    """
    State machine specification for a Stack.
    
    Invariant: len(stack) >= 0 (always true)
    Invariant: after pop(), len decreases by 1 (if not empty)
    """
    
    def __init__(self):
        super().__init__()
        self.stack: List[int] = []
    
    @rule(item=st.integers())
    def push(self, item):
        self.stack.append(item)
    
    @rule()
    @precondition(lambda self: len(self.stack) > 0)
    def pop(self):
        expected = self.stack[-1]
        result = self.stack.pop()
        assert result == expected
    
    @rule()
    @precondition(lambda self: len(self.stack) > 0)
    def peek(self):
        assert self.stack[-1] == self.stack[-1]  # Trivial, but shows state access
    
    @invariant()
    def length_non_negative(self):
        assert len(self.stack) >= 0
    
    @invariant()
    def elements_are_integers(self):
        assert all(isinstance(x, int) for x in self.stack)

# Run the state machine test
TestStack = StackMachine.TestCase
```

### Exercise 5.3: Stateful Bank Account

Implement a stateful test for a `BankAccount` class:

```python
from hypothesis.stateful import RuleBasedStateMachine, rule, invariant, precondition
from hypothesis import strategies as st

class BankAccountMachine(RuleBasedStateMachine):
    """
    State machine for a bank account with:
    - deposit(amount): add to balance
    - withdraw(amount): subtract from balance (if sufficient funds)
    - transfer(other, amount): transfer to another account
    - get_balance(): return current balance
    
    Invariants:
    - balance >= 0 (no overdraft allowed)
    - total money in all accounts is conserved
    """
    
    def __init__(self):
        super().__init__()
        # TODO: Initialize accounts
        pass
    
    # TODO: Implement rules and invariants
    pass

TestBankAccount = BankAccountMachine.TestCase
```

**Requirements:**
1. Model at least 2 interacting accounts
2. Include deposit, withdraw, and transfer operations
3. Verify balance >= 0 invariant
4. Verify money conservation (total doesn't change except for deposits)
5. Run with max_examples=1000 and verify no failures

---

## 5.5 AI-Assisted Property Generation

AI can suggest properties you might not think of. This is one of the most powerful AI applications in formal methods.

### Prompt Template for Property Discovery

```
I have a Python function with this specification:

```python
[function specification here]
```

Please suggest 5-10 properties that I can test with Hypothesis property-based testing.

For each property, provide:
1. The property in plain English
2. The corresponding Python assertion
3. The Hypothesis strategy to generate inputs
4. Why this property is important (what bug would it catch?)

Focus on:
- Algebraic properties (idempotence, commutativity, associativity)
- Structural properties (length preservation, ordering)
- Domain-specific properties (financial accuracy, data consistency)
- Edge cases (empty inputs, single elements, extreme values)
```

### Example: AI-Suggested Properties for a Database Query Builder

```python
from dataclasses import dataclass
from typing import Optional, List

@dataclass
class Query:
    table: str
    columns: List[str]
    where: Optional[str] = None
    order_by: Optional[str] = None
    limit: Optional[int] = None

class QueryBuilder:
    def __init__(self, table: str):
        self._query = Query(table=table, columns=["*"])
    
    def select(self, *columns: str) -> 'QueryBuilder':
        self._query.columns = list(columns)
        return self
    
    def where(self, condition: str) -> 'QueryBuilder':
        self._query.where = condition
        return self
    
    def order_by(self, column: str) -> 'QueryBuilder':
        self._query.order_by = column
        return self
    
    def limit(self, n: int) -> 'QueryBuilder':
        self._query.limit = n
        return self
    
    def build(self) -> str:
        # TODO: Build SQL string
        pass
```

**AI-Suggested Properties:**
1. **Builder immutability:** Calling builder methods doesn't change already-built queries
2. **Idempotence:** `select(a).select(a)` is equivalent to `select(a)`
3. **Order independence:** `select(a).where(b)` == `where(b).select(a)` (for valid cases)
4. **Limit bounds:** `limit(n)` with n < 0 should raise ValueError or be clamped
5. **SQL injection safety:** Special characters in `where` should not break syntax

### Exercise 5.4: AI Property Discovery Challenge

Use the AI TA to discover properties for a `Trie` (prefix tree) data structure. Then:

1. **Your attempt:** Write 5 properties you think should hold
2. **AI suggestions:** Use the prompt template to get AI properties
3. **Comparison:** Compare your properties with AI's. What did you miss?
4. **Implementation:** Implement the Trie and test with all properties
5. **Bug hunting:** If any property fails, the AI found a bug you didn't know about!

---

## 5.6 Learning Journal

```markdown
## Chapter 5: Property-Based Testing

### Key Concepts
- [List concepts]

### Hypothesis Experience
- [What bugs did PBT find that you didn't expect?]
- [How many test cases ran?]
- [What was the smallest counterexample found?]

### Property Thinking
- [How did you identify properties?]
- [What makes a good property?]

### AI Property Discovery
- [How useful was the AI for property suggestions?]
- [Did the AI suggest properties you implemented?]
- [Were any AI properties wrong?]

### Confidence Level (1-10)
```

---

## Chapter Summary

- **Hypothesis generates** thousands of test cases from properties, not examples
- **Custom strategies** model complex domains with realistic constraints
- **Properties derive from specifications** (post-conditions, invariants)
- **Stateful testing** verifies object behavior through sequences of operations
- **AI can suggest properties** humans might miss, especially algebraic ones
- **PBT catches edge cases** that manual testing never would find

### Key Takeaway
> **"A good property test is worth a thousand example tests."**

---

## Further Reading

1. Hypothesis Documentation: https://hypothesis.readthedocs.io/
2. "Property-Based Testing with PropEr, Erlang, and Elixir" by Fred Hébert
3. "QuickCheck: A Lightweight Tool for Random Testing of Haskell Programs" (original paper)
4. Hypothesis stateful testing examples: https://github.com/HypothesisWorks/hypothesis/tree/master/hypothesis-python/examples

---

## End-of-Chapter Exercises

### Exercise 5.5: PBT for a Real Library (Individual)

Choose a standard library module (e.g., `json`, `csv`, `urllib.parse`) and write a comprehensive PBT suite for it. Find at least one edge case behavior you didn't expect.

### Exercise 5.6: Stateful Testing Competition (Team)

In teams of 3, each member implements a different data structure:
- Member A: B-Tree with insertion and deletion
- Member B: LRU Cache with get, put, and evict
- Member C: Priority Queue with decrease-key

Write Hypothesis stateful tests for each. The team with the most bugs found (in their own code!) wins.

### Exercise 5.7: AI Property Benchmark (Individual)

Use the AI TA to generate properties for a `Graph` class. Then:
1. Implement the Graph class
2. Test all AI-generated properties
3. Score the AI: How many properties were correct? How many caught real bugs?
4. Write a brief report on AI property generation quality

---

*Next Chapter: Software Architecture - Specifying Systems, Not Just Functions*
