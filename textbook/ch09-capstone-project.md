# Chapter 9: Capstone Project - Bringing It All Together

## Why This Chapter Matters

> **"Knowledge is not power until it is applied."** — Adapted from Francis Bacon

This chapter is where everything converges. You will apply the entire Spec-Driven Development workflow, all formal methods tools, and AI assistance to build a complete, verified system. This is not just a final exam — it's a portfolio piece that demonstrates your capabilities as a specification-driven engineer.

---

## 9.1 Capstone Project Overview

### The Challenge

Build a complete system using the full SDD workflow with:
- **Formal specifications** for all components
- **Property-based testing** for all properties
- **Type-safe implementation** with mypy
- **AI-assisted development** (local models only)
- **Verification** at multiple levels
- **Architecture documentation** with interfaces
- **Ethical AI usage** documented and tracked

### Project Options (Choose One)

#### Option A: Verified Distributed Task Queue

```python
from dataclasses import dataclass
from enum import Enum, auto
from typing import Optional, List, Dict, Callable, Any
from datetime import datetime, timedelta

class JobStatus(Enum):
    PENDING = auto()
    RUNNING = auto()
    COMPLETED = auto()
    FAILED = auto()
    RETRYING = auto()
    DEAD_LETTER = auto()

class Priority(Enum):
    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4

@dataclass(frozen=True)
class Job:
    """
    Specification: A unit of work in the task queue.
    
    Invariants:
    - id is non-empty and unique
    - priority is one of the defined levels
    - max_retries >= 0
    - created_at <= now
    - if status is COMPLETED, completed_at is set
    - if status is FAILED and retry_count < max_retries, status should be RETRYING
    """
    id: str
    task_type: str
    payload: Dict[str, Any]
    priority: Priority
    max_retries: int
    retry_count: int = 0
    status: JobStatus = JobStatus.PENDING
    created_at: datetime = datetime.now()
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

class TaskQueue:
    """
    Specification: A distributed task queue with priority, retries, and dead-letter handling.
    
    System Invariants:
    - Jobs are processed in priority order (CRITICAL before HIGH before NORMAL before LOW)
    - Within same priority, FIFO ordering is maintained
    - A job is retried at most max_retries times
    - Failed jobs after max_retries go to dead-letter queue
    - No job is lost (all jobs end in COMPLETED, FAILED, or DEAD_LETTER)
    - Running jobs have a timeout (default 5 minutes)
    
    Operations:
    - submit(job): Add job to queue
    - claim(worker_id): Worker claims next available job
    - complete(job_id, result): Mark job as completed
    - fail(job_id, error): Mark job as failed (may trigger retry)
    - retry(job_id): Manually retry a failed job
    - get_status(job_id): Get current job status
    - get_dead_letter(): Get all dead-letter jobs
    - requeue_dead_letter(job_id): Requeue a dead-letter job
    
    Non-Functional Requirements:
    - enqueue: O(log n) by priority
    - claim: O(log n)
    - complete/fail: O(1)
    - Supports 1000+ jobs per second
    - Persistent storage (SQLite/Redis)
    - Monitoring: queue depth, processing rate, failure rate
    """
    pass
```

#### Option B: Formally-Specified API Gateway

```python
from dataclasses import dataclass
from enum import Enum, auto
from typing import Dict, List, Optional, Callable
from pydantic import BaseModel, Field, HttpUrl
import re

class RateLimitStrategy(Enum):
    TOKEN_BUCKET = auto()
    SLIDING_WINDOW = auto()
    FIXED_WINDOW = auto()

class RoutingStrategy(Enum):
    ROUND_ROBIN = auto()
    LEAST_CONNECTIONS = auto()
    IP_HASH = auto()
    RANDOM = auto()

@dataclass
class ServiceEndpoint:
    """Specification: A backend service endpoint."""
    id: str
    url: str
    health_check_url: str
    weight: int = 1
    max_connections: int = 100
    current_connections: int = 0
    is_healthy: bool = True
    last_health_check: Optional[datetime] = None

class APIGateway:
    """
    Specification: An API Gateway with routing, rate limiting, authentication, and circuit breaking.
    
    System Invariants:
    - Rate limits are enforced per-client (by API key or IP)
    - Unhealthy endpoints are not routed to until health check passes
    - Circuit breaker opens after 50% failure rate in 1 minute window
    - Circuit breaker closes after 1 minute of health checks passing
    - All requests are logged with trace_id
    - Response time is tracked per endpoint
    
    Components:
    - Router: Routes requests to backend services
    - RateLimiter: Enforces rate limits per client
    - AuthManager: Validates JWT tokens and API keys
    - CircuitBreaker: Monitors endpoint health
    - LoadBalancer: Distributes load across healthy endpoints
    - Logger: Logs all requests with trace_id
    - Metrics: Collects response times, error rates, throughput
    
    Non-Functional Requirements:
    - P99 latency < 100ms for routing decision
    - Rate limit check < 1ms
    - Auth check < 10ms (with caching)
    - Supports 10,000+ requests per second
    - Configurable without restart (hot reload)
    """
    pass
```

#### Option C: Type-Safe Configuration Language

```python
from dataclasses import dataclass
from typing import Dict, List, Union, Optional, Any
from enum import Enum
import re

class ConfigType(Enum):
    STRING = "string"
    INT = "int"
    FLOAT = "float"
    BOOL = "bool"
    LIST = "list"
    DICT = "dict"
    REF = "ref"  # Reference to another config value

@dataclass
class ConfigSchema:
    """
    Specification: A schema for validating configuration files.
    
    Invariants:
    - All required fields must be present
    - Types must match schema
    - References must resolve to existing values
    - No circular references
    - Environment variables must resolve or have defaults
    """
    pass

class ConfigParser:
    """
    Specification: A type-safe configuration parser with validation.
    
    Features:
    - Supports JSON, YAML, and TOML input formats
    - Schema validation with detailed error messages
    - Type coercion with validation
    - Environment variable substitution
    - Config references (e.g., ${database.host})
    - Default values for missing optional fields
    - Conditional configuration (environment-specific)
    
    Grammar (BNF):
    config     ::= section*
    section    ::= identifier '{' key_value* '}'
    key_value  ::= identifier '=' value
    value      ::= string | number | bool | list | reference
    reference  ::= '${' identifier ('.' identifier)* '}'
    list       ::= '[' value (',' value)* ']'
    
    Properties:
    - Parsing is deterministic (same input -> same output)
    - Invalid configs are rejected with clear error messages
    - Type errors include line numbers and context
    - References are resolved at parse time, not runtime
    """
    pass
```

---

## 9.2 Capstone Project Phases

### Phase 1: Requirements and Specification (Week 1)

**Deliverable:** Complete specification document

```markdown
# Specification Document Template

## 1. Problem Statement
- What problem does this system solve?
- Who are the users?
- What are the success criteria?

## 2. System Architecture
- Component diagram (C4 Level 3)
- Interface specifications (Protocols)
- Data flow diagram
- State machine diagrams (if applicable)

## 3. Component Specifications
- For each component:
  - Interface (methods, parameters, return types)
  - Pre-conditions
  - Post-conditions
  - Invariants
  - Error conditions

## 4. System Invariants
- Global properties that must hold
- Cross-component constraints
- Consistency requirements

## 5. Non-Functional Requirements
- Performance targets
- Scalability limits
- Reliability requirements
- Security requirements

## 6. AI Usage Plan
- How AI will be used in each phase
- Verification strategy for AI output
- Ethics tracking plan
```

### Phase 2: Test Design (Week 2)

**Deliverable:** Complete test suite (before implementation!)

```python
# test_suite.py
"""
Capstone Test Suite - All tests written before implementation.

Categories:
1. Unit tests for each component
2. Property-based tests for all properties
3. Integration tests for component interactions
4. State machine tests for concurrent behavior
5. Performance tests for NFRs
6. Security tests (input validation, injection prevention)
"""

import pytest
from hypothesis import given, settings, strategies as st

# TODO: Write all tests based on specification
# This should be 100+ tests total
```

### Phase 3: Implementation (Weeks 3-4)

**Deliverable:** Working implementation with full type annotations

```python
# Implementation rules:
# 1. All functions have type annotations
# 2. All functions have docstrings with pre/post conditions
# 3. All invariants are checked (assertions or deal)
# 4. AI can generate code, but must be reviewed
# 5. Every line of AI-generated code must be verified
```

### Phase 4: Verification and Validation (Week 5)

**Deliverable:** Verification report

```markdown
# Verification Report

## Static Analysis
- mypy --strict: [X] errors, [Y] warnings
- pylint score: [score]
- bandit issues: [count]
- Code coverage: [percentage]

## Testing
- Unit tests: [count] passed
- Property-based tests: [count] passed, [examples] generated
- Integration tests: [count] passed
- State machine tests: [count] passed
- Performance tests: [results]

## Model Checking (if applicable)
- States explored: [count]
- Properties verified: [count]
- Counterexamples found: [count]

## AI Accuracy
- AI-generated specifications: [count]
- AI-generated tests: [count]
- AI-generated code: [count] lines
- Corrections made: [count]
- AI accuracy: [percentage]
```

### Phase 5: Documentation and Presentation (Week 6)

**Deliverable:** Complete project documentation and presentation

```markdown
# Project Documentation

## Architecture Overview
[Diagrams and descriptions]

## API Documentation
[OpenAPI spec if applicable]

## Testing Guide
[How to run tests, what they verify]

## AI Usage Log
[Complete log of AI assistance]

## Ethical Considerations
[How AI was used responsibly]

## Lessons Learned
[What worked, what didn't, what you'd do differently]
```

---

## 9.3 Evaluation Rubric

### Specification Quality (25%)
| Criterion | Excellent (90-100) | Good (70-89) | Adequate (50-69) | Poor (0-49) |
|-----------|-------------------|--------------|------------------|-------------|
| Completeness | All pre/post conditions, invariants, edge cases | Most conditions specified | Some conditions missing | Minimal specification |
| Consistency | No contradictions, all properties compatible | Minor inconsistencies | Some contradictions | Major contradictions |
| Clarity | Unambiguous, precise, examples provided | Mostly clear | Somewhat ambiguous | Unclear or vague |
| AI Review | AI reviewed, corrections documented | AI reviewed, minor corrections | AI used but not reviewed | No AI review |

### Implementation Quality (25%)
| Criterion | Excellent | Good | Adequate | Poor |
|-----------|-----------|------|----------|------|
| Type Safety | mypy --strict clean | Minor type issues | Some type issues | Many type errors |
| Specification Adherence | All specs implemented | Minor deviations | Some deviations | Major deviations |
| Code Quality | Clean, documented, tested | Mostly clean | Some issues | Poor quality |
| AI Integration | AI used wisely, verified | AI used, mostly verified | Some unverified AI code | Blind AI usage |

### Testing Quality (25%)
| Criterion | Excellent | Good | Adequate | Poor |
|-----------|-----------|------|----------|------|
| Coverage | 100% branch coverage | 90%+ coverage | 70%+ coverage | <70% coverage |
| Property Tests | 5+ properties per component | 3-4 properties | 1-2 properties | None |
| Edge Cases | All edge cases tested | Most edge cases | Some edge cases | Missing edge cases |
| Integration | Full integration testing | Partial integration | Minimal integration | No integration |

### Verification (15%)
| Criterion | Excellent | Good | Adequate | Poor |
|-----------|-----------|------|----------|------|
| Static Analysis | All tools, zero issues | Most tools, minor issues | Some tools | Minimal analysis |
| Model Checking | Applied where applicable | Attempted | Not attempted | Not applicable |
| Runtime Verification | Contracts on all public methods | Most methods | Some methods | Minimal |

### Documentation & Presentation (10%)
| Criterion | Excellent | Good | Adequate | Poor |
|-----------|-----------|------|----------|------|
| Architecture Docs | Complete C4 diagrams, interfaces | Mostly complete | Partial | Minimal |
| AI Usage Log | Complete, reflective, honest | Good log | Basic log | No log |
| Presentation | Clear, engaging, defensible | Good presentation | Adequate | Poor |
| Ethical Reflection | Deep, personal, actionable | Good reflection | Basic | Minimal |

---

## 9.4 Learning Journal - Final Reflection

```markdown
# Final Course Reflection

## What I Learned
### About Formal Methods
- [3-5 key insights]

### About Software Engineering
- [How has your approach changed?]

### About AI
- [How do you use AI differently now?]

### About Myself
- [What was your biggest challenge? How did you overcome it?]

## What I Built
- [Describe your capstone project]
- [What are you most proud of?]
- [What would you improve?]

## Impact Metrics
### Productivity
- [How much faster do you write correct code now?]
- [How much less time do you spend debugging?]

### Quality
- [How many bugs did your specifications catch before implementation?]
- [How confident are you in your code?]

### AI Literacy
- [How do you evaluate AI output?]
- [When do you trust AI vs. override it?]

## The Future
- [How will you use these skills in your career?]
- [What will you learn next?]
- [How will you teach others?]

## Overall Confidence (1-10)
```

---

## 9.5 Course Impact Assessment

### Pre-Course vs. Post-Course Self-Assessment

```markdown
# Impact Assessment

## Specification Skills
- [ ] Before: I wrote code first, then tests
- [ ] After: I write specifications first, then code

## Bug Prevention
- [ ] Before: I found bugs through testing
- [ ] After: I prevent bugs through specification

## AI Usage
- [ ] Before: I copy-pasted AI output without review
- [ ] After: I verify and correct AI-generated code

## Architecture Thinking
- [ ] Before: I jumped into implementation
- [ ] After: I design interfaces and invariants first

## Verification Confidence
- [ ] Before: "I think it works"
- [ ] After: "I can prove it works (for certain properties)"

## Career Readiness
- [ ] Before: I knew Python syntax
- [ ] After: I know how to engineer reliable software
```

---

## Chapter Summary

- **The capstone project** is the culmination of everything you've learned
- **Six phases** ensure systematic, specification-driven development
- **Evaluation is multi-faceted** covering specification, implementation, testing, verification, and reflection
- **AI is a tool** that must be used wisely and documented honestly
- **The goal is not just a working system** but a verified, well-specified, maintainable system
- **Impact is measured** by your ability to prevent bugs before they happen

### Final Key Takeaway
> **"The best software engineers are not those who write the most code, but those who write the right code — and can prove it."**

---

## Appendix: Capstone Project Checklist

### Before Starting
- [ ] Read the complete specification document
- [ ] Form a team (if team project)
- [ ] Set up development environment (Python, mypy, Ollama)
- [ ] Choose project option and get approval
- [ ] Set up Git repository with proper structure

### During Development
- [ ] Write specification before any code
- [ ] Write tests before implementation
- [ ] Run mypy --strict on every commit
- [ ] Log all AI usage in the ethics tracker
- [ ] Review all AI-generated code before committing
- [ ] Test all properties with Hypothesis
- [ ] Document all design decisions

### Before Submission
- [ ] All tests pass (pytest -v)
- [ ] mypy --strict is clean
- [ ] bandit reports no security issues
- [ ] Code coverage is 90%+
- [ ] Specification document is complete
- [ ] AI usage log is complete
- [ ] Learning journal is complete
- [ ] Final reflection is thoughtful and honest
- [ ] Presentation slides are ready
- [ ] Demo is tested and working

---

*Congratulations on completing this course. You are now a specification-driven engineer. Go build amazing things.*
