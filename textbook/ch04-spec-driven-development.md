# Chapter 4: Spec-Driven Development

## Why This Chapter Matters

> **"TDD asks you to write tests before code. SDD asks you to write specifications before tests."**

Test-Driven Development (TDD) revolutionized software engineering by putting tests first. Spec-Driven Development (SDD) goes one step further: **specifications before tests**. This chapter teaches you the complete SDD workflow, where formal or semi-formal specifications guide every step of development.

**The SDD Promise:** Write specifications that are so clear and complete that AI can generate code from them, and tests can verify against them.

---

## 4.1 The SDD Workflow

### The Five Phases of SDD

```
┌─────────────────────────────────────────────────────────┐
│  Phase 1: SPECIFY                                       │
│  Write formal/semi-formal specification                  │
│  ↓                                                      │
│  Phase 2: VERIFY SPEC                                   │
│  Check specification completeness, consistency          │
│  ↓                                                      │
│  Phase 3: GENERATE TESTS                                │
│  Derive tests from specification (manually or AI)       │
│  ↓                                                      │
│  Phase 4: IMPLEMENT                                     │
│  Write code guided by specification (with AI assistance)│
│  ↓                                                      │
│  Phase 5: VALIDATE                                      │
│  Run tests, verify against specification                │
│  ↓                                                      │
│  Phase 6: REFLECT                                       │
│  Document lessons learned, update specification        │
└─────────────────────────────────────────────────────────┘
```

### Example: SDD for a Sorting Function

```python
# ============= PHASE 1: SPECIFY =============
from typing import List, TypeVar

T = TypeVar('T', int, float, str)

def sort_list(items: List[T]) -> List[T]:
    """
    Specification (SDD Phase 1):
    
    PURPOSE: Sort a list in non-decreasing order.
    
    PRE-CONDITIONS:
    - items is a list of comparable elements
    - All elements are of the same type (enforced by type system)
    
    POST-CONDITIONS:
    - result is sorted: ∀i, j: 0 <= i < j < len(result) => result[i] <= result[j]
    - result is a permutation of items: ∀x: count(x, result) == count(x, items)
    - len(result) == len(items)
    
    EXAMPLES:
    >>> sort_list([3, 1, 2])
    [1, 2, 3]
    >>> sort_list([5, 5, 5])
    [5, 5, 5]
    >>> sort_list([])
    []
    
    AI GENERATION PROMPT:
    "Implement a stable sort function that satisfies: sortedness, permutation, length preservation"
    """
    pass

# ============= PHASE 2: VERIFY SPEC =============
# Review: Are the pre-conditions complete? 
# - What about empty list? ✓ (covered in examples)
# - What about single element? Need to add.
# - What about None elements? Pre-condition should specify no None.

# ============= PHASE 3: GENERATE TESTS =============
import pytest
from hypothesis import given, strategies as st

class TestSortListSpecification:
    """Tests derived from the specification."""
    
    # Test from "sortedness" post-condition
    def test_result_is_sorted(self):
        result = sort_list([3, 1, 4, 1, 5, 9])
        assert all(result[i] <= result[i+1] for i in range(len(result)-1))
    
    # Test from "permutation" post-condition
    def test_result_is_permutation(self):
        input_list = [3, 1, 4, 1, 5, 9]
        result = sort_list(input_list)
        assert sorted(input_list) == sorted(result)
        assert len(result) == len(input_list)
    
    # Test from "length preservation" post-condition
    def test_length_preserved(self):
        assert len(sort_list([])) == 0
        assert len(sort_list([1])) == 1
        assert len(sort_list([1, 2, 3])) == 3
    
    # Property-based test: sortedness for ALL lists
    @given(st.lists(st.integers()))
    def test_sortedness_property(self, input_list):
        result = sort_list(input_list)
        assert all(result[i] <= result[i+1] for i in range(len(result)-1))
    
    # Property-based test: permutation for ALL lists
    @given(st.lists(st.integers()))
    def test_permutation_property(self, input_list):
        result = sort_list(input_list)
        assert sorted(input_list) == sorted(result)

# ============= PHASE 4: IMPLEMENT =============
def sort_list(items: List[T]) -> List[T]:
    """Implementation guided by specification."""
    if len(items) <= 1:
        return items.copy()
    
    # Using built-in sort (stable, guaranteed to be correct)
    # In production, we might implement our own for learning
    result = items.copy()
    result.sort()
    return result

# ============= PHASE 5: VALIDATE =============
# Run: pytest test_sort_list.py
# All tests pass => specification is satisfied

# ============= PHASE 6: REFLECT =============
# Lessons learned:
# - The "sortedness" property is the most important
# - Property-based testing caught edge cases I didn't think of
# - The AI suggested an implementation that passed all tests
# - Next time: also specify stability requirement explicitly
```

### Exercise 4.1: SDD Workflow Practice

Apply the complete SDD workflow to implement a `deduplicate` function:

```python
def deduplicate(items: List[T]) -> List[T]:
    """
    SPECIFICATION (you write this):
    
    PURPOSE: Remove duplicates from a list while preserving order.
    
    PRE-CONDITIONS:
    - ???
    
    POST-CONDITIONS:
    - ???
    
    EXAMPLES:
    - ???
    
    AI GENERATION PROMPT:
    - ???
    """
    pass
```

**Requirements:**
1. Complete Phase 1-6 for the deduplicate function
2. Write at least 5 unit tests derived from the specification
3. Write at least 2 property-based tests
4. Use AI to generate an implementation, then verify it against your tests
5. Document your reflection (Phase 6)

---

## 4.2 Specification Patterns

### Pattern 1: The State Machine Specification

```python
from enum import Enum, auto
from typing import Dict, List, Optional
from dataclasses import dataclass

class OrderStatus(Enum):
    PENDING = auto()
    PAID = auto()
    SHIPPED = auto()
    DELIVERED = auto()
    CANCELLED = auto()

# Valid transitions (state machine specification)
VALID_TRANSITIONS: Dict[OrderStatus, List[OrderStatus]] = {
    OrderStatus.PENDING: [OrderStatus.PAID, OrderStatus.CANCELLED],
    OrderStatus.PAID: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    OrderStatus.SHIPPED: [OrderStatus.DELIVERED],
    OrderStatus.DELIVERED: [],  # Terminal state
    OrderStatus.CANCELLED: [],  # Terminal state
}

@dataclass
class Order:
    """
    Specification: An order with state machine semantics.
    
    Invariants:
    - status is always one of the defined states
    - status transitions follow VALID_TRANSITIONS
    - total_amount >= 0
    - items is non-empty when status is not CANCELLED
    """
    order_id: str
    customer_id: str
    items: List[dict]
    total_amount: float
    status: OrderStatus = OrderStatus.PENDING
    
    def transition(self, new_status: OrderStatus) -> None:
        """
        Pre-condition: new_status in VALID_TRANSITIONS[self.status]
        Post-condition: self.status == new_status
        Raises: ValueError if transition is invalid
        """
        if new_status not in VALID_TRANSITIONS[self.status]:
            raise ValueError(
                f"Invalid transition: {self.status.name} -> {new_status.name}"
            )
        self.status = new_status
    
    def add_item(self, item: dict, price: float) -> None:
        """
        Pre-condition: self.status == OrderStatus.PENDING
        Pre-condition: price >= 0
        Post-condition: total_amount increased by price
        Post-condition: items contains new item
        """
        assert self.status == OrderStatus.PENDING, "Can only modify pending orders"
        self.items.append(item)
        self.total_amount += price

# Test the state machine specification
import pytest

class TestOrderStateMachine:
    def test_valid_transitions(self):
        order = Order("ORD-001", "CUST-001", [], 0.0)
        order.transition(OrderStatus.PAID)
        assert order.status == OrderStatus.PAID
        order.transition(OrderStatus.SHIPPED)
        assert order.status == OrderStatus.SHIPPED
        order.transition(OrderStatus.DELIVERED)
        assert order.status == OrderStatus.DELIVERED
    
    def test_invalid_transition(self):
        order = Order("ORD-001", "CUST-001", [], 0.0)
        with pytest.raises(ValueError):
            order.transition(OrderStatus.SHIPPED)  # PENDING -> SHIPPED is invalid
    
    def test_cannot_modify_paid_order(self):
        order = Order("ORD-001", "CUST-001", [{"sku": "A001"}], 10.0)
        order.transition(OrderStatus.PAID)
        with pytest.raises(AssertionError):
            order.add_item({"sku": "A002"}, 5.0)
```

### Exercise 4.2: Design a State Machine

Design a complete state machine specification for a **Traffic Light Controller**:

```python
from enum import Enum, auto
from typing import Dict, List, Tuple

class TrafficLightState(Enum):
    # TODO: Define states
    pass

class TrafficDirection(Enum):
    # TODO: Define directions (NS, EW)
    pass

class TrafficLightController:
    """
    Specification: A traffic light controller for a 4-way intersection.
    
    Invariants:
    - Opposite directions have the same light state
    - Only one direction can be GREEN/YELLOW at a time
    - All lights must be RED before changing direction
    - Minimum green duration: 30 seconds
    - Minimum yellow duration: 5 seconds
    - All-red duration: 2 seconds
    
    State Machine:
    - NS_GREEN -> NS_YELLOW -> ALL_RED -> EW_GREEN -> EW_YELLOW -> ALL_RED -> ...
    """
    pass
```

**Requirements:**
1. Complete state machine specification with all states and transitions
2. All invariants checked as assertions or pre/post-conditions
3. Property-based tests using Hypothesis
4. AI-generated implementation from the specification
5. Verify that AI implementation satisfies all properties

---

## 4.3 Property-Based Testing as Specification Verification

Property-based testing (PBT) is the natural complement to SDD. The specification IS the property, and PBT checks it across all possible inputs.

### Hypothesis Integration with SDD

```python
from hypothesis import given, settings, strategies as st
from typing import Callable, List, TypeVar

T = TypeVar('T')

# Specification: "reverse(reverse(x)) == x" (involution property)
@given(st.lists(st.integers()))
def test_reverse_involution(input_list):
    """
    Specification-derived property:
    Reversing a list twice returns the original list.
    """
    result = list(reversed(list(reversed(input_list))))
    assert result == input_list

# Specification: "sort(sort(x)) == sort(x)" (idempotence)
@given(st.lists(st.integers()))
def test_sort_idempotence(input_list):
    """
    Specification-derived property:
    Sorting a sorted list should not change it.
    """
    sorted_once = sorted(input_list)
    sorted_twice = sorted(sorted_once)
    assert sorted_once == sorted_twice

# Specification: "len(filter(p, x)) <= len(x)" (monotonicity)
@given(st.lists(st.integers()), st.functions(st.booleans(), st.integers()))
def test_filter_length(input_list, predicate):
    """
    Specification-derived property:
    Filtering never increases length.
    """
    result = [x for x in input_list if predicate(x)]
    assert len(result) <= len(input_list)

# Specification: "sum(concat(a, b)) == sum(a) + sum(b)" (homomorphism)
@given(st.lists(st.integers()), st.lists(st.integers()))
def test_concat_homomorphism(list_a, list_b):
    """
    Specification-derived property:
    Sum of concatenation equals sum of sums.
    """
    concatenated = list_a + list_b
    assert sum(concatenated) == sum(list_a) + sum(list_b)
```

### Exercise 4.3: PBT Specification Suite

For a `merge_sorted` function, write a complete PBT specification suite:

```python
def merge_sorted(list1: List[int], list2: List[int]) -> List[int]:
    """
    Specification: Merge two sorted lists into a single sorted list.
    
    PRE: list1 is sorted in non-decreasing order
    PRE: list2 is sorted in non-decreasing order
    POST: result is sorted in non-decreasing order
    POST: result is a permutation of list1 + list2
    POST: len(result) == len(list1) + len(list2)
    """
    pass  # Implement

# Write PBT tests for ALL post-conditions
@given(st.lists(st.integers()), st.lists(st.integers()))
def test_merge_sortedness(list1, list2):
    """TODO: Test that result is sorted"""
    pass

@given(st.lists(st.integers()), st.lists(st.integers()))
def test_merge_permutation(list1, list2):
    """TODO: Test that result is permutation of inputs"""
    pass

# ... more tests
```

**Requirements:**
1. Write at least 5 PBT tests covering all post-conditions
2. Generate tests using Hypothesis with appropriate strategies
3. Run 1000 examples per test
4. Document any bugs found by PBT
5. Ensure all tests pass on your implementation

---

## 4.4 AI-Assisted SDD Workflow

### The AI-SDD Pipeline

```python
# Step 1: Natural language requirement
requirement = """
Create a function that manages a shopping cart with these rules:
- Items can be added with quantity (max 99 per item)
- Items can be removed entirely or quantity reduced
- Total is calculated with tax (8.5%)
- Discount codes apply: "SAVE10" for 10% off, "SAVE20" for 20% off
- Free shipping if total > $50 before discount
"""

# Step 2: AI generates specification
# (Use AI TA with structured prompt)

# Step 3: Human reviews and refines specification
# (Check for missing rules, edge cases)

# Step 4: AI generates test cases from specification
# (Use AI to generate Hypothesis strategies and tests)

# Step 5: AI generates implementation
# (Use AI to generate code from verified specification)

# Step 6: Human verifies and validates
# (Run tests, review code, check for AI hallucinations)
```

### AI Prompt Templates for SDD

**Template 1: Specification Generation**
```
You are a formal methods expert. Given this requirement, write a complete 
specification including:
1. Function signature with type hints
2. Pre-conditions (what must be true before calling)
3. Post-conditions (what must be true after returning)
4. Invariants (what must always be true)
5. Examples (doctest format)
6. Edge cases to consider

Requirement: [your requirement here]

Format the output as a Python docstring with clear sections.
```

**Template 2: Test Generation from Specification**
```
Given this specification, generate a complete test suite using pytest 
and Hypothesis property-based testing:

```python
[specification here]
```

Generate:
1. Unit tests for each example in the docstring
2. Property-based tests for each post-condition
3. Edge case tests (empty inputs, boundary values, invalid inputs)
4. State machine tests if applicable

Output complete, runnable Python test code.
```

**Template 3: Implementation from Specification**
```
Given this specification and test suite, implement the function:

Specification:
```python
[specification]
```

Tests:
```python
[tests]
```

Requirements:
- Pass all tests
- Follow the specification exactly
- Use type hints
- Include docstring with the original specification
- Handle all edge cases specified
- Do NOT use external libraries unless specified

Output the complete implementation.
```

### Exercise 4.4: Complete AI-SDD Project

Complete the full SDD workflow for a **Library Book Reservation System**:

1. **Write natural language requirements** (you create these)
2. **Use AI TA** to generate specification (Template 1)
3. **Review and refine** the AI-generated specification
4. **Use AI TA** to generate tests (Template 2)
5. **Review and refine** the AI-generated tests
6. **Use AI TA** to generate implementation (Template 3)
7. **Review and validate** the AI-generated implementation
8. **Run all tests** and fix any failures
9. **Document** the AI's errors, your corrections, and lessons learned

**Deliverables:**
- Final specification document
- Complete test suite
- Working implementation
- AI collaboration log (what the AI got right/wrong)
- Reflection on the SDD workflow

---

## 4.5 Learning Journal

```markdown
## Chapter 4: Spec-Driven Development

### SDD Workflow Experience
- [Which phase was hardest? Easiest?]
- [How much time did you spend on each phase?]

### AI Collaboration
- [How helpful was the AI for each phase?]
- [What did the AI get wrong?]
- [How did you catch AI errors?]

### PBT Discovery
- [Did PBT find bugs you didn't think of?]
- [How many test cases ran?]

### Specification Quality
- [What makes a good specification?]
- [When is a specification "complete enough"?]

### Confidence Level (1-10)
```

---

## Chapter Summary

- **SDD has 6 phases:** Specify, Verify Spec, Generate Tests, Implement, Validate, Reflect
- **Specifications are contracts** that pre-date code and outlast implementation
- **State machine specifications** define valid behavior sequences
- **Property-based testing** verifies specifications against all possible inputs
- **AI can assist** in every phase, but human judgment ensures correctness
- **The SDD workflow** is the professional practice of specification-first engineering

### Key Takeaway
> **"In SDD, the specification is the product. The code is merely a refinement."**

---

## Further Reading

1. "Specifying Systems" by Leslie Lamport - Complete TLA+ introduction
2. "Property-Based Testing with PropEr, Erlang, and Elixir" by Fred Hébert
3. "Growing Object-Oriented Software, Guided by Tests" by Freeman & Pryce
4. "Test-Driven Development" by Kent Beck (contrast with SDD)

---

## End-of-Chapter Exercises

### Exercise 4.5: SDD for a Real System (Individual)

Apply the complete SDD workflow to implement a **Rate Limiter**:

```python
class RateLimiter:
    """
    Specification: Token bucket rate limiter.
    
    Invariants:
    - 0 <= tokens <= capacity
    - tokens refill at rate tokens_per_second
    - max_burst = capacity
    
    Operations:
    - allow_request(tokens_needed): True if available, False otherwise
    - get_status(): returns current tokens and capacity
    """
    pass
```

**Requirements:**
1. Complete SDD workflow (all 6 phases)
2. Use AI for specification generation, test generation, and implementation
3. Property-based testing with Hypothesis
4. Performance testing (verify O(1) operations)
5. Document AI collaboration log

### Exercise 4.6: Team Specification Review (Team)

In teams of 3, each member implements a different module of a **Task Scheduler**:
- Member A: Priority Queue with deadlines
- Member B: Worker pool with resource allocation
- Member C: Task dependency graph with topological ordering

1. Write individual specifications
2. Exchange specifications for review (find gaps, contradictions)
3. Integrate into a unified system specification
4. Use AI to generate integration tests
5. Implement and verify as a team

### Exercise 4.7: Specification as Documentation (Individual)

Take an open-source Python library (e.g., a small CLI tool) and:
1. Reverse-engineer its specification from the code and tests
2. Write a formal specification document
3. Use AI to generate missing tests from the specification
4. Run tests and report coverage improvement
5. Submit the specification as a PR to the project (if appropriate)

---

*Next Chapter: Property-Based Testing - Finding Bugs You Didn't Think to Look For*
