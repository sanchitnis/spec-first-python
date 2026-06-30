# Chapter 2: Propositions, Predicates, and Python

## Why This Chapter Matters

> **"Logic is the calculus of computer science."** — Manna and Waldinger

Every program is a logical statement. Every bug is a logical contradiction. Every specification is a logical formula. If you want to reason about software, you must master the language of logic.

This chapter bridges classical logic with practical Python programming. You will learn to:
- Express program properties as logical formulas
- Use Python as a logical reasoning tool
- Employ automated theorem provers (Z3) to verify properties
- Let AI assist in discovering logical patterns and invariants

---

## 2.1 Propositional Logic in Python

### The Building Blocks

Propositional logic deals with **propositions** (statements that are true or false) and logical connectives.

| Connective | Symbol | Python Operator | Meaning |
|------------|--------|-----------------|---------|
| AND | ∧ | `and` | Both true |
| OR | ∨ | `or` | At least one true |
| NOT | ¬ | `not` | Opposite truth value |
| IMPLIES | → | `not p or q` | If p then q |
| IFF | ↔ | `==` | Equivalent |

### Truth Tables with Python

```python
def truth_table():
    """Generate truth tables for common operators."""
    print("P     Q     P∧Q   P∨Q   ¬P    P→Q")
    print("-" * 40)
    for p in [True, False]:
        for q in [True, False]:
            and_result = p and q
            or_result = p or q
            not_p = not p
            implies = (not p) or q
            print(f"{p:<5} {q:<5} {and_result:<5} {or_result:<5} {not_p:<5} {implies:<5}")

truth_table()
```

### Exercise 2.1: Truth Table Generator

Write a Python function that generates a truth table for any given propositional formula with up to 3 variables. The function should:
1. Accept a lambda representing the formula
2. Generate all combinations of truth values
3. Evaluate the formula for each combination
4. Return the complete truth table

```python
def generate_truth_table(formula, variables):
    """
    Generate a truth table for a propositional formula.
    
    Args:
        formula: A lambda taking boolean arguments
        variables: List of variable names (strings)
    
    Returns:
        List of dicts, each representing one row of the truth table
    
    Example:
        >>> generate_truth_table(lambda p, q: p and q, ['p', 'q'])
        [{'p': True, 'q': True, 'result': True},
         {'p': True, 'q': False, 'result': False},
         ...]
    """
    pass  # Implement this
```

---

## 2.2 Predicate Logic: Quantifiers in Python

### Universal and Existential Quantifiers

| Quantifier | Symbol | Meaning | Python Pattern |
|------------|--------|---------|---------------|
| Universal | ∀ | "For all..." | `all(...)` |
| Existential | ∃ | "There exists..." | `any(...)` |

```python
# "For all x in arr, x > 0"
# ∀x ∈ arr : x > 0
arr = [1, 2, 3, 4, 5]
assert all(x > 0 for x in arr), "Not all elements are positive"

# "There exists x in arr such that x is even"
# ∃x ∈ arr : x % 2 == 0
assert any(x % 2 == 0 for x in arr), "No even element found"

# "For all x in arr, if x > 10 then x < 100"
# ∀x ∈ arr : x > 10 → x < 100
assert all((x <= 10) or (x < 100) for x in arr)
```

### Nested Quantifiers

```python
def is_sorted(arr):
    """
    Specification: ∀i, j : 0 ≤ i < j < len(arr) → arr[i] ≤ arr[j]
    
    Optimized: ∀i : 0 ≤ i < len(arr)-1 → arr[i] ≤ arr[i+1]
    """
    return all(arr[i] <= arr[i+1] for i in range(len(arr) - 1))

# Test
assert is_sorted([1, 2, 3, 4, 5])
assert not is_sorted([1, 3, 2, 4, 5])
```

### Exercise 2.2: Quantifier Specifications

Express each of the following specifications as Python assertions using `all()` and `any()`:

a) "All elements in a matrix are non-negative"
b) "There exists a row in the matrix that sums to zero"
c) "For every row in the matrix, the row is sorted"
d) "There exists a pair of elements (i, j) such that arr[i] + arr[j] == target"
e) "For all elements x, if x is even then x is divisible by 4"

```python
def verify_spec_a(matrix):
    """All elements are non-negative"""
    pass

def verify_spec_b(matrix):
    """There exists a row summing to zero"""
    pass

def verify_spec_c(matrix):
    """Every row is sorted"""
    pass

def verify_spec_d(arr, target):
    """There exists a pair summing to target"""
    pass

def verify_spec_e(arr):
    """All even elements are divisible by 4"""
    pass
```

---

## 2.3 Z3: The Automated Theorem Prover

Z3 is a powerful SMT (Satisfiability Modulo Theories) solver from Microsoft Research. It can automatically verify logical formulas.

### Installation and Basic Usage

```bash
pip install z3-solver
```

```python
from z3 import Solver, Int, Bool, And, Or, Not, Implies, sat

# Create a solver
s = Solver()

# Define variables
x = Int('x')
y = Int('y')

# Add constraints: x > 0 and y > 0 and x + y < 10
s.add(x > 0)
s.add(y > 0)
s.add(x + y < 10)

# Check if satisfiable
if s.check() == sat:
    model = s.model()
    print(f"Solution found: x = {model[x]}, y = {model[y]}")
else:
    print("No solution exists")
```

### Verifying Program Properties with Z3

```python
from z3 import Solver, Int, ForAll, Implies, And, sat

def verify_array_property():
    """
    Verify: For all arrays of length 3 with all positive elements,
    the sum is also positive.
    """
    # Create symbolic variables for array elements
    a0 = Int('a0')
    a1 = Int('a1')
    a2 = Int('a2')
    
    # Pre-condition: all elements are positive
    pre = And(a0 > 0, a1 > 0, a2 > 0)
    
    # Post-condition: sum is positive
    post = a0 + a1 + a2 > 0
    
    # Property to verify: pre → post
    property_to_check = Implies(pre, post)
    
    # Check if there exists a counterexample (negation is satisfiable)
    s = Solver()
    s.add(Not(property_to_check))
    
    if s.check() == sat:
        print("Counterexample found! Property does NOT hold.")
        print(s.model())
    else:
        print("No counterexample. Property VERIFIED.")

verify_array_property()
```

### Exercise 2.3: Z3 Verification Challenge

Use Z3 to verify or find counterexamples for the following properties:

```python
from z3 import *

def verify_property_1():
    """
    Property: For all integers x, y: if x > y then x - y > 0
    """
    pass

def verify_property_2():
    """
    Property: For all integers x, y, z: 
    if x > y and y > z then x > z (transitivity)
    """
    pass

def verify_property_3():
    """
    Property: For all integers x, y: 
    (x + y)^2 == x^2 + 2*x*y + y^2
    """
    pass

def verify_property_4():
    """
    Property: For all integers x, y:
    if x > 0 and y > 0 then x * y > 0
    """
    pass

def verify_property_5():
    """
    Property: For all integers x:
    if x > 0 then x * x > x
    (Find the counterexample!)
    """
    pass
```

---

## 2.4 Proving Algorithm Correctness

### Example: Linear Search Correctness Proof

```python
from z3 import Solver, Int, ForAll, And, Or, Implies, If, sat

def prove_linear_search_correct():
    """
    Prove that linear search correctly finds an element.
    
    Specification:
    - If element exists in array, return its index
    - If element doesn't exist, return -1
    """
    # We use a simplified version with fixed array size 3
    arr = [Int(f'arr_{i}') for i in range(3)]
    target = Int('target')
    
    # Linear search implementation (unrolled for small array)
    result = If(arr[0] == target, 0,
                If(arr[1] == target, 1,
                   If(arr[2] == target, 2, -1)))
    
    # Property 1: If target is in array, result is a valid index
    # ∀i: arr[i] == target → result == i (for some i)
    # (Simplified: if arr[0] == target, result should be 0)
    prop1 = Implies(arr[0] == target, result == 0)
    
    # Property 2: If target is not in array, result is -1
    prop2 = Implies(And(arr[0] != target, arr[1] != target, arr[2] != target), 
                     result == -1)
    
    # Verify properties
    s = Solver()
    s.add(Not(And(prop1, prop2)))
    
    if s.check() == sat:
        print("Counterexample found!")
    else:
        print("Linear search correctness VERIFIED for arrays of size 3")

prove_linear_search_correct()
```

### Exercise 2.4: Prove Binary Search Correct

Write a Z3-based proof that binary search on a sorted array of size 4 is correct.

```python
def prove_binary_search_correct():
    """
    Prove binary search correctness for sorted array of size 4.
    
    Specification:
    - Pre: arr is sorted (arr[0] <= arr[1] <= arr[2] <= arr[3])
    - Post: If target in arr, return its index; else return -1
    """
    pass
```

**Hint:** Model the binary search algorithm as a series of If-Then-Else expressions, then verify the specification.

---

## 2.5 AI-Assisted Invariant Discovery

One of the most powerful uses of AI in formal methods is invariant discovery. AI can suggest loop invariants that humans might miss.

### Using the Local AI TA for Invariant Discovery

**Prompt Template:**
```
I have the following Python function. Help me find loop invariants that would be useful for proving correctness.

```python
def sum_array(arr):
    total = 0
    i = 0
    while i < len(arr):
        total += arr[i]
        i += 1
    return total
```

Please suggest:
1. Loop invariants (conditions that hold before/after each iteration)
2. Variants (expressions that decrease/increase with each iteration)
3. Post-conditions that could be proved using these invariants
4. Any edge cases I should consider
```

**Expected AI Response:**
```
For the function `sum_array(arr)`, here are useful invariants:

**Loop Invariants:**
1. `0 <= i <= len(arr)` - The index stays within bounds
2. `total == sum(arr[0:i])` - Total always equals the sum of elements processed so far

**Variant:**
- `len(arr) - i` - Decreases by 1 each iteration, ensures termination

**Post-condition:**
- `total == sum(arr)` - If the loop terminates, total equals the sum of all elements

**Edge Cases:**
- Empty array: returns 0 (correct)
- Single element: returns that element
- All negative: works correctly
- Very large array: potential overflow (not handled in Python due to arbitrary precision)
```

### Exercise 2.5: AI-Invariant Collaboration

For each of the following functions, first try to identify invariants yourself, then use the AI TA to suggest invariants. Compare your findings:

```python
def factorial(n):
    """Compute n! for n >= 0"""
    result = 1
    i = 1
    while i <= n:
        result *= i
        i += 1
    return result

def reverse_list(arr):
    """Reverse a list in-place"""
    left = 0
    right = len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    return arr

def is_prime(n):
    """Check if n is prime"""
    if n < 2:
        return False
    i = 2
    while i * i <= n:
        if n % i == 0:
            return False
        i += 1
    return True
```

For each function:
1. Write your own invariants before consulting AI
2. Use the AI TA with the prompt template
3. Compare AI suggestions with your own
4. Verify the invariants using Z3 or manual proof
5. Write a reflection on the AI's usefulness and limitations

---

## 2.6 Learning Journal

```markdown
## Chapter 2: Propositions, Predicates, and Python

### Key Concepts
- [List 3-5 concepts]

### Z3 Experience
- [What was surprising about automated proving?]
- [What limitations did you encounter?]

### AI Invariant Discovery
- [How useful was the AI for finding invariants?]
- [When was it wrong?]

### Connection to Software Engineering
- [How does logic apply to your past programming experience?]

### Confidence Level (1-10)
```

---

## Chapter Summary

- **Propositional logic** forms the basis of program reasoning (AND, OR, NOT, IMPLIES)
- **Predicate logic** with quantifiers (∀, ∃) lets us specify properties over data structures
- **Python's `all()` and `any()`** are direct implementations of universal and existential quantifiers
- **Z3** provides automated theorem proving for verifying program properties
- **Loop invariants** are conditions that hold before and after each iteration
- **AI can assist** in discovering invariants, but human verification is essential

### Key Takeaway
> **"Every program property is a logical formula. Learning to express it formally is the first step toward verifying it automatically."**

---

## Further Reading

1. "How to Prove It" by Daniel Velleman - Chapters 2-3 (Quantifiers)
2. "The Calculus of Computation" by Bradley and Manna - Z3 and SMT
3. Z3 Python API Tutorial: https://ericpony.github.io/z3py-tutorial/guide-examples.htm
4. "Software Foundations" by Benjamin Pierce (Volume 1: Logical Foundations)

---

## End-of-Chapter Exercises

### Exercise 2.6: Complete Specification with Z3 (Individual)

Write a fully specified `insertion_sort` function and use Z3 to verify its correctness for arrays of size 3.

```python
def insertion_sort(arr):
    """
    Specification:
    - Pre: arr is a list of comparable elements
    - Post: arr is sorted in non-decreasing order
    - Post: arr is a permutation of the input (same elements)
    """
    pass
```

**Requirements:**
1. Write the complete specification
2. Implement the function
3. Use Z3 to verify: (a) sortedness, (b) permutation property
4. Document your Z3 model and results

### Exercise 2.7: Team Invariant Challenge (Team)

In teams of 3, write a specification for a `sorted_set` data structure that maintains elements in sorted order with no duplicates. Each team member must:
1. Write invariants for one operation (insert, delete, contains)
2. Verify with Z3 that the invariant holds
3. Present to the team
4. Combine into a complete specification document

### Exercise 2.8: AI-Verified Specification (Individual)

Use the AI TA to generate specifications for a `graph` class with:
- `add_node(node)`
- `add_edge(node1, node2)`
- `has_path(node1, node2)`
- `is_connected()`

Then:
1. Verify the AI's specifications using Z3
2. Find at least 2 cases where the AI was wrong
3. Write corrected specifications
4. Implement the class with contracts

---

*Next Chapter: Types as Specifications - Static Guarantees in Dynamic Python*
