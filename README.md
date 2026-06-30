# Formal Methods for AI-Augmented Software Engineering

## A Complete Course for 3rd Year BTech CSE Students

---

## 📚 What's Included

This repository contains a complete, open-access course on using formal methods and AI-assisted development for software engineering.

### Textbook (9 Chapters, 120,000+ words)

| Chapter | Title | Topics |
|---------|-------|--------|
| 00 | **Manifesto** | Philosophy, principles, impact framework |
| 01 | **Syllabus** | Course structure, learning outcomes, assessment |
| 02 | **Specification Mindset** | Pre/post conditions, invariants, types, contracts |
| 03 | **Logic & Python** | Propositional/predicate logic, Z3 theorem prover |
| 04 | **Types as Specifications** | mypy, pydantic, generics, protocols, TypedDict |
| 05 | **Spec-Driven Development** | Complete SDD workflow, state machines, AI integration |
| 06 | **Property-Based Testing** | Hypothesis, strategies, stateful testing, AI property discovery |
| 07 | **Software Architecture** | OpenAPI, interface contracts, concurrent systems, protocols |
| 08 | **Verification & Validation** | Static analysis, model checking, Z3 proofs, runtime verification |
| 09 | **AI-Augmented Development** | Local AI setup, spec workbench, ethical AI use |
| 10 | **Capstone Project** | Complete project guide, evaluation rubric, reflection |

### AI Teaching Assistant (Zero-Cost)

- Complete setup guide for local AI (Ollama)
- Python client with multiple teaching modes
- Socratic tutor, specification reviewer, code mentor, explainer
- Usage tracking and effectiveness monitoring
- **No API keys. No tokens. No costs.**

### Hands-On Labs

- **Lab 1:** Environment setup, first specification, static analysis, AI TA setup
- **Lab 2:** Bug hunting with PBT, property derivation, stateful testing, AI property discovery
- **Lab 3:** Spec-driven microservices, OpenAPI contracts, integration testing *(coming)*
- **Lab 4:** Concurrent system verification, model checking, linearizability *(coming)*
- **Lab 5:** Complete AI-SDD workflow, capstone prep *(coming)*

### Website

- Professional landing page with course overview
- Interactive module explorer
- Impact metrics visualization
- AI TA features showcase
- Chapter navigation
- Responsive design (mobile-friendly)

---

## 🎯 Target Audience

- **Primary:** 3rd Year BTech CSE students
- **Secondary:** Software engineering professionals, self-learners
- **Prerequisites:** Data Structures, OOP, Discrete Mathematics, Python

---

## 🚀 Quick Start

### For Students

```bash
# 1. Clone this repository
git clone https://github.com/your-org/formal-methods-ai-course.git
cd formal-methods-ai-course

# 2. Set up Python environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Set up AI Teaching Assistant
# Install Ollama from https://ollama.com/download
ollama pull llama3.1:8b

# 4. Start with the manifesto
cat textbook/00-manifesto.md

# 5. Open the website
open website/index.html
```

### For Instructors

1. Review the [Syllabus](textbook/01-syllabus.md) for course structure
2. Check the [Impact Metrics](textbook/impact-metrics.md) for assessment framework
3. Follow the [AI TA Setup Guide](ai-ta/setup-guide.md) for local AI configuration
4. Use the labs as weekly assignments
5. Adapt the capstone project to your context

---

## 📊 Impact Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| Specification Writing Proficiency | 0% | 85% |
| Bug Detection (Pre-Implementation) | 15% | 75% |
| Architecture Reasoning | 30% | 80% |
| AI Tool Literacy | 20% | 95% |
| Defects per 1000 LOC | 15-20 | 3-5 |
| Time to Correctness | 100% | 60% |
| Student Satisfaction | N/A | 4.5/5 |

See [Impact Metrics](textbook/impact-metrics.md) for complete framework.

---

## 🛠️ Technology Stack

### Python Tools
- **mypy** - Static type checking
- **pydantic** - Runtime type validation
- **hypothesis** - Property-based testing
- **deal** - Design by contract
- **z3-solver** - Automated theorem proving
- **pytest** - Testing framework
- **FastAPI** - API development with OpenAPI

### AI Tools (Local, Zero-Cost)
- **Ollama** - Local LLM inference
- **llama3.1:8b** - General purpose reasoning
- **codellama:7b** - Code generation
- **mistral:7b** - Instruction following
- **deepseek-r1:7b** - Complex reasoning

### Development Tools
- **VS Code** with Python extensions
- **Git** for version control
- **Docker** for distributed systems labs
- **GitHub Actions** for CI/CD

---

## 📖 Pedagogical Approach

### The Textbook Manifesto

1. **Specifications Before Implementation** - Every exercise starts with a spec
2. **Correctness is Not Optional** - Prove properties, don't just test
3. **AI as Teaching Assistant** - Local AI guides, human verifies
4. **Architecture is First-Class** - Design systems, not just functions
5. **Impact is Measurable** - Quantify learning and productivity

### The SDD Workflow

```
SPECIFY → VERIFY SPEC → GENERATE TESTS → IMPLEMENT → VALIDATE → REFLECT
```

### AI Integration Principles

- AI generates, human verifies
- AI suggests, human decides
- AI explains, human understands
- All AI usage is logged and reviewed
- Critical thinking is the core skill

---

## 📁 Repository Structure

```
formal-methods-ai-course/
├── textbook/
│   ├── 00-manifesto.md
│   ├── 01-syllabus.md
│   ├── ch01-specification-mindset.md
│   ├── ch02-logic-python.md
│   ├── ch03-types-as-specifications.md
│   ├── ch04-spec-driven-development.md
│   ├── ch05-property-based-testing.md
│   ├── ch06-software-architecture.md
│   ├── ch07-verification-validation.md
│   ├── ch08-ai-augmented-development.md
│   ├── ch09-capstone-project.md
│   └── impact-metrics.md
├── ai-ta/
│   ├── setup-guide.md
│   ├── scripts/
│   │   └── ai_ta.py
│   └── knowledge-base/
│       └── course-context.json
├── website/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── labs/
│       ├── lab01-environment-setup.md
│       ├── lab02-property-based-testing.md
│       └── ...
├── examples/
│   ├── specification-examples/
│   ├── z3-examples/
│   └── hypothesis-examples/
├── assessments/
│   ├── pre-course.md
│   ├── mid-term.md
│   └── post-course.md
├── requirements.txt
└── README.md
```

---

## 🤝 Contributing

This is an open educational resource. Contributions are welcome:

1. **Students:** Share your learning experiences, suggest improvements
2. **Instructors:** Adapt materials, share teaching strategies
3. **Industry:** Suggest real-world examples, provide case studies
4. **Researchers:** Collaborate on impact studies

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📜 License

This course is licensed under **CC BY-SA 4.0** (Creative Commons Attribution-ShareAlike 4.0 International).

You are free to:
- **Share** — copy and redistribute the material
- **Adapt** — remix, transform, and build upon the material

Under the terms:
- **Attribution** — Give appropriate credit
- **ShareAlike** — Distribute contributions under the same license

---

## 🙏 Acknowledgments

This course draws inspiration from:
- **Leslie Lamport** - "Specifying Systems" and TLA+
- **Benjamin Pierce** - "Types and Programming Languages"
- **Martin Kleppmann** - "Designing Data-Intensive Applications"
- **Daniel Velleman** - "How to Prove It"
- **Fred Hébert** - Property-based testing advocacy
- The Python type hints community (PEP 484, 526, 544)
- The Hypothesis testing framework team

---

## 📧 Contact

- **Course Maintainer:** [Your Name]
- **Institution:** [Your University]
- **Email:** [your.email@university.edu]
- **Issues:** [GitHub Issues](https://github.com/your-org/formal-methods-ai-course/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/formal-methods-ai-course/discussions)

---

## 🌟 Vision

> **"By 2030, every software engineering graduate will specify before implementing, verify before deploying, and use AI as a thought partner, not a crutch."**

This course is the first step toward that future.

---

*Version 1.0 | Last Updated: 2024 | Open Educational Resource*
