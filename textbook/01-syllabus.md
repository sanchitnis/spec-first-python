# Course Syllabus: Formal Methods for AI-Augmented Software Engineering

## Course Code: CSE-3504 | Credits: 4 | Duration: 16 Weeks

---

## Module 1: Foundations of Formal Thinking (Weeks 1-3)

### Week 1: The Specification Mindset
- **Topic:** Why specifications matter more than code
- **Concepts:** Formal vs. informal specifications, pre-conditions, post-conditions
- **Python Focus:** Type hints with `mypy`, basic assertions
- **AI Integration:** Using local LLM to generate specifications from requirements
- **Exercise:** Write specifications for 5 common algorithms (sort, search, etc.)
- **Lab:** Set up local AI environment (Ollama), generate specs for a simple API
- **Reading:** Dijkstra's "On the Cruelty of Really Teaching Computing Science"

### Week 2: Propositions, Predicates, and Python
- **Topic:** Logic as the foundation of software correctness
- **Concepts:** Propositional logic, predicate calculus, quantifiers
- **Python Focus:** `z3-solver` for satisfiability checking, SMT basics
- **AI Integration:** AI-assisted invariant discovery
- **Exercise:** Prove properties of array operations using Z3
- **Lab:** Build a simple theorem prover for Python functions
- **Reading:** "How to Prove It" (Velleman) - Chapter 1-2

### Week 3: Types as Specifications
- **Topic:** Type systems as lightweight formal methods
- **Concepts:** Static typing, generic types, dependent types (brief), refinement types
- **Python Focus:** Advanced `mypy`, `pydantic` for validation, `deal` for contracts
- **AI Integration:** AI-generated type annotations and validation schemas
- **Exercise:** Model a domain (e.g., banking transactions) with strict types
- **Lab:** Build a type-safe configuration parser
- **Reading:** "Types and Programming Languages" (Pierce) - Selected sections

---

## Module 2: Spec-Driven Development (Weeks 4-7)

### Week 4: From Requirements to Specifications
- **Topic:** The SDD methodology
- **Concepts:** User stories → formal specs, acceptance criteria as properties, BDD/TDD vs. SDD
- **Python Focus:** `pytest` with property-based extensions, `hypothesis` introduction
- **AI Integration:** Converting natural language requirements to formal specs
- **Exercise:** Write formal specs for a library management system
- **Lab:** Implement a feature using SDD workflow with AI assistance
- **Reading:** "Specifying Systems" (Lamport) - Chapter 1-3

### Week 5: Pre-conditions, Post-conditions, and Invariants
- **Topic:** Design by Contract
- **Concepts:** Hoare logic, loop invariants, class invariants, Eiffel-style contracts
- **Python Focus:** `deal` library, `icontract`, `assertions` as contracts
- **AI Integration:** AI-suggested invariants, automated contract generation
- **Exercise:** Implement a binary search with full contract specification
- **Lab:** Build a contract-verified stack and queue
- **Reading:** "Object-Oriented Software Construction" (Meyer) - Contracts chapter

### Week 6: Property-Based Testing
- **Topic:** Testing that generalizes
- **Concepts:** Properties vs. examples, generators, shrinking, stateful testing
- **Python Focus:** `hypothesis` deep dive, custom strategies, state machines
- **AI Integration:** AI-generated property suggestions, test oracle generation
- **Exercise:** Find bugs in "obviously correct" code using PBT
- **Lab:** Build a property-tested parser for a simple language
- **Reading:** "Property-Based Testing with PropEr, Erlang, and Elixir" (Hébert)

### Week 7: Model Checking and State Explosion
- **Topic:** Exhaustive verification of finite systems
- **Concepts:** Kripke structures, LTL, CTL, model checking algorithms, state space explosion
- **Python Focus:** `pymc` or `mcpython` for model checking, state machine implementations
- **AI Integration:** AI-assisted state machine generation from requirements
- **Exercise:** Model check a simple concurrent protocol
- **Lab:** Build and verify a state machine for a traffic light controller
- **Reading:** "Principles of Model Checking" (Baier & Katoen) - Selected sections

---

## Module 3: Software Architecture & AI (Weeks 8-11)

### Week 8: Architectural Specifications
- **Topic:** Specifying systems, not just functions
- **Concepts:** Component interfaces, protocols, architectural styles (microservices, monoliths, event-driven)
- **Python Focus:** `interface` design, protocol classes, `structlog` for traceability
- **AI Integration:** AI-generated architecture documentation, interface suggestions
- **Exercise:** Design and specify a microservices architecture for an e-commerce platform
- **Lab:** Build a service with specified interfaces using FastAPI
- **Reading:** "Software Architecture in Practice" (Bass, Clements, Kazman) - Chapter 1-4

### Week 9: API Specifications and Verification
- **Topic:** Contracts at the system boundary
- **Concepts:** OpenAPI, JSON Schema, API versioning, backward compatibility
- **Python Focus:** `fastapi` with OpenAPI, `schemathesis` for API testing, `pact` for consumer-driven contracts
- **AI Integration:** AI-generated OpenAPI specs from code, test generation from specs
- **Exercise:** Build an API with complete specification and automated verification
- **Lab:** Implement consumer-driven contract testing for a microservices system
- **Reading:** "Designing Web APIs" (Jin & Sahni) - Selected chapters

### Week 10: Concurrency and Distributed Systems
- **Topic:** The hardest problem in software, specified
- **Concepts:** Race conditions, deadlocks, consensus, CAP theorem, linearizability
- **Python Focus:** `asyncio` with formal reasoning, `threading` safety, `ray` for distributed
- **AI Integration:** AI-suggested concurrency patterns, race condition detection
- **Exercise:** Specify and implement a thread-safe bounded buffer
- **Lab:** Build a distributed consensus simulation (Raft-lite)
- **Reading:** "Designing Data-Intensive Applications" (Kleppmann) - Chapters 7-9

### Week 11: Refactoring with Specifications
- **Topic:** Safe code evolution
- **Concepts:** Behavioral equivalence, refactoring catalogs, regression testing, specification preservation
- **Python Focus:** `rope` for refactoring, `pytest` for regression, `mypy` for type safety
- **AI Integration:** AI-assisted refactoring with specification preservation, impact analysis
- **Exercise:** Refactor a legacy system while maintaining specifications
- **Lab:** Specification-driven refactoring of a monolith to microservices
- **Reading:** "Refactoring" (Fowler) - Selected chapters with formal perspective

---

## Module 4: Advanced Topics & AI Integration (Weeks 12-14)

### Week 12: Formal Methods in Industry
- **Topic:** When and how to use formal methods professionally
- **Concepts:** Cost-benefit analysis, lightweight vs. heavyweight methods, tool selection
- **Python Focus:** Case studies using Python tools in production (NASA, Dropbox, etc.)
- **AI Integration:** AI-assisted formal verification, Copilot for proof assistants
- **Exercise:** Analyze a real-world system and propose formal method integration
- **Lab:** Interview preparation with specification challenges
- **Reading:** Industry case studies (Amazon TLA+, Microsoft Dafny, etc.)

### Week 13: AI-Augmented Development Workflows
- **Topic:** Building the future of software engineering
- **Concepts:** Human-AI collaboration patterns, specification-to-code pipelines, AI review processes
- **Python Focus:** Building custom AI assistants with local models, `langchain` for local LLMs
- **AI Integration:** The meta-topic: using AI to teach AI-augmented development
- **Exercise:** Design an AI-assisted development workflow for a team project
- **Lab:** Build a custom AI coding assistant for your project
- **Reading:** Research papers on AI-assisted software engineering (2023-2024)

### Week 14: Security, Privacy, and Ethics
- **Topic:** Formal methods for trustworthy systems
- **Concepts:** Security properties, information flow, privacy by design, ethical AI
- **Python Focus:** `cryptography` library, type-safe security patterns, formal privacy models
- **AI Integration:** AI-generated security specifications, threat modeling assistance
- **Exercise:** Specify security properties for a banking API
- **Lab:** Build a formally-specified authentication system
- **Reading:** "Security Engineering" (Anderson) - Selected chapters

---

## Module 5: Capstone Project (Weeks 15-16)

### Week 15: Capstone Design and Specification
- **Team Formation:** 3-4 students per team
- **Project Selection:** Choose from curated list or propose own
- **Deliverable:** Complete specification document, architecture design, AI workflow plan
- **Mentorship:** AI TA + faculty guidance

### Week 16: Capstone Implementation and Presentation
- **Implementation:** Build the specified system with AI assistance
- **Verification:** Demonstrate correctness through testing and review
- **Presentation:** Defend design decisions and AI usage in public review
- **Documentation:** Complete project report with impact metrics

---

## Capstone Project Options

1. **Verified Distributed Task Queue**
   - Specify: Job scheduling, priority, retries, dead-letter handling
   - Tech: Python, asyncio, Redis, property-based testing
   - AI Use: Specification generation, code generation from specs, invariant suggestion

2. **Formally-Specified API Gateway**
   - Specify: Rate limiting, routing, authentication, circuit breaker
   - Tech: FastAPI, OpenAPI, JSON Schema, contract testing
   - AI Use: OpenAPI generation, test generation, documentation

3. **Property-Tested Configuration Language**
   - Specify: Grammar, semantics, type system, validation rules
   - Tech: Python, PLY/Lark parser, Hypothesis, Z3
   - AI Use: Grammar suggestion, property generation, bug detection

4. **AI-Assisted Specification Workbench**
   - Specify: The tool itself (meta!)
   - Tech: Python, local LLM, web framework, formal methods library
   - AI Use: Natural language to specification translation, review assistance

5. **Verified Consensus Protocol Implementation**
   - Specify: Safety, liveness, leader election, log replication
   - Tech: Python, asyncio, state machine testing, model checking
   - AI Use: State machine generation, invariant suggestion, proof assistance

6. **Type-Safe Data Pipeline Framework**
   - Specify: Type preservation, data validation, error handling, backpressure
   - Tech: Python, pydantic, mypy, hypothesis, asyncio
   - AI Use: Schema generation, type inference, pipeline optimization

---

## Assessment Rubric

### Weekly Exercises (20%)
- Specification completeness: 30%
- Implementation correctness: 30%
- AI tool usage quality: 20%
- Reflection quality: 20%

### Lab Assignments (25%)
- Working code: 40%
- Test coverage: 25%
- Specification adherence: 25%
- Documentation: 10%

### Mid-Term Project (15%)
- System design: 30%
- Specification quality: 30%
- Implementation: 25%
- Presentation: 15%

### Capstone Project (25%)
- Specification document: 20%
- Architecture quality: 20%
- Implementation correctness: 25%
- AI integration: 15%
- Final presentation: 20%

### Final Examination (15%)
- Theory: 50%
- Problem solving: 35%
- Design: 15%

---

## Textbook and Resources

### Primary Textbook
- **This Course Textbook** (Open Access, CC BY-SA 4.0)

### Reference Books
- "Specifying Systems" by Leslie Lamport
- "Types and Programming Languages" by Benjamin Pierce
- "Designing Data-Intensive Applications" by Martin Kleppmann
- "Python in a Nutshell" by Alex Martelli (for Python reference)
- "Architecture Patterns with Python" by Harry Percival

### Tools and Software
- Python 3.11+
- VS Code with extensions
- Git and GitHub/GitLab
- Ollama (local LLM)
- Docker (for distributed systems labs)

### Online Resources
- Course website (interactive labs, AI TA)
- Z3 tutorial and documentation
- Hypothesis documentation
- FastAPI documentation
- TLA+ video course (Lamport)

---

## Prerequisites

- **Data Structures and Algorithms:** Comfortable with trees, graphs, sorting, searching
- **Object-Oriented Programming:** Classes, inheritance, polymorphism, design patterns
- **Discrete Mathematics:** Logic, set theory, relations, proof techniques
- **Basic Software Engineering:** Version control, testing basics, debugging
- **Python Programming:** Intermediate level, comfortable with standard library

---

## Course Philosophy

> **"We don't teach students to code faster. We teach them to code correctly, and let AI handle the speed."**

This course bridges the gap between academic computer science and industry software engineering. Students learn that formal methods are not academic luxuries but practical tools for building reliable systems. The AI component ensures they are prepared for the future of software engineering, where human expertise in specification and verification is amplified by intelligent tools.

---

*Syllabus Version 1.0 | Approved for 3rd Year BTech CSE*
