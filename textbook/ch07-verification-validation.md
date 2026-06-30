# Chapter 7: Verification and Validation

## Why This Chapter Matters

> **"Testing is not enough. You need to verify that your system is correct, not just that it passes tests."**

This chapter introduces techniques for verifying software correctness beyond traditional testing: model checking, formal proofs, static analysis, and runtime verification. You will learn when to use each technique and how to combine them for maximum confidence.

---

## 7.1 The Verification Hierarchy

### Levels of Confidence

| Level | Technique | Confidence | Effort | When to Use |
|-------|-----------|------------|--------|-------------|
| 1 | Manual testing | Low | Low | Never for critical code |
| 2 | Unit tests | Medium | Low | All code |
| 3 | Property-based tests | Medium-High | Medium | Complex algorithms |
| 4 | Static analysis | High (for specific properties) | Low | All code |
| 5 | Model checking | Very High (for finite systems) | Medium | Protocols, state machines |
| 6 | Formal proof | Highest | High | Critical algorithms |
| 7 | Runtime verification | High (during execution) | Medium | Production systems |

### Example: Multiple Verification Techniques for a Single Function

```python
from typing import List
from z3 import Solver, Int, ForAll, And, Implies, sat
from hypothesis import given, strategies as st
import deal

# ========== FUNCTION TO VERIFY ==========

def find_max(arr: List[int]) -> int:
    """
    Find the maximum element in a non-empty list.
    
    Specification:
    - Pre: arr is non-empty
    - Post: result is in arr and result >= all elements in arr
    """
    assert arr, "Pre-condition: list must not be empty"
    return max(arr)

# ========== LEVEL 2: UNIT TESTS ==========

def test_find_max_basic():
    assert find_max([1, 2, 3]) == 3
    assert find_max([-1, -2, -3]) == -1
    assert find_max([5]) == 5

# ========== LEVEL 3: PROPERTY-BASED TESTS ==========

@given(st.lists(st.integers(), min_size=1))
def test_find_max_properties(arr):
    result = find_max(arr)
    assert result in arr  # Result is in the list
    assert all(result >= x for x in arr)  # Result is >= all elements

# ========== LEVEL 4: STATIC ANALYSIS ==========
# Run mypy --strict on the code
# Type annotations ensure arr is List[int], preventing type errors

# ========== LEVEL 5: MODEL CHECKING (with Z3) ==========

def verify_find_max_theorem():
    """
    Verify: For all arrays of size 3, max(arr) satisfies the specification.
    """
    arr = [Int(f'arr_{i}') for i in range(3)]
    result = Int('result')
    
    # Model max(arr) as If-Then-Else
    max_val = If(arr[0] >= arr[1], arr[0], arr[1])
    max_val = If(max_val >= arr[2], max_val, arr[2])
    
    # Property: result >= all elements
    property1 = And(max_val >= arr[0], max_val >= arr[1], max_val >= arr[2])
    
    # Property: result is in array
    property2 = Or(max_val == arr[0], max_val == arr[1], max_val == arr[2])
    
    s = Solver()
    s.add(Not(And(property1, property2)))
    
    if s.check() == sat:
        print("Counterexample found!")
    else:
        print("Theorem verified for arrays of size 3!")

verify_find_max_theorem()

# ========== LEVEL 6: RUNTIME VERIFICATION ==========

@deal.pre(lambda arr: len(arr) > 0)
@deal.post(lambda result: True)  # Post-condition checked by implementation
@deal.ensure(lambda arr, result: result in arr and all(result >= x for x in arr))
def verified_find_max(arr: List[int]) -> int:
    return max(arr)
```

---

## 7.2 Static Analysis with Python Tools

### mypy for Type Safety

```python
# Run: mypy --strict --warn-unreachable --warn-redundant-casts

def risky_function(data: dict) -> int:
    """Type-safe with mypy."""
    # mypy catches: missing key checks, wrong types, None dereferences
    if "value" not in data:
        raise KeyError("Missing 'value' key")
    value = data["value"]
    if not isinstance(value, int):
        raise TypeError("Expected int")
    return value * 2
```

### Bandit for Security Analysis

```bash
# Install: pip install bandit
# Run: bandit -r my_project/

# Bandit catches security issues:
# - Hardcoded passwords
# - SQL injection vulnerabilities
# - Unsafe deserialization
# - Weak cryptographic algorithms
```

### Pylint for Code Quality

```bash
# Install: pip install pylint
# Run: pylint my_module.py

# Pylint checks:
# - Code complexity (too many branches, too deep nesting)
# - Unused variables and imports
# - Missing docstrings
# - Dangerous patterns
```

### Exercise 7.1: Static Analysis Pipeline

Set up a complete static analysis pipeline for a Python project:

```python
# .pre-commit-config.yaml equivalent - create a script
# static_analysis.py

import subprocess
import sys

def run_static_analysis(files):
    """Run all static analysis tools on given files."""
    tools = [
        ("mypy", ["--strict"] + files),
        ("pylint", files),
        ("bandit", ["-r", "."]),
        ("flake8", files),
    ]
    
    all_passed = True
    for tool, args in tools:
        print(f"\n{'='*50}")
        print(f"Running {tool}...")
        print('='*50)
        result = subprocess.run([tool] + args, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"FAIL: {tool}")
            print(result.stdout)
            print(result.stderr)
            all_passed = False
        else:
            print(f"PASS: {tool}")
    
    return all_passed

if __name__ == "__main__":
    import sys
    files = sys.argv[1:] if len(sys.argv) > 1 else ["*.py"]
    success = run_static_analysis(files)
    sys.exit(0 if success else 1)
```

**Requirements:**
1. Run the pipeline on a sample project with intentional bugs
2. Document how many issues each tool catches
3. Fix all issues and re-run
4. Integrate with Git pre-commit hooks
5. Generate a report of code quality metrics

---

## 7.3 Model Checking with Python

Model checking exhaustively verifies finite-state systems.

```python
from typing import Set, Dict, List, Tuple
from dataclasses import dataclass
from enum import Enum

class State(Enum):
    IDLE = "idle"
    REQUESTING = "requesting"
    GRANTED = "granted"
    RELEASING = "releasing"

class Action(Enum):
    REQUEST = "request"
    GRANT = "grant"
    RELEASE = "release"
    TIMEOUT = "timeout"

class MutexModel:
    """
    Model checking for a mutual exclusion protocol.
    
    Properties to verify:
    1. Safety: At most one process is in GRANTED state
    2. Liveness: If a process requests, it eventually gets granted (or times out)
    3. No deadlock: System never reaches a state with no valid transitions
    """
    
    def __init__(self, num_processes: int = 2):
        self.num_processes = num_processes
        self.states = [State.IDLE] * num_processes
        self.holder = None
    
    def get_transitions(self) -> List[Tuple[int, Action]]:
        """Return all valid transitions from current state."""
        transitions = []
        for i in range(self.num_processes):
            if self.states[i] == State.IDLE:
                transitions.append((i, Action.REQUEST))
            elif self.states[i] == State.REQUESTING and self.holder is None:
                transitions.append((i, Action.GRANT))
            elif self.states[i] == State.GRANTED:
                transitions.append((i, Action.RELEASE))
            elif self.states[i] == State.REQUESTING:
                transitions.append((i, Action.TIMEOUT))
        return transitions
    
    def apply(self, process: int, action: Action) -> 'MutexModel':
        """Apply a transition and return new state."""
        new_model = MutexModel(self.num_processes)
        new_model.states = self.states.copy()
        new_model.holder = self.holder
        
        if action == Action.REQUEST:
            new_model.states[process] = State.REQUESTING
        elif action == Action.GRANT:
            new_model.states[process] = State.GRANTED
            new_model.holder = process
        elif action == Action.RELEASE:
            new_model.states[process] = State.IDLE
            new_model.holder = None
        elif action == Action.TIMEOUT:
            new_model.states[process] = State.IDLE
        
        return new_model
    
    def check_safety(self) -> bool:
        """Property: At most one process is GRANTED."""
        granted_count = sum(1 for s in self.states if s == State.GRANTED)
        return granted_count <= 1
    
    def check_liveness(self, requesting: int) -> bool:
        """Property: If requesting, eventually granted or timeout."""
        # For bounded model checking, we check that requesting doesn't persist forever
        return True  # Simplified - would need temporal logic
    
    def __hash__(self):
        return hash(tuple(self.states) + (self.holder,))
    
    def __eq__(self, other):
        return (self.states == other.states and 
                self.holder == other.holder)

# Model checking algorithm
def check_all_states(initial: MutexModel, max_depth: int = 10) -> dict:
    """Exhaustive model checking up to max_depth."""
    visited = set()
    queue = [(initial, 0)]
    violations = []
    
    while queue:
        state, depth = queue.pop(0)
        if state in visited or depth > max_depth:
            continue
        visited.add(state)
        
        # Check safety property
        if not state.check_safety():
            violations.append(("SAFETY", state))
        
        # Check deadlock
        transitions = state.get_transitions()
        if not transitions and depth < max_depth:
            violations.append(("DEADLOCK", state))
        
        # Explore all transitions
        for process, action in transitions:
            new_state = state.apply(process, action)
            queue.append((new_state, depth + 1))
    
    return {
        "states_explored": len(visited),
        "violations": violations,
        "safe": len(violations) == 0
    }

# Run model checking
result = check_all_states(MutexModel(2))
print(f"States explored: {result['states_explored']}")
print(f"Violations: {result['violations']}")
print(f"Safe: {result['safe']}")
```

### Exercise 7.2: Model Check a Protocol

Model check a **Two-Phase Commit Protocol**:

```python
from enum import Enum, auto
from typing import List, Dict, Set

class TPCTransactionState(Enum):
    # TODO: Define states (INIT, PREPARING, PREPARED, COMMITTING, COMMITTED, ABORTING, ABORTED)
    pass

class TwoPhaseCommit:
    """
    Specification: Two-Phase Commit protocol.
    
    Properties to verify:
    1. Atomicity: All participants commit or all abort
    2. Agreement: If coordinator commits, all prepared participants commit
    3. No orphaned transactions
    4. Termination: Protocol eventually reaches COMMITTED or ABORTED
    """
    pass
```

**Requirements:**
1. Implement the state machine with all transitions
2. Verify atomicity property via model checking
3. Verify agreement property
4. Test with 2, 3, and 4 participants
5. Document state space size for each configuration

---

## 7.4 AI-Assisted Verification

AI can help generate verification conditions, suggest invariants, and interpret verification results.

### Prompt Template for Verification Assistance

```
I have a Python function that I need to verify formally:

```python
[function code]
```

Specification:
[pre/post conditions]

Please help me:
1. Write Z3 verification conditions for this function
2. Identify potential invariants that should hold
3. Suggest property-based tests using Hypothesis
4. Point out any specification gaps or inconsistencies
5. Suggest static analysis tools that would catch errors in this code
```

### Exercise 7.3: AI Verification Challenge

Take a complex function (e.g., a graph algorithm) and:
1. Write your own specification
2. Use AI to generate Z3 verification conditions
3. Run the Z3 verification
4. Compare AI's suggestions with your own analysis
5. Document what the AI caught and what it missed

---

## 7.5 Learning Journal

```markdown
## Chapter 7: Verification and Validation

### Key Concepts
- [List concepts]

### Verification Hierarchy
- [Which level is most appropriate for your projects?]
- [What is the cost-benefit tradeoff?]

### Model Checking
- [What surprised you about model checking?]
- [How big was the state space?]

### AI Assistance
- [How did AI help with verification?]
- [What did AI get wrong in formal verification?]

### Confidence Level (1-10)
```

---

## Chapter Summary

- **Verification hierarchy** provides increasing confidence at increasing cost
- **Static analysis** catches bugs without running code (mypy, bandit, pylint)
- **Model checking** exhaustively verifies finite-state systems
- **Runtime verification** (deal, assertions) catches violations during execution
- **AI can assist** in generating verification conditions and interpreting results
- **Multiple techniques** should be combined for production systems

### Key Takeaway
> **"Verification is not a phase. It's a continuous practice woven into every stage of development."**

---

## Further Reading

1. "Principles of Model Checking" by Baier and Katoen
2. "The SPIN Model Checker" by Gerard Holzmann
3. "Python Static Analysis Tools" documentation
4. "Runtime Verification" by Falcone et al.

---

## End-of-Chapter Exercises

### Exercise 7.4: Complete Verification Project (Individual)

Choose a non-trivial algorithm (e.g., Dijkstra's shortest path) and apply ALL verification levels:
1. Unit tests (comprehensive)
2. Property-based tests (5+ properties)
3. Static analysis (mypy, pylint, bandit)
4. Z3 verification (for small graphs)
5. Runtime contracts (deal)
6. Document verification results and confidence level

### Exercise 7.5: Team Verification Competition (Team)

In teams of 3, each team verifies a different concurrent data structure:
- Team A: Lock-free queue
- Team B: Read-write lock
- Team C: Semaphore

The team with the most properties verified and bugs found wins.

---

*Next Chapter: Advanced Topics - AI Integration and Emerging Methods*
