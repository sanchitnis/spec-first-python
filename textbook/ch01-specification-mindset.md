# Chapter 1: The Specification Mindset

## Why This Chapter Matters

> **"The biggest problem in software engineering is not writing code. It's knowing what code to write."**

Before you write a single line of Python, you must be able to answer these questions with precision:
- What must this function *guarantee* when it returns?
- What can this function *assume* about its inputs?
- What must *always* be true about this data structure, no matter what operations are performed?
- What are the *boundaries* within which this system operates correctly?

These are not afterthoughts. They are the foundation of reliable software. This chapter teaches you to think in specifications.

---

## 1.1 The Specification-First Revolution

### The Old Way: Code First, Think Later

```python
# What does this function do? What does it return?
# What if inputs are invalid? What if the list is empty?
def process(data):
    result = []
    for i in range(len(data)):
        if data[i] > 0:
            result.append(data[i] * 2)
    return result
```

Students often write code like this, then test it, then fix bugs, then test again. This is wasteful.

### The New Way: Specification First, Code as Refinement

```python
from typing import List

def double_positives(numbers: List[int]) -> List[int]:
    """
    Specification:
    - Pre-condition: Input is a list of integers (any values allowed)
    - Post-condition: Returns a list containing only the positive integers
      from the input, each multiplied by 2, in the same relative order
    - Examples:
      >>> double_positives([1, -2, 3, 0])
      [2, 6]
      >>> double_positives([])
      []
    """
    pass  # Implementation comes AFTER specification is clear
```

**Key Insight:** The specification is the contract. The code is the implementation of that contract. When you write the specification first, you:
1. Clarify your own understanding
2. Create a testable target
3. Enable others to verify your work
4. Make AI-assisted code generation meaningful (good input → good output)

---

## 1.2 Types as Lightweight Specifications

Python's type hints (`PEP 484`) are your first formal specification tool. They are lightweight, practical, and immediately useful.

### Basic Type Specifications

```python
from typing import List, Dict, Optional, Tuple, Union

# Specification: This function takes a list of strings and returns
# a dictionary mapping strings to integers
def count_words(words: List[str]) -> Dict[str, int]:
    """
    Pre-condition: None (any list of strings is valid)
    Post-condition: Returns a dictionary where each key is a unique
    word from the input, and each value is the count of occurrences.
    """
    pass

# Specification: This function may return a string or None
def find_user(user_id: int) -> Optional[str]:
    """
    Pre-condition: user_id >= 0
    Post-condition: Returns the username if found, None otherwise
    """
    pass

# Specification: This function accepts either a string or a list of strings
def process_input(data: Union[str, List[str]]) -> str:
    """
    Pre-condition: data is non-empty
    Post-condition: Returns a concatenated string representation
    """
    pass
```

### Exercise 1.1: Write Specifications Before Code

For each of the following functions, write the complete specification (docstring with pre/post-conditions) BEFORE looking at the implementation.

```python
# Exercise 1.1a: Write the specification
def merge_sorted_lists(list1, list2):
    """
    YOUR SPECIFICATION HERE
    """
    pass

# Exercise 1.1b: Write the specification
def safe_divide(a, b):
    """
    YOUR SPECIFICATION HERE
    """
    pass

# Exercise 1.1c: Write the specification
def find_duplicates(items):
    """
    YOUR SPECIFICATION HERE
    """
    pass
```

**After writing your specifications, compare with a partner. Did you catch all edge cases?**

---

## 1.3 Pre-conditions and Post-conditions

Pre-conditions and post-conditions are the fundamental building blocks of formal specification.

### Definitions

- **Pre-condition:** What must be true *before* the function executes. The caller's responsibility.
- **Post-condition:** What will be true *after* the function executes (assuming pre-condition held). The function's responsibility.

### Python Implementation with `deal`

The `deal` library allows you to write executable specifications:

```python
# Install: pip install deal
import deal

@deal.pre(lambda x: x >= 0, message="Input must be non-negative")
@deal.post(lambda result: result >= 0, message="Result must be non-negative")
@deal.ensure(lambda x, result: result * result <= x < (result + 1) * (result + 1))
def integer_sqrt(x: int) -> int:
    """
    Returns the integer square root of x (floor of sqrt).
    
    Specification:
    - Pre: x >= 0
    - Post: result >= 0 and result^2 <= x < (result+1)^2
    """
    if x < 2:
        return x
    # Newton's method for integer square root
    guess = x // 2
    while guess * guess > x:
        guess = (guess + x // guess) // 2
    return guess

# Test the specification
try:
    integer_sqrt(-1)  # Should raise PreContractError
except deal.PreContractError as e:
    print(f"Contract violated: {e}")

# Verify the specification
assert integer_sqrt(16) == 4
assert integer_sqrt(15) == 3
assert integer_sqrt(0) == 0
```

### Exercise 1.2: Specify and Verify

Implement the following function with complete `deal` contracts:

```python
import deal

@deal.pre(lambda: True)  # Replace with actual pre-condition
@deal.post(lambda result: True)  # Replace with actual post-condition
def binary_search(arr, target):
    """
    Find the index of target in sorted array arr.
    
    Specification:
    - Pre: ???
    - Post: ???
    """
    pass
```

**Requirements:**
1. Pre-condition must specify that arr is sorted
2. Post-condition must specify: if target in arr, return its index; else return -1
3. Use `deal` to enforce these contracts
4. Write at least 5 test cases that verify the specification

---

## 1.4 Invariants: The Silent Guardians

An **invariant** is a condition that remains true before and after every operation on a data structure.

### Example: Stack Invariant

```python
class VerifiedStack:
    """
    A stack with a size invariant.
    
    Invariant: 0 <= len(self._items) <= self._max_size
    """
    
    def __init__(self, max_size: int = 100):
        self._items = []
        self._max_size = max_size
    
    @property
    def _invariant(self) -> bool:
        """The invariant that must always hold."""
        return 0 <= len(self._items) <= self._max_size
    
    def push(self, item: any) -> None:
        """
        Pre: len(self._items) < self._max_size
        Post: len(self._items) == len(old._items) + 1
        """
        assert self._invariant, "Invariant violated before push"
        assert len(self._items) < self._max_size, "Pre-condition violated: stack full"
        
        self._items.append(item)
        
        assert self._invariant, "Invariant violated after push"
    
    def pop(self) -> any:
        """
        Pre: len(self._items) > 0
        Post: len(self._items) == len(old._items) - 1
        """
        assert self._invariant, "Invariant violated before pop"
        assert len(self._items) > 0, "Pre-condition violated: stack empty"
        
        item = self._items.pop()
        
        assert self._invariant, "Invariant violated after pop"
        return item
```

### Exercise 1.3: Design a Queue with Invariants

Implement a `VerifiedQueue` class with the following specification:

```python
class VerifiedQueue:
    """
    A bounded queue with full contract specification.
    
    Invariants:
    1. 0 <= len(self._items) <= self._max_size
    2. If not empty, front points to the oldest element
    3. If not empty, back points to the newest element
    
    Operations:
    - enqueue(item): Add item to back (pre: not full)
    - dequeue(): Remove and return front item (pre: not empty)
    - peek(): Return front item without removing (pre: not empty)
    - is_empty(): Return whether queue is empty
    - is_full(): Return whether queue is full
    - size(): Return current number of elements
    """
    pass
```

**Requirements:**
1. All pre-conditions and post-conditions explicitly checked
2. Invariant checked before and after every operation
3. Use Python assertions or `deal` decorators
4. Include test cases that verify all operations maintain the invariant

---

## 1.5 From Informal to Formal: The Specification Spectrum

Specifications exist on a spectrum from informal to formal:

| Level | Formality | Example | Use Case |
|-------|-----------|---------|----------|
| 1 | Natural Language | "This function sorts a list" | Initial understanding |
| 2 | Docstring with Examples | `>>> sort([3,1,2]) == [1,2,3]` | API documentation |
| 3 | Type Signatures | `def sort(l: List[int]) -> List[int]` | Static checking |
| 4 | Contracts | `@deal.pre(lambda x: x > 0)` | Runtime verification |
| 5 | Mathematical | `∀x ∈ arr, result[i] ≤ result[i+1]` | Formal verification |
| 6 | Tool-Verified | TLA+, Coq, Isabelle | Critical systems |

This course focuses on levels 2-4, with exposure to 5-6. This is the **sweet spot** for industry software engineering.

### Exercise 1.4: Specification Spectrum Practice

Take the following natural language requirement and write it at each level of the specification spectrum:

> "A function that takes a list of integers and returns the maximum value."

Write the specification at levels 2, 3, 4, and 5 (mathematical notation).

---

## 1.6 AI Teaching Assistant: Your Specification Partner

### Setting Up the Local AI TA

```bash
# Install Ollama (free, local LLM)
# Visit: https://ollama.com/download

# Pull a lightweight model (suitable for laptops)
ollama pull llama3.1:8b

# Test the model
ollama run llama3.1:8b
```

### Using the AI TA for Specifications

**Prompt Template for Specification Generation:**

```
I am writing a Python function. Help me write a formal specification.

Function description: [describe what it should do]
Expected inputs: [input types and constraints]
Expected outputs: [output types and constraints]
Edge cases: [list edge cases]

Please provide:
1. Pre-conditions
2. Post-conditions
3. A complete docstring with examples
4. Type hints
5. Potential invariants if applicable

Format the output as a complete Python function stub.
```

### Example Session with AI TA

**Student:** 
```
I need a function that validates email addresses. Help me write the specification.
```

**AI TA:**
```
Here's a specification-first approach:

```python
from typing import Optional
import re

def validate_email(email: str) -> Optional[str]:
    """
    Validate and normalize an email address.
    
    Pre-conditions:
    - email is a non-empty string
    - email contains exactly one '@' character
    - The domain part (after '@') contains at least one '.'
    - The local part (before '@') is non-empty
    
    Post-conditions:
    - Returns the normalized (lowercase, stripped) email if valid
    - Returns None if the email is invalid
    - If returned, the email matches the pattern: local@domain.tld
    
    Examples:
    >>> validate_email("User@Example.COM")
    "user@example.com"
    >>> validate_email("invalid")
    None
    >>> validate_email("")
    None
    """
    pass
```

Key points to consider:
1. What about internationalized emails (Unicode)?
2. Should we check if the domain actually exists?
3. What about quoted local parts?
4. How strict should we be for different use cases?

Would you like to refine any of these conditions?
```

**Student:** (implements the function, tests edge cases, reflects on AI suggestions)

### Exercise 1.5: AI-Specification Collaboration

Use the AI TA to generate specifications for 3 functions of your choice. Then:
1. Critically evaluate each specification (what did the AI miss?)
2. Identify edge cases the AI didn't consider
3. Improve the specifications based on your own analysis
4. Write a reflection on the AI's strengths and weaknesses for specification writing

**Important:** The AI is a brainstorming partner, not an authority. You are the engineer who must ensure correctness.

---

## 1.7 Learning Journal Template

After each chapter, complete your learning journal:

```markdown
## Chapter 1: The Specification Mindset

### Key Concepts I Learned
- [List 3-5 key concepts]

### Something That Surprised Me
- [What did you not expect?]

### Something I Found Difficult
- [What was challenging?]

### How I Used the AI TA
- [What prompts worked? What didn't?]

### One Thing I'll Do Differently
- [How will you change your practice?]

### Confidence Level (1-10)
- [Rate yourself]
```

---

## 1.8 Chapter Summary

- **Specifications are contracts** between the caller and the implementation
- **Types are lightweight specifications** that catch errors early
- **Pre-conditions** define what the function requires
- **Post-conditions** define what the function guarantees
- **Invariants** define what must always be true about data structures
- **The specification spectrum** ranges from natural language to formal proofs
- **AI assists** in generating and refining specifications, but human judgment ensures correctness

### Key Takeaway
> **"A week of specification can save a month of debugging."**

---

## Further Reading

1. "Specifying Systems" by Leslie Lamport - Chapter 1: Introduction
2. "How to Prove It" by Daniel Velleman - Chapter 1: Sentential Logic
3. "Python Type Hints" official documentation (PEP 484, 526)
4. "deal" library documentation: https://github.com/life4/deal

---

## End-of-Chapter Exercises

### Exercise 1.6: Specification Challenge (Individual)
Write complete specifications for a `BankAccount` class with:
- Deposit (with maximum limit)
- Withdrawal (with overdraft protection)
- Transfer (to another account)
- Balance inquiry
- Transaction history

Use `deal` decorators for all contracts.

### Exercise 1.7: Specification Review (Pair)
With a partner, exchange your `BankAccount` specifications. Each of you:
1. Try to find a way to violate the other's specification
2. Identify missing edge cases
3. Suggest improvements
4. Write 3 test cases that would catch the issues

### Exercise 1.8: AI Specification Evaluation (Individual)
Use the AI TA to generate specifications for a `PriorityQueue` class. Then:
1. Compare AI's output with your own understanding
2. Identify 3 cases where the AI was wrong or incomplete
3. Write the corrected specification
4. Submit your analysis and corrected specification

---

*Next Chapter: Propositions, Predicates, and Python - Logic as the Foundation*
