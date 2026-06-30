# Lab 1: Setting Up Your Specification-First Environment

## Learning Objectives

By the end of this lab, you will:
1. Set up a complete Python development environment for formal methods
2. Install and configure all required tools
3. Write your first specification with type annotations and contracts
4. Run static analysis and catch bugs before they happen
5. Configure the local AI Teaching Assistant

## Prerequisites

- Python 3.11+ installed
- VS Code or PyCharm
- Git installed
- Administrator access (for installing packages)

## Duration: 2 hours

---

## Part 1: Environment Setup (30 minutes)

### Step 1: Create Virtual Environment

```bash
# Create project directory
mkdir formal-methods-lab
 cd formal-methods-lab

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate
```

### Step 2: Install Core Tools

```bash
# Install all required packages
pip install mypy pydantic hypothesis deal z3-solver pytest

# Install development tools
pip install pylint bandit flake8

# Install AI assistant
pip install requests ollama

# Verify installations
python -c "import mypy; print('mypy OK')"
python -c "import pydantic; print('pydantic OK')"
python -c "import hypothesis; print('hypothesis OK')"
python -c "import deal; print('deal OK')"
python -c "import z3; print('Z3 OK')"
python -c "import pytest; print('pytest OK')"
```

### Step 3: Configure VS Code

Create `.vscode/settings.json`:

```json
{
    "python.analysis.typeCheckingMode": "strict",
    "python.linting.enabled": true,
    "python.linting.mypyEnabled": true,
    "python.linting.pylintEnabled": true,
    "python.formatting.provider": "black",
    "editor.formatOnSave": true,
    "python.testing.pytestEnabled": true,
    "python.testing.unittestEnabled": false,
    "python.testing.nosetestsEnabled": false
}
```

### Step 4: Configure mypy

Create `mypy.ini`:

```ini
[mypy]
python_version = 3.11
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
disallow_incomplete_defs = True
check_untyped_defs = True
disallow_untyped_decorators = True
no_implicit_optional = True
warn_redundant_casts = True
warn_unused_ignores = True
warn_no_return = True
warn_unreachable = True
strict_equality = True
```

**Exercise 1.1:** Verify your setup by running `mypy --version` and `pytest --version`. Take a screenshot of successful tool execution.

---

## Part 2: Your First Specification (30 minutes)

### Exercise 1.2: Write a Specification-First Function

Create `lab1_temperature.py`:

```python
from typing import Union
import deal

# TODO: Write the complete specification first, then implement

def celsius_to_fahrenheit(celsius: float) -> float:
    """
    Convert Celsius to Fahrenheit.
    
    Specification:
    - Pre-condition: celsius >= -273.15 (absolute zero)
    - Post-condition: result == (celsius * 9/5) + 32
    - Post-condition: result >= -459.67 (Fahrenheit absolute zero)
    
    Examples:
    >>> celsius_to_fahrenheit(0)
    32.0
    >>> celsius_to_fahrenheit(100)
    212.0
    >>> celsius_to_fahrenheit(-40)
    -40.0
    """
    pass  # TODO: Implement after writing spec


@deal.pre(lambda celsius: celsius >= -273.15, message="Temperature below absolute zero")
@deal.post(lambda result: result >= -459.67, message="Result below absolute zero")
def celsius_to_fahrenheit_verified(celsius: float) -> float:
    """Verified version with runtime contracts."""
    # TODO: Implement
    pass
```

**Requirements:**
1. Write the docstring specification FIRST
2. Add type hints
3. Add `deal` contracts
4. Implement the function
5. Write tests (see below)
6. Run `mypy --strict` and ensure zero errors

### Exercise 1.3: Write Tests

Create `test_lab1_temperature.py`:

```python
import pytest
from hypothesis import given, strategies as st
from lab1_temperature import celsius_to_fahrenheit, celsius_to_fahrenheit_verified

# Unit tests from specification examples
def test_freezing_point():
    assert celsius_to_fahrenheit(0) == 32.0

def test_boiling_point():
    assert celsius_to_fahrenheit(100) == 212.0

def test_negative_40():
    assert celsius_to_fahrenheit(-40) == -40.0

# Property-based tests
def test_conversion_formula():
    """Property: result == (celsius * 9/5) + 32"""
    # TODO: Implement with Hypothesis
    pass

def test_absolute_zero():
    """Property: result >= -459.67 for valid inputs"""
    # TODO: Implement with Hypothesis
    pass

# Error tests
def test_below_absolute_zero():
    with pytest.raises((deal.PreContractError, AssertionError)):
        celsius_to_fahrenheit_verified(-300)
```

---

## Part 3: Static Analysis Practice (30 minutes)

### Exercise 1.4: Find and Fix Type Errors

Given `lab1_broken.py` (intentionally buggy):

```python
# This code has type errors. Find and fix them with mypy.

def process_data(data):
    result = []
    for item in data:
        if item > 0:
            result.append(item * 2)
    return result

def get_user(user_id):
    users = {1: "Alice", 2: "Bob"}
    return users.get(user_id)

def calculate_average(scores):
    if not scores:
        return 0
    return sum(scores) / len(scores)

def main():
    data = [1, 2, 3, "four", 5]
    processed = process_data(data)
    print(processed)
    
    user = get_user("1")
    print(user.upper())
    
    avg = calculate_average([1, 2, 3])
    print(avg + " is the average")
```

**Tasks:**
1. Run `mypy --strict lab1_broken.py` and record all errors
2. Add type annotations to fix all errors
3. Add proper error handling
4. Re-run mypy until zero errors
5. Write tests for the corrected code

---

## Part 4: AI Teaching Assistant Setup (30 minutes)

### Exercise 1.5: Set Up Ollama

```bash
# Install Ollama from https://ollama.com/download
# Then pull a model:
ollama pull llama3.1:8b

# Test it
ollama run llama3.1:8b
# Type: "What is a pre-condition in software engineering?"
# Exit with /bye
```

### Exercise 1.6: Test AI TA Client

Create `lab1_ai_test.py`:

```python
from ai_ta import AITeachingAssistant

def test_ai_ta():
    """Test that the AI TA can answer a specification question."""
    ta = AITeachingAssistant(model="llama3.1:8b")
    
    # Test socratic mode
    question = ta.ask_socratic("loop invariants")
    print(f"Socratic question: {question}")
    
    # Test concept explanation
    explanation = ta.explain_concept("pre-conditions")
    print(f"\nExplanation: {explanation}")
    
    # Test specification help
    spec_help = ta.help_specify(
        "A function that calculates the factorial of a non-negative integer"
    )
    print(f"\nSpec help: {spec_help}")
    
    # Print usage stats
    print(f"\nUsage stats: {ta.get_usage_stats()}")

if __name__ == "__main__":
    test_ai_ta()
```

**Deliverable:** Save the AI's responses and your evaluation of their quality (1-5 scale for each).

---

## Part 5: Submission Checklist

Before submitting your lab, verify:

- [ ] Virtual environment created and activated
- [ ] All tools installed and verified
- [ ] `mypy.ini` configured
- [ ] VS Code settings configured
- [ ] `lab1_temperature.py` with complete specification and implementation
- [ ] `test_lab1_temperature.py` with unit and property-based tests
- [ ] All tests pass (`pytest -v`)
- [ ] `mypy --strict` is clean (zero errors)
- [ ] `lab1_broken.py` fixed and type-safe
- [ ] Ollama installed and model downloaded
- [ ] AI TA tested with documented responses
- [ ] Learning journal entry completed

---

## Learning Journal Entry

```markdown
## Lab 1: Environment Setup

### What was easy?
### What was difficult?
### How many bugs did mypy catch?
### How useful was the AI TA?
### What will I do differently next time?
### Confidence level (1-10):
```

---

## Bonus Challenge

Create a GitHub repository with:
1. Your lab code
2. GitHub Actions CI/CD that runs mypy, pytest, and bandit on every commit
3. A README with setup instructions
4. Badge showing test status

This will be your portfolio for the course!
