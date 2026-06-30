# Chapter 8: AI-Augmented Development and Emerging Methods

## Why This Chapter Matters

> **"AI is not replacing engineers. Engineers who use AI are replacing engineers who don't."**

This chapter brings together everything you've learned about formal methods and shows how AI can amplify your capabilities. You will learn to use local AI models (no API costs) as specification assistants, code generators, and verification partners. The goal is not to replace human judgment but to augment it.

---

## 8.1 The AI-Augmented Development Workflow

### The Human-AI Partnership Model

```
┌─────────────────────────────────────────────────────────┐
│  HUMAN                    │  AI                         │
├─────────────────────────────────────────────────────────┤
│  Define requirements      │  Generate specifications    │
│  Review specifications    │  Suggest edge cases         │
│  Verify correctness       │  Generate tests             │
│  Make design decisions    │  Suggest alternatives         │
│  Validate AI output       │  Generate implementations   │
│  Ensure ethical use       │  Explain complex concepts   │
│  Own the final code       │  Refine based on feedback   │
└─────────────────────────────────────────────────────────┘
```

### The AI Wisdom Boundary

Students must learn to critically evaluate AI output. This is a core skill.

```python
# Example: AI-generated code that LOOKS correct but is wrong

def ai_generated_binary_search(arr, target):
    """
    AI-generated binary search (APPEARS correct but has bug).
    """
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2  # Bug: potential overflow in other languages
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# The bug: In Python, integer overflow isn't an issue, but the AI
# didn't include pre-conditions (sorted array) and doesn't handle
# edge cases like empty arrays consistently.
# A human engineer must verify: add contracts, add tests, validate.
```

---

## 8.2 Setting Up the Local AI Environment

### Zero-Cost AI Stack

```bash
# Step 1: Install Ollama (free, runs locally)
# https://ollama.com/download

# Step 2: Pull a lightweight model
ollama pull llama3.1:8b        # 8B parameters, runs on CPU
ollama pull codellama:7b       # Code-optimized, good for Python
ollama pull mistral:7b         # Strong reasoning, good for specs

# Step 3: Test
ollama run llama3.1:8b
```

### Python Integration with Ollama

```python
import requests
import json
from typing import Optional, Dict, Any

class LocalAI:
    """
    Specification: Local AI assistant for specification-driven development.
    
    Invariants:
    - model_name is one of the installed models
    - temperature is between 0.0 and 1.0
    - max_tokens is positive
    """
    
    def __init__(self, model: str = "llama3.1:8b", temperature: float = 0.7):
        self.model = model
        self.temperature = temperature
        self.base_url = "http://localhost:11434"
    
    def generate(self, prompt: str, system: Optional[str] = None) -> str:
        """
        Generate text from the local model.
        
        Pre: prompt is non-empty
        Post: Returns non-empty string
        """
        assert prompt, "Pre-condition: prompt must not be empty"
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": self.temperature
            }
        }
        
        if system:
            payload["system"] = system
        
        response = requests.post(
            f"{self.base_url}/api/generate",
            json=payload
        )
        response.raise_for_status()
        
        result = response.json()
        return result.get("response", "")
    
    def generate_specification(self, requirement: str) -> str:
        """
        Specialized method for generating specifications.
        
        Pre: requirement is non-empty
        Post: Returns a structured specification with pre/post conditions
        """
        system_prompt = """You are a formal methods expert. Given a requirement, 
        generate a complete Python specification including:
        1. Function signature with type hints
        2. Pre-conditions
        3. Post-conditions
        4. Examples in doctest format
        5. Edge cases to consider
        
        Format the output as a Python docstring with clear sections."""
        
        return self.generate(requirement, system=system_prompt)
    
    def generate_tests(self, specification: str) -> str:
        """
        Generate test cases from a specification.
        
        Pre: specification is non-empty
        Post: Returns pytest + Hypothesis test code
        """
        system_prompt = """You are a testing expert. Given a specification, 
        generate a complete test suite using pytest and Hypothesis including:
        1. Unit tests for each example in the docstring
        2. Property-based tests for each post-condition
        3. Edge case tests
        4. Invariant tests if applicable
        
        Output complete, runnable Python test code."""
        
        return self.generate(specification, system=system_prompt)
    
    def review_code(self, code: str, specification: str) -> str:
        """
        Review code against a specification.
        
        Pre: code and specification are non-empty
        Post: Returns a review report listing deviations
        """
        prompt = f"""Review this implementation against its specification.
        
        Specification:
        {specification}
        
        Implementation:
        {code}
        
        Report:
        1. Does the implementation satisfy all pre-conditions?
        2. Does the implementation satisfy all post-conditions?
        3. What edge cases are not handled?
        4. What improvements would you suggest?
        """
        
        return self.generate(prompt)

# Usage example
ai = LocalAI(model="codellama:7b")

# Generate specification
spec = ai.generate_specification(
    "A function that takes a list of integers and returns a new list with all duplicates removed, preserving order of first occurrence."
)
print(spec)

# Generate tests from specification
tests = ai.generate_tests(spec)
print(tests)
```

### Exercise 8.1: Build Your AI Assistant

Extend the `LocalAI` class with these features:
1. **Conversation history** (maintain context across calls)
2. **Specification comparison** (compare two specs for consistency)
3. **Code generation** with verification (generate code AND tests together)
4. **Learning mode** (ask the AI to explain concepts rather than just generate)
5. **Error analysis** (given an error, suggest specification fixes)

**Requirements:**
1. All methods have complete type annotations
2. All methods have pre/post conditions (assertions)
3. Unit tests for the AI assistant itself (meta!)
4. Error handling for model not available, timeout, etc.
5. Logging of all AI interactions for review

---

## 8.3 AI-Powered Specification Workbench

Build a complete tool that uses AI to assist with specification-driven development.

```python
from dataclasses import dataclass
from typing import List, Optional
from enum import Enum
import json

class SpecQuality(Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    NEEDS_WORK = "needs_work"
    INCOMPLETE = "incomplete"

@dataclass
class SpecificationReview:
    """Result of an AI specification review."""
    completeness_score: float  # 0.0 - 1.0
    clarity_score: float
    consistency_score: float
    issues: List[str]
    suggestions: List[str]
    quality: SpecQuality

class SpecWorkbench:
    """
    Specification workbench powered by local AI.
    
    Features:
    - Natural language to specification translation
    - Specification completeness checking
    - Specification consistency verification
    - Test generation from specifications
    - Code generation from verified specifications
    """
    
    def __init__(self, ai: LocalAI):
        self.ai = ai
    
    def translate_requirement(self, natural_language: str) -> str:
        """Convert natural language to formal specification."""
        return self.ai.generate_specification(natural_language)
    
    def review_specification(self, spec: str) -> SpecificationReview:
        """Review a specification for quality."""
        review_prompt = f"""
        Review this specification for:
        1. Completeness (are all pre/post conditions specified?)
        2. Clarity (is the specification unambiguous?)
        3. Consistency (are there contradictions?)
        4. Edge cases (are boundary conditions specified?)
        
        Specification:
        {spec}
        
        Provide scores (0.0-1.0) and a list of issues and suggestions.
        Format as JSON with keys: completeness_score, clarity_score, 
        consistency_score, issues (list), suggestions (list), quality (str).
        """
        
        response = self.ai.generate(review_prompt)
        # Parse JSON response (AI should output JSON)
        try:
            data = json.loads(response)
            return SpecificationReview(**data)
        except json.JSONDecodeError:
            return SpecificationReview(
                completeness_score=0.0,
                clarity_score=0.0,
                consistency_score=0.0,
                issues=["AI response was not valid JSON"],
                suggestions=["Try again with clearer prompt"],
                quality=SpecQuality.INCOMPLETE
            )
    
    def generate_sdd_artifact(self, requirement: str) -> dict:
        """
        Generate complete SDD artifact (spec, tests, implementation).
        
        Returns dict with keys: specification, tests, implementation, review
        """
        spec = self.translate_requirement(requirement)
        review = self.review_specification(spec)
        
        if review.quality in (SpecQuality.NEEDS_WORK, SpecQuality.INCOMPLETE):
            # Improve specification based on review
            improvement_prompt = f"""
            Improve this specification based on the review:
            
            Specification:
            {spec}
            
            Issues: {review.issues}
            Suggestions: {review.suggestions}
            
            Provide an improved specification.
            """
            spec = self.ai.generate(improvement_prompt)
        
        tests = self.ai.generate_tests(spec)
        implementation = self.ai.generate(
            f"Implement this specification:\n{spec}\n\nTests:\n{tests}",
            system="You are a Python expert. Implement the specification to pass all tests. Use type hints and include the original specification in the docstring."
        )
        
        return {
            "specification": spec,
            "tests": tests,
            "implementation": implementation,
            "review": review
        }

# Usage
workbench = SpecWorkbench(LocalAI())
artifact = workbench.generate_sdd_artifact(
    "A function that manages a priority queue with deadlines"
)
print(json.dumps(artifact, indent=2))
```

### Exercise 8.2: Build the Spec Workbench

Implement the complete `SpecWorkbench` with:
1. **Specification parser** (extract pre/post conditions from docstrings)
2. **Consistency checker** (verify that pre-conditions don't contradict post-conditions)
3. **Test validator** (verify that generated tests actually test the specification)
4. **Implementation verifier** (run tests against generated implementation)
5. **Quality dashboard** (track specification quality over time)

**Requirements:**
1. Full type annotations
2. Comprehensive error handling
3. Unit tests for the workbench itself
4. Documentation of AI accuracy metrics
5. Report on how often AI-generated code passes tests

---

## 8.4 Ethical AI Use in Software Engineering

### The AI Ethics Contract for Students

```python
# ai_ethics.py - A module for ethical AI use in software development

from dataclasses import dataclass
from datetime import datetime
from typing import List

@dataclass
class AIUsageLog:
    """Log of AI tool usage for transparency and review."""
    timestamp: datetime
    tool: str  # "ollama", "local_model", etc.
    task: str  # "spec_generation", "code_generation", "review"
    input_summary: str
    output_summary: str
    human_reviewed: bool
    corrections_made: int
    confidence: float  # 0.0 - 1.0, student's confidence in AI output

class AIEthicsTracker:
    """
    Track and review AI usage in software development.
    
    Principles:
    1. Transparency: All AI usage is logged
    2. Verification: AI output is always verified by humans
    3. Attribution: AI contributions are credited appropriately
    4. Learning: AI is used to learn, not to bypass learning
    """
    
    def __init__(self):
        self.logs: List[AIUsageLog] = []
    
    def log_usage(self, tool: str, task: str, input_summary: str, 
                  output_summary: str, human_reviewed: bool,
                  corrections: int, confidence: float) -> None:
        """Log an AI usage event."""
        self.logs.append(AIUsageLog(
            timestamp=datetime.now(),
            tool=tool,
            task=task,
            input_summary=input_summary,
            output_summary=output_summary,
            human_reviewed=human_reviewed,
            corrections_made=corrections,
            confidence=confidence
        ))
    
    def generate_report(self) -> dict:
        """Generate a usage report for review."""
        total = len(self.logs)
        reviewed = sum(1 for log in self.logs if log.human_reviewed)
        total_corrections = sum(log.corrections_made for log in self.logs)
        avg_confidence = sum(log.confidence for log in self.logs) / total if total > 0 else 0
        
        return {
            "total_usages": total,
            "reviewed_percentage": reviewed / total * 100 if total > 0 else 0,
            "total_corrections": total_corrections,
            "average_confidence": avg_confidence,
            "corrections_per_use": total_corrections / total if total > 0 else 0,
            "by_task": self._group_by_task()
        }
    
    def _group_by_task(self) -> dict:
        """Group logs by task type."""
        result = {}
        for log in self.logs:
            if log.task not in result:
                result[log.task] = []
            result[log.task].append(log)
        return result

# Usage
ethics = AIEthicsTracker()
ethics.log_usage(
    tool="ollama/llama3.1:8b",
    task="spec_generation",
    input_summary="Generated spec for binary search",
    output_summary="Complete spec with pre/post conditions",
    human_reviewed=True,
    corrections=1,
    confidence=0.8
)

report = ethics.generate_report()
print(f"AI Usage Report: {report}")
```

### Exercise 8.3: Ethical AI Usage Policy

Write a personal AI usage policy for this course that addresses:
1. When you will use AI vs. when you will solve problems yourself
2. How you will verify and correct AI output
3. How you will maintain your own learning (not just copying AI)
4. How you will attribute AI assistance in your work
5. What you will do if the AI consistently gives wrong answers

**Requirements:**
1. Specific rules (not just general principles)
2. Measurable criteria (e.g., "I will verify at least 3 test cases before trusting AI tests")
3. Accountability mechanism (how you'll track your policy adherence)
4. Review schedule (when you'll revisit and update the policy)

---

## 8.5 Learning Journal

```markdown
## Chapter 8: AI-Augmented Development

### Local AI Setup
- [Which model works best for your tasks?]
- [What are the limitations of local models?]

### AI Collaboration
- [How has AI changed your development workflow?]
- [What tasks do you still prefer to do manually?]
- [When has AI misled you? How did you catch it?]

### Spec Workbench
- [How useful is the AI-powered specification workbench?]
- [What features are missing?]

### Ethical AI Use
- [How do you balance AI use with your own learning?]
- [What is your AI usage policy?]

### Confidence Level (1-10)
```

---

## Chapter Summary

- **AI is a partner, not a replacement** - Human judgment is essential for correctness
- **Local AI models** (Ollama) provide zero-cost AI assistance
- **The AI-Augmented workflow** combines human requirements with AI generation and human verification
- **Specification workbenches** can automate the SDD workflow with AI assistance
- **Ethical AI use** requires transparency, verification, and a commitment to learning
- **AI accuracy varies** - Always verify AI-generated specifications and code

### Key Takeaway
> **"The best engineers in the AI era will be those who know when to trust AI and when to override it."**

---

## Further Reading

1. "AI-Assisted Software Engineering: A Systematic Literature Review" (2024)
2. "GitHub Copilot and Code Quality" empirical studies
3. Ollama documentation: https://ollama.com/
4. "Programming with LLMs" by Simon Willison

---

## End-of-Chapter Exercises

### Exercise 8.4: Build a Complete AI-Assisted Project (Individual)

Build a complete project using ONLY AI assistance (with full verification):
- Choose: A URL shortener, a markdown parser, or a key-value store
- Use AI for specification, tests, and implementation
- Verify everything manually
- Document AI accuracy and your corrections
- Submit the project with AI usage log

### Exercise 8.5: AI Accuracy Benchmark (Team)

In teams of 3, benchmark AI models on specification tasks:
- Each team tests 3 models (llama3.1, codellama, mistral)
- 10 specification tasks each
- Score on: completeness, correctness, clarity, consistency
- Publish results as a class report

### Exercise 8.6: Personal AI Policy (Individual)

Write and commit to a personal AI ethics policy for your career.
- Include specific rules for different contexts (academic, professional, personal)
- Include a review schedule
- Include accountability measures
- Share with a peer for feedback

---

*Next Chapter: Capstone Project - Bringing It All Together*
