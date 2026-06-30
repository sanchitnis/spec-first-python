# Chapter 3: Types as Specifications

## Why This Chapter Matters

> **"Type systems are the most lightweight, practical formal methods available to every programmer."**

Python is dynamically typed, but Python 3's type hints (introduced in PEP 484) give us the power of static type checking without sacrificing flexibility. Types are **executable specifications** that:
- Catch bugs at "compile time" (before running)
- Serve as machine-checked documentation
- Enable powerful IDE features (autocomplete, refactoring)
- Form the foundation for more advanced formal methods

This chapter transforms you from a Python programmer who "gets by" without types into an engineer who leverages the type system as a specification tool.

---

## 3.1 The Python Type System: A Practical Introduction

### Basic Type Annotations

```python
from typing import List, Dict, Tuple, Optional, Union, Set

# Function with type annotations
def greet(name: str) -> str:
    return f"Hello, {name}!"

# Collection types
def process_numbers(numbers: List[int]) -> int:
    return sum(numbers)

# Dictionary types
def word_count(text: str) -> Dict[str, int]:
    words = text.split()
    return {word: words.count(word) for word in set(words)}

# Optional: value may be None
def find_user(user_id: int) -> Optional[str]:
    users = {1: "Alice", 2: "Bob"}
    return users.get(user_id)

# Union: value may be one of several types
def parse_value(value: Union[str, int]) -> int:
    if isinstance(value, str):
        return int(value)
    return value

# Tuple with fixed size and types
def get_point() -> Tuple[float, float, float]:
    return (1.0, 2.0, 3.0)
```

### Type Checking with mypy

```bash
# Install mypy
pip install mypy

# Check a file
mypy my_program.py

# Check with strict mode (recommended for this course)
mypy --strict my_program.py
```

**Example output:**
```
my_program.py:5: error: Argument 1 to "greet" has incompatible type "int"; expected "str"
my_program.py:10: error: Incompatible return value type (got "float", expected "int")
```

### Exercise 3.1: Type the Untyped

The following code has no type annotations. Add complete type annotations and run `mypy --strict` to verify.

```python
def calculate_average(scores):
    if not scores:
        return 0
    return sum(scores) / len(scores)

def get_student_report(student):
    name = student["name"]
    scores = student["scores"]
    average = calculate_average(scores)
    return {
        "name": name,
        "average": average,
        "grade": "A" if average >= 90 else "B" if average >= 80 else "C"
    }

def process_class_roster(roster):
    reports = []
    for student in roster:
        report = get_student_report(student)
        reports.append(report)
    return reports
```

**Requirements:**
1. Define appropriate dataclasses or TypedDict for `student` and `report`
2. Add type annotations to ALL functions
3. Run `mypy --strict` with zero errors
4. Handle edge cases (empty roster, empty scores) in the type system

---

## 3.2 Generic Types: Specifications for Collections

Generic types let you write specifications that are polymorphic but still type-safe.

```python
from typing import TypeVar, Generic, List, Callable

T = TypeVar('T')
U = TypeVar('U')

def first(lst: List[T]) -> Optional[T]:
    """Specification: Returns the first element if list is non-empty."""
    return lst[0] if lst else None

# Works with any type
first([1, 2, 3])      # Returns int
first(["a", "b"])     # Returns str
first([])             # Returns None

def map_list(func: Callable[[T], U], lst: List[T]) -> List[U]:
    """Specification: Applies func to each element, preserving structure."""
    return [func(x) for x in lst]

# Type-safe: mypy knows the return type
numbers = [1, 2, 3]
strings = map_list(str, numbers)  # mypy knows strings: List[str]
```

### Constrained Type Variables

```python
from typing import TypeVar

# T must support ordering (for sorting, max, min)
OrderedT = TypeVar('OrderedT', int, float, str)

def find_max(values: List[OrderedT]) -> OrderedT:
    """Specification: Returns the maximum value in a non-empty list."""
    assert values, "Pre-condition: list must not be empty"
    return max(values)

# Valid
find_max([1, 2, 3])
find_max(["apple", "banana"])

# Invalid - mypy will catch this
# find_max([{"a": 1}, {"b": 2}])  # Error: dict is not ordered
```

### Exercise 3.2: Generic Data Structures

Implement a generic `Stack` class with full type annotations and specifications:

```python
from typing import TypeVar, Generic, List, Optional

T = TypeVar('T')

class Stack(Generic[T]):
    """
    A generic stack with type-safe operations.
    
    Invariants:
    - len(self._items) >= 0
    - push increases length by 1
    - pop decreases length by 1 (if not empty)
    """
    
    def __init__(self) -> None:
        self._items: List[T] = []
    
    def push(self, item: T) -> None:
        """Pre: None. Post: item is on top."""
        self._items.append(item)
    
    def pop(self) -> T:
        """Pre: not empty. Post: returns top item."""
        if not self._items:
            raise IndexError("Stack is empty")
        return self._items.pop()
    
    def peek(self) -> Optional[T]:
        """Pre: None. Post: returns top item without removing, or None."""
        return self._items[-1] if self._items else None
    
    def is_empty(self) -> bool:
        return len(self._items) == 0
    
    def size(self) -> int:
        return len(self._items)

# Usage with type inference
int_stack: Stack[int] = Stack()
int_stack.push(42)
# int_stack.push("hello")  # mypy ERROR: str is not int
```

**Requirements:**
1. Complete type annotations for all methods
2. Invariant assertions (can be commented or use deal)
3. Test with at least 3 different types (int, str, custom class)
4. Verify with `mypy --strict`

---

## 3.3 Pydantic: Runtime Type Validation

`pydantic` enforces types at runtime, bridging the gap between static and dynamic typing.

```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class User(BaseModel):
    """
    Specification of a User entity.
    
    Invariants enforced by pydantic:
    - id: positive integer
    - name: non-empty string, 1-100 characters
    - email: valid email format
    - age: 0-150
    - created_at: datetime (auto-generated)
    """
    id: int = Field(..., gt=0, description="Unique positive identifier")
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    age: int = Field(..., ge=0, le=150)
    created_at: datetime = Field(default_factory=datetime.now)
    is_active: bool = True

    @validator('name')
    def name_must_be_capitalized(cls, v):
        if not v[0].isupper():
            raise ValueError('Name must start with capital letter')
        return v

# Usage - valid
try:
    user = User(id=1, name="Alice", email="alice@example.com", age=25)
    print(user.json(indent=2))
except ValueError as e:
    print(f"Validation error: {e}")

# Usage - invalid (caught at runtime)
try:
    bad_user = User(id=-1, name="", email="invalid", age=200)
except ValueError as e:
    print(f"Validation error: {e}")  # Multiple errors reported
```

### Exercise 3.3: Domain Model Specification

Design a type-safe domain model for a University Course Registration system:

```python
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import date, time
from enum import Enum

class Semester(str, Enum):
    FALL = "FALL"
    SPRING = "SPRING"
    SUMMER = "SUMMER"

class Student(BaseModel):
    """TODO: Specify with pydantic validators"""
    pass

class Course(BaseModel):
    """TODO: Specify with pydantic validators"""
    pass

class Registration(BaseModel):
    """TODO: Specify with pydantic validators"""
    pass
```

**Requirements:**
1. `Student`: id, name, email, gpa (0.0-4.0), enrolled_courses (max 6)
2. `Course`: id, code (e.g., "CSE-3504"), name, credits (1-4), capacity, enrolled_count, semester, year
3. `Registration`: student_id, course_id, registration_date, status (PENDING, CONFIRMED, WAITLIST)
4. Business rules as validators (e.g., registration only if capacity not exceeded, valid email format)
5. Test with valid and invalid data
6. Generate JSON schema from the models

---

## 3.4 TypedDict: Structural Specifications for Dictionaries

When working with JSON-like data (APIs, configuration files), `TypedDict` provides structural type specifications.

```python
from typing import TypedDict, Optional, List

class APIResponse(TypedDict):
    """Specification of a standard API response structure."""
    status: str  # "success" or "error"
    data: Optional[dict]
    message: Optional[str]
    errors: Optional[List[str]]

class PaginatedResponse(TypedDict):
    """Specification for paginated API responses."""
    items: List[dict]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

def process_api_response(response: APIResponse) -> str:
    """
    Specification: Processes an API response and returns a summary string.
    Pre: response is a valid APIResponse structure
    Post: Returns a non-empty string describing the result
    """
    if response["status"] == "success":
        return f"Success: {response.get('message', 'No message')}"
    else:
        errors = response.get("errors", ["Unknown error"])
        return f"Error: {', '.join(errors)}"

# Valid usage
response: APIResponse = {
    "status": "success",
    "data": {"id": 1},
    "message": "Created successfully",
    "errors": None
}

# Invalid - mypy catches this
# bad_response: APIResponse = {
#     "status": "pending",  # Error: not "success" or "error"
#     "data": "not a dict"  # Error: should be Optional[dict]
# }
```

### Exercise 3.4: Typed Configuration Specification

Design a type-safe configuration system for a web application:

```python
from typing import TypedDict, Optional, Union, List

# TODO: Define these TypedDicts
class DatabaseConfig(TypedDict):
    pass

class CacheConfig(TypedDict):
    pass

class LoggingConfig(TypedDict):
    pass

class AppConfig(TypedDict):
    pass

# Load and validate configuration
def load_config(path: str) -> AppConfig:
    """Load configuration from JSON file with type validation."""
    import json
    with open(path) as f:
        data = json.load(f)
    # TODO: Validate structure matches AppConfig
    return data
```

**Requirements:**
1. `DatabaseConfig`: host, port, username, password, database, pool_size (optional), ssl (bool)
2. `CacheConfig`: type ("redis" or "memcached"), host, port, ttl_seconds
3. `LoggingConfig`: level ("DEBUG", "INFO", "WARNING", "ERROR"), format (string), file (optional path)
4. `AppConfig`: app_name, debug (bool), database, cache, logging, allowed_hosts (List[str])
5. Validate that required fields are present and types are correct
6. Write tests that load valid and invalid configs

---

## 3.5 Protocols: Duck Typing with Specifications

Python 3.8+ supports `Protocol` - structural subtyping without explicit inheritance.

```python
from typing import Protocol, runtime_checkable

class Drawable(Protocol):
    """Specification: Any object that can be drawn."""
    def draw(self) -> None: ...

class Resizable(Protocol):
    """Specification: Any object that can be resized."""
    def resize(self, scale: float) -> None: ...

class Shape:
    """A concrete shape that satisfies both protocols."""
    def __init__(self, width: float, height: float) -> None:
        self.width = width
        self.height = height
    
    def draw(self) -> None:
        print(f"Drawing shape: {self.width}x{self.height}")
    
    def resize(self, scale: float) -> None:
        self.width *= scale
        self.height *= scale

# Function that accepts anything "Drawable"
def render(item: Drawable) -> None:
    item.draw()

# Function that accepts anything "Resizable"
def scale_up(item: Resizable) -> None:
    item.resize(2.0)

# Shape satisfies both protocols (structural typing)
shape = Shape(10, 20)
render(shape)  # Valid: Shape has draw()
scale_up(shape)  # Valid: Shape has resize()
```

### Exercise 3.5: Protocol-Based Design

Design a system using protocols for a plugin architecture:

```python
from typing import Protocol, List

class DataSource(Protocol):
    """Specification: Any source that can provide data records."""
    def connect(self) -> None: ...
    def fetch(self, query: str) -> List[dict]: ...
    def close(self) -> None: ...

class DataProcessor(Protocol):
    """Specification: Any processor that can transform data."""
    def process(self, data: List[dict]) -> List[dict]: ...

class DataSink(Protocol):
    """Specification: Any destination that can store data."""
    def write(self, data: List[dict]) -> int: ...  # Returns count written

class ETLPipeline:
    """
    Specification: Extract-Transform-Load pipeline.
    
    Invariants:
    - source, processor, sink are set before running
    - After run(), records_processed >= 0
    """
    
    def __init__(self, source: DataSource, processor: DataProcessor, sink: DataSink) -> None:
        self.source = source
        self.processor = processor
        self.sink = sink
        self.records_processed = 0
    
    def run(self, query: str) -> int:
        self.source.connect()
        data = self.source.fetch(query)
        processed = self.processor.process(data)
        count = self.sink.write(processed)
        self.source.close()
        self.records_processed = count
        return count

# Implement concrete classes
class CSVSource:
    """TODO: Implement DataSource protocol for CSV files"""
    pass

class JSONTransformer:
    """TODO: Implement DataProcessor that transforms JSON"""
    pass

class DatabaseSink:
    """TODO: Implement DataSink for SQLite"""
    pass
```

**Requirements:**
1. Implement all three concrete classes
2. Verify with `mypy` that they satisfy the protocols
3. Write an ETL pipeline that reads CSV, transforms JSON, writes to SQLite
4. Add type-safe error handling

---

## 3.6 AI Teaching Assistant: Type-Driven Development

The AI TA can help with type-driven development by suggesting appropriate types, catching type-related issues, and generating type-safe code.

### Prompt Template for Type Specifications

```
I need to design a type-safe Python module for [domain].

The domain has these entities:
- [Entity 1 with attributes]
- [Entity 2 with attributes]
- [Relationships between entities]

Business rules:
- [Rule 1]
- [Rule 2]

Please provide:
1. Pydantic models or dataclasses with full type annotations
2. Protocols for key interfaces
3. Function signatures with complete types
4. Example of how to use the types with mypy
5. Common type errors that might occur and how to avoid them
```

### Exercise 3.6: AI-Assisted Type Design

Use the AI TA to generate type specifications for a **Library Management System**. Then:

1. **AI Generation:** Use the prompt above to get initial types
2. **Human Review:** Critique the AI's types for:
   - Missing constraints (e.g., ISBN format, due date validity)
   - Incorrect optionality (what should be Optional vs required)
   - Relationship modeling (how should Book and Author relate?)
3. **Refinement:** Improve the types based on your analysis
4. **Validation:** Run `mypy --strict` and add pydantic validators
5. **Reflection:** Write 300 words on the AI's strengths and weaknesses in type design

---

## 3.7 Learning Journal

```markdown
## Chapter 3: Types as Specifications

### Key Concepts
- [List concepts]

### mypy Experience
- [What errors did mypy catch that you didn't expect?]
- [What was frustrating about the type system?]

### pydantic vs. mypy
- [When do you prefer each?]

### AI Type Assistance
- [How useful was the AI for type design?]
- [What types did the AI get wrong?]

### Confidence Level (1-10)
```

---

## Chapter Summary

- **Type annotations** are lightweight, machine-checkable specifications
- **`mypy --strict`** provides static type checking that catches errors before runtime
- **Generic types** (`TypeVar`, `Generic`) allow polymorphic specifications
- **Pydantic** enforces types at runtime with validation rules
- **TypedDict** specifies the structure of dictionary-like data
- **Protocols** enable structural subtyping for flexible, type-safe interfaces
- **Type-driven development** (design types first, then implement) reduces bugs significantly

### Key Takeaway
> **"A type system is a proof assistant that never sleeps. Every type annotation is a lemma about your program's correctness."**

---

## Further Reading

1. "Python Type Hints" Official Documentation (PEP 484, 526, 544, 585)
2. "mypy" documentation: https://mypy.readthedocs.io/
3. "Pydantic" documentation: https://docs.pydantic.dev/
4. "Type Driven Development with Idris" by Edwin Brady (for advanced study)

---

## End-of-Chapter Exercises

### Exercise 3.7: Type-Safe API Client (Individual)

Build a type-safe HTTP API client using `TypedDict` and `pydantic`:

```python
from typing import TypedDict, Optional
from pydantic import BaseModel, HttpUrl
import requests

class GitHubUser(BaseModel):
    """TODO: Specify GitHub API user response"""
    pass

class GitHubRepo(BaseModel):
    """TODO: Specify GitHub API repo response"""
    pass

class GitHubClient:
    """
    Type-safe GitHub API client.
    
    All methods return pydantic models, not raw dicts.
    """
    
    def __init__(self, token: Optional[str] = None) -> None:
        self.base_url = "https://api.github.com"
        self.token = token
    
    def get_user(self, username: str) -> GitHubUser:
        """Fetch user by username with type-safe response."""
        pass
    
    def get_user_repos(self, username: str) -> List[GitHubRepo]:
        """Fetch user repos with type-safe response."""
        pass
```

**Requirements:**
1. Full type annotations on all methods
2. Pydantic models for all API responses
3. Error handling with typed exceptions
4. Unit tests with mocked HTTP responses
5. mypy --strict compliance

### Exercise 3.8: Team Type Challenge (Team)

In teams of 3, design a type system for a **Ride-Sharing App**:
1. **Role A:** Design core domain types (User, Driver, Ride, Payment)
2. **Role B:** Design API types (Request, Response, Error types)
3. **Role C:** Design state machine types (RideStatus, PaymentStatus)

Combine into a complete type specification and verify with mypy.

### Exercise 3.9: Type Refactoring Legacy Code (Individual)

Take a 100-line untyped Python script (provided or your own) and:
1. Add complete type annotations
2. Run mypy and fix all errors
3. Add pydantic models where appropriate
4. Document how many potential bugs the type system caught
5. Measure the improvement in IDE autocomplete quality

---

*Next Chapter: Spec-Driven Development - From Requirements to Verified Code*
