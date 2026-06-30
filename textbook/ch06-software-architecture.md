# Chapter 6: Software Architecture and System Specifications

## Why This Chapter Matters

> **"Junior developers write functions. Senior developers design systems."**

This chapter bridges the gap between individual functions and complete systems. You will learn to specify, design, and reason about software architectures using formal and semi-formal methods. Architecture is where specifications have their greatest impact: a well-specified architecture prevents entire classes of bugs before a single line of implementation code is written.

---

## 6.1 Architecture as a Specification Problem

### The Architecture Specification Spectrum

| Level | Artifact | Formality | Purpose |
|-------|----------|-----------|---------|
| Context | C4 Diagrams | Informal | System boundaries |
| Containers | Deployment diagrams | Semi-formal | Runtime topology |
| Components | Interface contracts | Formal | API specifications |
| Classes | Type signatures | Formal | Implementation contracts |

### Example: Specifying a Microservice Architecture

```python
from typing import Protocol, TypedDict, Optional, List
from dataclasses import dataclass
from enum import Enum

# ========== COMPONENT INTERFACE SPECIFICATIONS ==========

class OrderService(Protocol):
    """Specification: Order management service interface."""
    
    def create_order(self, customer_id: str, items: List[dict]) -> dict:
        """
        Pre: customer_id is valid, items is non-empty
        Post: Returns order with status CREATED, total computed
        """
        ...
    
    def get_order(self, order_id: str) -> Optional[dict]:
        """
        Pre: order_id is non-empty
        Post: Returns order if exists, None otherwise
        """
        ...
    
    def cancel_order(self, order_id: str) -> bool:
        """
        Pre: order_id exists and status is CANCELLABLE
        Post: Returns True if cancelled, False if already shipped/delivered
        """
        ...

class PaymentService(Protocol):
    """Specification: Payment processing service interface."""
    
    def process_payment(self, order_id: str, amount: float, method: str) -> dict:
        """
        Pre: amount > 0, method in ['credit_card', 'debit_card', 'upi']
        Post: Returns payment status with transaction_id
        Error: InsufficientFundsError, InvalidCardError, NetworkError
        """
        ...
    
    def refund_payment(self, transaction_id: str, amount: float) -> dict:
        """
        Pre: transaction_id exists, amount <= original amount
        Post: Returns refund status with refund_id
        """
        ...

class InventoryService(Protocol):
    """Specification: Inventory management service interface."""
    
    def check_availability(self, sku: str, quantity: int) -> bool:
        """
        Pre: sku is valid, quantity > 0
        Post: Returns True if available quantity >= requested
        """
        ...
    
    def reserve_items(self, order_id: str, items: List[dict]) -> dict:
        """
        Pre: All items are available
        Post: Items reserved for 15 minutes, returns reservation_id
        Error: OutOfStockError
        """
        ...
    
    def release_reservation(self, reservation_id: str) -> bool:
        """
        Pre: reservation_id exists and not expired
        Post: Returns True if released, False if already expired
        """
        ...

# ========== SYSTEM INVARIANTS ==========

class SystemInvariants:
    """
    Global invariants that must hold across all services.
    """
    
    @staticmethod
    def order_total_consistency(order: dict, payments: List[dict]) -> bool:
        """
        Invariant: Sum of payment amounts == order total (if paid)
        """
        if order['status'] == 'PAID':
            return abs(sum(p['amount'] for p in payments) - order['total']) < 0.01
        return True
    
    @staticmethod
    def inventory_consistency(reservations: List[dict], inventory: dict) -> bool:
        """
        Invariant: Available quantity + reserved quantity == total quantity
        """
        for sku, data in inventory.items():
            reserved = sum(
                r['quantity'] for r in reservations 
                if r['sku'] == sku and r['status'] == 'ACTIVE'
            )
            if data['available'] + reserved != data['total']:
                return False
        return True
    
    @staticmethod
    def no_orphan_payments(orders: List[dict], payments: List[dict]) -> bool:
        """
        Invariant: Every payment has a valid order_id
        """
        order_ids = {o['id'] for o in orders}
        return all(p['order_id'] in order_ids for p in payments)

# ========== ARCHITECTURE CONSTRAINTS ==========

class ArchitectureConstraints:
    """
    Constraints on the architecture (non-functional requirements).
    """
    
    MAX_LATENCY_MS = 500
    MAX_RETRY_COUNT = 3
    CIRCUIT_BREAKER_THRESHOLD = 0.5
    CACHE_TTL_SECONDS = 300
    
    @staticmethod
    def validate_latency(response_time_ms: float) -> bool:
        return response_time_ms <= ArchitectureConstraints.MAX_LATENCY_MS
```

### Exercise 6.1: Architecture Specification Design

Specify the architecture for a **Ride-Sharing Platform** with these components:
- User Service (registration, authentication, profiles)
- Driver Service (onboarding, availability, ratings)
- Ride Service (matching, tracking, completion)
- Payment Service (fare calculation, processing, payouts)
- Notification Service (SMS, push, email)

**Requirements:**
1. Define Protocol interfaces for each service (5+ methods each)
2. Write at least 5 system invariants
3. Specify error types and retry policies
4. Include non-functional constraints (latency, availability)
5. Use AI to review and suggest missing interfaces

---

## 6.2 Interface Contracts with OpenAPI

OpenAPI (formerly Swagger) is the industry standard for specifying HTTP API interfaces. It provides machine-readable contracts that enable:
- Automatic client generation
- Interactive documentation
- Contract testing
- Mock server generation

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

app = FastAPI(title="E-Commerce API", version="1.0.0")

# ========== OPENAPI SCHEMAS (Specifications) ==========

class Product(BaseModel):
    """Specification of a product in the catalog."""
    id: str = Field(..., description="Unique SKU")
    name: str = Field(..., min_length=1, max_length=200)
    price: float = Field(..., gt=0, description="Price in USD")
    category: str = Field(..., description="Product category")
    in_stock: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.now)

class CreateOrderRequest(BaseModel):
    """Specification for creating an order."""
    customer_id: str = Field(..., min_length=1)
    items: List[dict] = Field(..., min_items=1, description="List of {product_id, quantity}")
    shipping_address: dict = Field(..., description="Address object")
    payment_method: str = Field(..., regex="^(credit_card|debit_card|upi)$")

class OrderResponse(BaseModel):
    """Specification of order response."""
    order_id: str
    status: str = Field(..., regex="^(CREATED|PAID|SHIPPED|DELIVERED|CANCELLED)$")
    total: float = Field(..., ge=0)
    items: List[dict]
    created_at: datetime

# ========== OPENAPI OPERATIONS (Implementation) ==========

@app.post("/orders", response_model=OrderResponse, status_code=201)
async def create_order(request: CreateOrderRequest) -> OrderResponse:
    """
    Create a new order.
    
    Specification:
    - Pre: items is non-empty, all products exist and in stock
    - Pre: payment_method is valid
    - Post: order is created with status CREATED
    - Post: total is computed as sum(item.price * item.quantity) + tax
    - Error: 400 if items invalid, 402 if payment fails, 404 if product not found
    """
    # Implementation would validate, compute total, create order
    pass

@app.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str) -> OrderResponse:
    """
    Retrieve order by ID.
    
    Specification:
    - Pre: order_id is non-empty
    - Post: Returns order if exists
    - Error: 404 if order not found
    """
    pass

@app.patch("/orders/{order_id}/cancel")
async def cancel_order(order_id: str) -> dict:
    """
    Cancel an order.
    
    Specification:
    - Pre: order exists and status is CANCELLABLE (CREATED or PAID)
    - Post: Status changed to CANCELLED, inventory released
    - Post: Refund initiated if payment was made
    - Error: 400 if order already shipped, 404 if not found
    """
    pass
```

### Contract Testing with Schemathesis

```python
# schemathesis automatically tests your API against its OpenAPI specification
import schemathesis

schema = schemathesis.from_path("openapi.json")

@schema.parametrize()
def test_api_contract(case):
    """Property: All API responses conform to OpenAPI specification."""
    response = case.call()
    case.validate_response(response)

# Run: pytest test_api_contract.py
```

### Exercise 6.2: OpenAPI Specification Project

Design and implement a complete OpenAPI specification for a **Library Management System**:

**Endpoints Required:**
1. `GET /books` - List books with pagination, filtering, sorting
2. `POST /books` - Add a new book (librarian only)
3. `GET /books/{id}` - Get book details
4. `PUT /books/{id}` - Update book (librarian only)
5. `POST /books/{id}/borrow` - Borrow a book (member)
6. `POST /books/{id}/return` - Return a book (member)
7. `GET /members/{id}/loans` - Get member's active loans
8. `POST /members` - Register a new member

**Requirements:**
1. Complete Pydantic models for all request/response types
2. FastAPI implementation with OpenAPI generation
3. Authentication specification (JWT tokens)
4. Error response specifications (400, 401, 403, 404, 409)
5. Schemathesis contract tests
6. AI-generated API client from OpenAPI spec

---

## 6.3 Specifying Concurrent and Distributed Systems

Concurrent systems are notoriously hard to get right. Specifications are essential.

### Linearizability Specification

```python
from typing import List, Optional, Callable
from dataclasses import dataclass
from enum import Enum
import threading

class ConcurrentQueueSpec:
    """
    Specification: A concurrent queue must be linearizable.
    
    Linearizability means: For every concurrent execution, there exists
    SOME sequential ordering of operations that satisfies the sequential spec.
    
    Sequential spec for a queue:
    - enqueue(x): adds x to back
    - dequeue(): removes and returns front, or None if empty
    - peek(): returns front without removing, or None if empty
    """
    
    def __init__(self):
        self._items: List[int] = []
        self._lock = threading.Lock()
    
    def enqueue(self, item: int) -> None:
        with self._lock:
            self._items.append(item)
    
    def dequeue(self) -> Optional[int]:
        with self._lock:
            return self._items.pop(0) if self._items else None
    
    def peek(self) -> Optional[int]:
        with self._lock:
            return self._items[0] if self._items else None
    
    def is_empty(self) -> bool:
        with self._lock:
            return len(self._items) == 0
    
    def size(self) -> int:
        with self._lock:
            return len(self._items)

# Property: Concurrent enqueue/dequeue preserves total count
import concurrent.futures
import random

def test_concurrent_queue():
    """Test linearizability under concurrent access."""
    queue = ConcurrentQueueSpec()
    num_operations = 1000
    num_threads = 10
    
    def worker(worker_id):
        for _ in range(num_operations // num_threads):
            if random.random() < 0.6:
                queue.enqueue(random.randint(1, 100))
            else:
                queue.dequeue()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=num_threads) as executor:
        futures = [executor.submit(worker, i) for i in range(num_threads)]
        concurrent.futures.wait(futures)
    
    # Invariant: size should be non-negative and consistent
    assert queue.size() >= 0
    # Additional invariants could be checked with a linearizability checker
```

### Exercise 6.3: Concurrent System Specification

Design and test a **Thread-Safe Bounded Buffer**:

```python
from threading import Lock, Condition
from typing import Optional, List
from dataclasses import dataclass

class BoundedBuffer:
    """
    Specification: Thread-safe bounded buffer with producer-consumer semantics.
    
    Invariants:
    - 0 <= count <= capacity
    - Buffer is FIFO (first in, first out)
    - No lost items (all produced items are eventually consumed)
    - No duplicate items
    
    Producer (put):
    - Pre: count < capacity (block if full)
    - Post: count increases by 1, item at back
    
    Consumer (get):
    - Pre: count > 0 (block if empty)
    - Post: count decreases by 1, returns front item
    """
    
    def __init__(self, capacity: int):
        self.capacity = capacity
        self._buffer: List[int] = []
        self._lock = Lock()
        self._not_full = Condition(self._lock)
        self._not_empty = Condition(self._lock)
    
    def put(self, item: int) -> None:
        """TODO: Implement with proper synchronization"""
        pass
    
    def get(self) -> int:
        """TODO: Implement with proper synchronization"""
        pass
    
    def size(self) -> int:
        """TODO: Thread-safe size query"""
        pass
```

**Requirements:**
1. Implement with proper `Condition` variables
2. Write concurrent test with 10 producers and 10 consumers
3. Verify no lost items (total produced == total consumed + remaining)
4. Verify FIFO ordering under concurrency
5. Test with Hypothesis stateful testing

---

## 6.4 AI-Assisted Architecture Design

AI can help generate architecture specifications, suggest patterns, and review designs.

### Prompt Template for Architecture Specification

```
You are a software architect. Design a system specification for:

[Description of system]

Requirements:
- [Functional requirement 1]
- [Functional requirement 2]
- [Non-functional: latency, throughput, availability]
- [Constraints: budget, team size, tech stack]

Please provide:
1. Component diagram description (C4 model level 3)
2. Interface specifications (methods, parameters, return types)
3. Data flow between components
4. System invariants
5. Error handling strategy
6. Technology recommendations with justification
7. Potential trade-offs and alternatives

Format as a structured specification document with Python Protocols.
```

### Exercise 6.4: AI Architecture Review

Use the AI TA to generate an architecture specification for a **Real-Time Collaboration Tool** (like Google Docs). Then:
1. Review AI's specification for:
   - Missing components (e.g., conflict resolution, presence)
   - Incorrect assumptions (e.g., single datacenter)
   - Missing invariants (e.g., eventual consistency guarantees)
2. Improve the specification with your corrections
3. Write Protocol interfaces for all components
4. Design a state machine for the conflict resolution algorithm

---

## 6.5 Learning Journal

```markdown
## Chapter 6: Software Architecture

### Key Concepts
- [List concepts]

### Architecture Design
- [What was hardest about specifying interfaces?]
- [How did you decide what goes in each service?]

### Concurrent Systems
- [What bugs did you find in your concurrent code?]
- [How did specifications help prevent them?]

### AI Architecture Assistance
- [How useful was the AI for architecture design?]
- [What did the AI miss?]

### Confidence Level (1-10)
```

---

## Chapter Summary

- **Architecture is a specification problem:** Components, interfaces, and invariants must be defined before implementation
- **OpenAPI** provides machine-readable HTTP API specifications
- **Contract testing** verifies that implementations match specifications
- **Concurrent systems** require linearizability specifications to reason about correctness
- **System invariants** span multiple components and must hold globally
- **AI can generate** architecture specifications, but human review ensures completeness

### Key Takeaway
> **"A well-specified architecture prevents entire classes of integration bugs."**

---

## Further Reading

1. "Software Architecture in Practice" by Bass, Clements, and Kazman
2. "Designing Data-Intensive Applications" by Martin Kleppmann
3. "Building Microservices" by Sam Newman
4. OpenAPI Specification: https://spec.openapis.org/
5. "Distributed Systems" by Maarten van Steen and Andrew Tanenbaum

---

## End-of-Chapter Exercises

### Exercise 6.5: Complete Architecture Specification (Individual)

Specify a complete architecture for a **Food Delivery Platform** with:
- 8+ microservices
- Full OpenAPI specifications for 3 services
- 10+ system invariants
- Concurrent system (real-time order tracking)
- AI-reviewed and human-corrected specification

### Exercise 6.6: Architecture Review Board (Team)

In teams of 4, each team designs a different architecture for the same problem (e.g., a **Video Streaming Platform**). Then:
1. Present architectures to each other
2. Critique using a formal rubric (completeness, consistency, feasibility)
3. Vote on best architecture
4. Combine strengths into a unified design

### Exercise 6.7: Legacy System Reverse Engineering (Individual)

Take an existing open-source project (e.g., a small web framework) and:
1. Reverse-engineer its architecture specification
2. Write Protocol interfaces for all components
3. Identify missing specifications (where is the behavior undefined?)
4. Submit improvements as issues/PRs to the project

---

*Next Chapter: Verification and Validation - Beyond Testing*
