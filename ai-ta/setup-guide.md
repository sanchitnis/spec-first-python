# AI Teaching Assistant Setup Guide

## Zero-Cost AI Teaching Assistant for Formal Methods Course

This guide sets up a local AI teaching assistant that requires **no paid API calls** and **no tokens**. It runs entirely on your machine or institution's servers.

---

## System Requirements

### Minimum (for basic use)
- CPU: 4 cores
- RAM: 8 GB
- Storage: 10 GB free
- OS: Windows 10/11, macOS, or Linux

### Recommended (for best experience)
- CPU: 8+ cores
- RAM: 16 GB
- Storage: 20 GB free
- GPU: Optional but speeds up inference

---

## Step 1: Install Ollama

### Windows
```powershell
# Download from https://ollama.com/download
# Or use winget:
winget install Ollama.Ollama
```

### macOS
```bash
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Verify installation:**
```bash
ollama --version
```

---

## Step 2: Download Models

For this course, we recommend a **model zoo** optimized for different tasks:

```bash
# General purpose reasoning and specification generation
ollama pull llama3.1:8b

# Code generation and explanation
ollama pull codellama:7b

# Instruction following and structured output
ollama pull mistral:7b

# Lightweight model for quick responses (older hardware)
ollama pull phi3:mini

# Deep reasoning for complex proofs (slower but more thorough)
ollama pull deepseek-r1:7b
```

**Model Size Reference:**
| Model | Size | RAM Needed | Speed | Quality |
|-------|------|-----------|-------|---------|
| phi3:mini | 2GB | 4GB | Fast | Good for basics |
| codellama:7b | 4GB | 8GB | Medium | Good for code |
| llama3.1:8b | 5GB | 8GB | Medium | Best all-around |
| mistral:7b | 4GB | 8GB | Medium | Good reasoning |
| deepseek-r1:7b | 4GB | 8GB | Slow | Best reasoning |

---

## Step 3: Python Integration

### Install Required Packages

```bash
pip install requests ollama
```

### Basic AI TA Client

```python
# ai_ta.py
import requests
import json
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from datetime import datetime
import os

@dataclass
class AIResponse:
    """Structured response from the AI TA."""
    content: str
    model: str
    timestamp: datetime
    tokens_generated: int
    time_taken: float

class AITeachingAssistant:
    """
    Local AI Teaching Assistant for the Formal Methods course.
    
    Features:
    - Specification generation from requirements
    - Test generation from specifications
    - Code review and verification
    - Socratic questioning (learns by asking, not telling)
    - Error explanation and debugging assistance
    - Concept explanation and examples
    
    Invariants:
    - model_name is one of the available models
    - temperature is between 0.0 and 1.0
    - All interactions are logged locally (no external data sharing)
    """
    
    # System prompts for different teaching modes
    SYSTEM_PROMPTS = {
        "socratic": """You are a Socratic teaching assistant. You NEVER give direct answers.
        Instead, you ask guiding questions that help the student discover the answer themselves.
        
        Rules:
        1. Ask one or two questions at a time
        2. Wait for the student's response before proceeding
        3. If the student is stuck, ask a simpler, more concrete question
        4. Never write code for the student - ask them to explain their approach
        5. Praise good reasoning and correct misunderstandings gently
        6. Always relate questions back to the course material (specifications, invariants, properties)
        """,
        
        "specification": """You are a formal methods expert helping students write specifications.
        
        When given a requirement, help the student produce:
        1. A clear, unambiguous specification in natural language
        2. Python type hints and function signatures
        3. Pre-conditions and post-conditions
        4. Invariants (for data structures)
        5. Examples in doctest format
        6. Edge cases to consider
        
        Important: Explain WHY each part of the specification matters.
        Connect back to bug prevention and correctness.
        """,
        
        "reviewer": """You are a code reviewer focused on specifications and correctness.
        
        When reviewing code, check:
        1. Does it match the specification?
        2. Are all pre-conditions checked?
        3. Are all post-conditions satisfied?
        4. Are invariants maintained?
        5. Are edge cases handled?
        6. Are types correct?
        7. What bugs could this code have?
        
        Format your review as:
        - [PASS] or [ISSUE] for each check
        - Specific line references where applicable
        - Suggestions for improvement
        - Severity: CRITICAL, WARNING, or SUGGESTION
        """,
        
        "explainer": """You are a patient explainer of formal methods concepts.
        
        When explaining concepts:
        1. Start with an intuitive analogy
        2. Provide a concrete example
        3. Show the formal definition
        4. Connect to real-world software engineering
        5. Provide a practice exercise
        6. Check for understanding
        
        Use simple language but be precise. Relate to Python whenever possible.
        """
    }
    
    def __init__(self, model: str = "llama3.1:8b", temperature: float = 0.7):
        self.model = model
        self.temperature = temperature
        self.base_url = os.environ.get("OLLAMA_URL", "http://localhost:11434")
        self.conversation_history: List[Dict[str, str]] = []
        self.interaction_log: List[Dict] = []
    
    def _call_model(self, prompt: str, system: Optional[str] = None, 
                    stream: bool = False) -> AIResponse:
        """
        Call the local Ollama model.
        
        Pre: prompt is non-empty
        Post: Returns non-empty AIResponse
        """
        assert prompt, "Pre-condition: prompt must not be empty"
        
        start_time = datetime.now()
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": stream,
            "options": {
                "temperature": self.temperature,
                "num_predict": 2048  # Max tokens to generate
            }
        }
        
        if system:
            payload["system"] = system
        
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=120  # 2 minute timeout
            )
            response.raise_for_status()
            data = response.json()
            
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            ai_response = AIResponse(
                content=data.get("response", ""),
                model=self.model,
                timestamp=end_time,
                tokens_generated=data.get("eval_count", 0),
                time_taken=duration
            )
            
            # Log interaction
            self.interaction_log.append({
                "timestamp": end_time.isoformat(),
                "mode": system[:50] if system else "default",
                "prompt": prompt[:200],
                "response": ai_response.content[:200],
                "duration": duration
            })
            
            return ai_response
            
        except requests.exceptions.ConnectionError:
            raise RuntimeError(
                "Cannot connect to Ollama. Is it running? Run 'ollama serve' first."
            )
        except requests.exceptions.Timeout:
            raise RuntimeError("Model took too long to respond. Try a smaller model or simpler prompt.")
    
    # ========== TEACHING MODES ==========
    
    def ask_socratic(self, concept: str, student_response: Optional[str] = None) -> str:
        """
        Socratic mode: Ask questions to guide student understanding.
        
        Pre: concept is non-empty
        Post: Returns a question that helps the student reason about the concept
        """
        if student_response:
            prompt = f"""Student is learning about: {concept}
            
            Their previous response: {student_response}
            
            Ask a follow-up question that guides them deeper into the concept.
            If they made an error, ask a question that helps them discover it."""
        else:
            prompt = f"""A student is learning about: {concept}
            
            Ask an opening question that helps them think about this concept
            in the context of formal methods and software specification."""
        
        response = self._call_model(prompt, system=self.SYSTEM_PROMPTS["socratic"])
        return response.content
    
    def help_specify(self, requirement: str) -> str:
        """
        Specification mode: Help student write formal specifications.
        
        Pre: requirement is non-empty
        Post: Returns structured specification guidance
        """
        prompt = f"""A student needs to write a specification for this requirement:
        
        REQUIREMENT: {requirement}
        
        Help them by:
        1. Breaking down the requirement into parts
        2. Identifying what needs to be specified (inputs, outputs, behavior)
        3. Asking them to identify pre-conditions
        4. Asking them to identify post-conditions
        5. Suggesting edge cases they might miss
        6. Providing a template they can fill in
        
        Do NOT write the complete specification for them. Guide them through it."""
        
        response = self._call_model(prompt, system=self.SYSTEM_PROMPTS["specification"])
        return response.content
    
    def review_code(self, code: str, specification: str) -> str:
        """
        Reviewer mode: Review code against its specification.
        
        Pre: code and specification are non-empty
        Post: Returns structured review with [PASS] and [ISSUE] tags
        """
        prompt = f"""Review this implementation against its specification.
        
        SPECIFICATION:
        {specification}
        
        IMPLEMENTATION:
        ```python
        {code}
        ```
        
        Provide a detailed review."""
        
        response = self._call_model(prompt, system=self.SYSTEM_PROMPTS["reviewer"])
        return response.content
    
    def explain_concept(self, concept: str, level: str = "beginner") -> str:
        """
        Explainer mode: Explain a formal methods concept.
        
        Pre: concept is non-empty
        Post: Returns explanation with analogy, example, and exercise
        """
        prompt = f"""Explain this concept to a student at the {level} level:
        
        CONCEPT: {concept}
        
        Include:
        1. An intuitive analogy
        2. A concrete Python example
        3. The formal definition
        4. Why it matters in software engineering
        5. A practice exercise"""
        
        response = self._call_model(prompt, system=self.SYSTEM_PROMPTS["explainer"])
        return response.content
    
    def generate_tests(self, specification: str, framework: str = "pytest") -> str:
        """
        Generate test cases from a specification.
        
        Pre: specification is non-empty
        Post: Returns test code in the specified framework
        """
        prompt = f"""Generate {framework} tests from this specification.
        
        SPECIFICATION:
        {specification}
        
        Include:
        1. Unit tests for each example in the docstring
        2. Property-based tests using Hypothesis for post-conditions
        3. Edge case tests (empty inputs, boundary values, invalid inputs)
        4. Invariant tests if applicable
        
        Output complete, runnable Python test code."""
        
        return self._call_model(prompt).content
    
    def debug_error(self, code: str, error: str, specification: str) -> str:
        """
        Debug mode: Help student understand and fix errors.
        
        Pre: code, error, and specification are non-empty
        Post: Returns explanation of the error and guidance for fixing it
        """
        prompt = f"""A student has this error:
        
        ERROR: {error}
        
        In this code:
        ```python
        {code}
        ```
        
        The specification says:
        {specification}
        
        Help them understand:
        1. What the error means
        2. Why it's happening
        3. How to fix it
        4. How to prevent similar errors in the future
        
        Don't just give the fix - explain the reasoning."""
        
        return self._call_model(prompt).content
    
    # ========== UTILITY METHODS ==========
    
    def get_usage_stats(self) -> Dict:
        """Return usage statistics for the AI TA."""
        total = len(self.interaction_log)
        if total == 0:
            return {"total_interactions": 0}
        
        total_tokens = sum(i.get("tokens_generated", 0) for i in self.interaction_log)
        total_time = sum(i.get("duration", 0) for i in self.interaction_log)
        
        return {
            "total_interactions": total,
            "total_tokens_generated": total_tokens,
            "total_time_seconds": total_time,
            "average_response_time": total_time / total,
            "models_used": list(set(i.get("model", self.model) for i in self.interaction_log))
        }
    
    def export_logs(self, filepath: str) -> None:
        """Export interaction logs to a JSON file."""
        with open(filepath, 'w') as f:
            json.dump(self.interaction_log, f, indent=2)


# ========== EXAMPLE USAGE ==========

def demo():
    """Demonstrate the AI Teaching Assistant."""
    print("=" * 60)
    print("AI Teaching Assistant Demo")
    print("=" * 60)
    
    ta = AITeachingAssistant(model="llama3.1:8b")
    
    # Example 1: Socratic questioning
    print("\n1. Socratic Mode - Learning about Invariants")
    print("-" * 60)
    question = ta.ask_socratic("loop invariants")
    print(f"AI TA: {question}")
    
    # Example 2: Specification help
    print("\n2. Specification Mode - Binary Search")
    print("-" * 60)
    spec_help = ta.help_specify(
        "A function that finds an element in a sorted array using binary search"
    )
    print(f"AI TA: {spec_help}")
    
    # Example 3: Concept explanation
    print("\n3. Explainer Mode - Pre-conditions")
    print("-" * 60)
    explanation = ta.explain_concept("pre-conditions and post-conditions")
    print(f"AI TA: {explanation}")
    
    # Stats
    print("\n" + "=" * 60)
    print("Usage Stats")
    print("=" * 60)
    stats = ta.get_usage_stats()
    for key, value in stats.items():
        print(f"{key}: {value}")

if __name__ == "__main__":
    demo()
```

---

## Step 4: Integration with Course Materials

### Using the AI TA in Labs

```python
# lab_helper.py - Integrated with course exercises
from ai_ta import AITeachingAssistant
import os

class LabAssistant:
    """Course-specific lab assistant with pre-loaded context."""
    
    def __init__(self):
        self.ta = AITeachingAssistant(model="llama3.1:8b")
        self.context = self._load_course_context()
    
    def _load_course_context(self) -> str:
        """Load current course context (chapter, topic, learning objectives)."""
        # This could be loaded from a config file or set by the instructor
        return """Current course: Formal Methods for AI-Augmented Software Engineering
        Chapter: Spec-Driven Development
        Topics: Pre-conditions, post-conditions, invariants, property-based testing
        Learning objectives: Write specifications that prevent bugs"""
    
    def help_with_exercise(self, exercise_number: str, student_question: str) -> str:
        """Get help with a specific exercise."""
        prompt = f"""{self.context}
        
        Student is working on exercise {exercise_number}.
        Question: {student_question}
        
        Help them according to the course teaching principles:
        - Guide, don't give answers
        - Connect to specification concepts
        - Ask them to identify pre/post conditions first
        - Suggest edge cases they might have missed
        """
        
        return self.ta._call_model(prompt).content
    
    def check_understanding(self, concept: str) -> str:
        """Ask a question to check student understanding."""
        prompt = f"""{self.context}
        
        Ask a question to check if the student understands: {concept}
        
        The question should:
        - Be specific enough to require understanding
        - Not be answerable by pattern matching
        - Require applying the concept to a new situation
        - Have a clear correct answer that can be checked
        """
        
        return self.ta._call_model(prompt).content
```

---

## Step 5: Monitoring and Evaluation

### Track AI Effectiveness

```python
# effectiveness_tracker.py
from dataclasses import dataclass
from typing import List, Dict
from datetime import datetime

@dataclass
class AIEffectiveness:
    """Track how effective the AI TA is at helping students learn."""
    
    total_interactions: int
    successful_resolutions: int  # Student reported understanding
    follow_up_questions: int  # Student needed more help
    escalations: int  # Student needed human help
    average_satisfaction: float  # 1-5 rating
    common_difficulties: List[str]  # Topics students struggle with
    
    def effectiveness_score(self) -> float:
        """Calculate overall effectiveness score."""
        if self.total_interactions == 0:
            return 0.0
        return (self.successful_resolutions / self.total_interactions) * 100

class AIEffectivenessTracker:
    """Track and report on AI TA effectiveness."""
    
    def __init__(self):
        self.feedback: List[Dict] = []
    
    def record_feedback(self, interaction_id: str, helpful: bool, 
                        rating: int, notes: str) -> None:
        """Record student feedback on an AI interaction."""
        self.feedback.append({
            "interaction_id": interaction_id,
            "helpful": helpful,
            "rating": rating,
            "notes": notes,
            "timestamp": datetime.now().isoformat()
        })
    
    def generate_report(self) -> Dict:
        """Generate effectiveness report for instructors."""
        if not self.feedback:
            return {"message": "No feedback recorded yet"}
        
        total = len(self.feedback)
        helpful = sum(1 for f in self.feedback if f["helpful"])
        avg_rating = sum(f["rating"] for f in self.feedback) / total
        
        return {
            "total_feedback": total,
            "helpful_percentage": helpful / total * 100,
            "average_rating": avg_rating,
            "common_issues": self._extract_common_issues(),
            "recommendations": self._generate_recommendations()
        }
    
    def _extract_common_issues(self) -> List[str]:
        """Extract common issues from feedback notes."""
        # Simple keyword extraction - could be enhanced with NLP
        issues = []
        for f in self.feedback:
            if not f["helpful"]:
                issues.append(f["notes"])
        return issues[:10]  # Top 10
    
    def _generate_recommendations(self) -> List[str]:
        """Generate recommendations based on feedback."""
        recommendations = []
        
        avg_rating = sum(f["rating"] for f in self.feedback) / len(self.feedback)
        if avg_rating < 3.0:
            recommendations.append("Consider switching to a more capable model")
        
        not_helpful = sum(1 for f in self.feedback if not f["helpful"])
        if not_helpful / len(self.feedback) > 0.3:
            recommendations.append("Many students need follow-up - consider human TA support")
        
        return recommendations
```

---

## Troubleshooting

### Model is slow or unresponsive
1. Check available RAM: `free -h` (Linux) or Task Manager (Windows)
2. Use a smaller model: `phi3:mini` instead of `llama3.1:8b`
3. Close other applications to free RAM
4. Check Ollama is running: `ollama list`

### Model gives incorrect answers
1. Check the temperature setting (lower = more deterministic)
2. Provide more context in the prompt
3. Use a more capable model for complex reasoning
4. Always verify AI output manually

### Connection errors
1. Ensure Ollama server is running: `ollama serve`
2. Check firewall settings (port 11434)
3. Verify the URL in the client configuration

---

## Advanced Configuration

### Custom Model Fine-Tuning (for institutions)

For institutions with GPU resources, you can fine-tune models on course-specific content:

```bash
# Create training data from course materials
# Format: {"prompt": "...", "response": "..."}

# Use unsloth or axolotl for fine-tuning
# This is beyond the scope of basic setup but documented for reference
```

### Multi-Model Routing

```python
class MultiModelTA:
    """Route queries to the most appropriate model."""
    
    MODELS = {
        "quick": "phi3:mini",      # Fast responses
        "code": "codellama:7b",    # Code generation
        "reasoning": "deepseek-r1:7b",  # Complex reasoning
        "default": "llama3.1:8b"  # General purpose
    }
    
    def route(self, query_type: str) -> str:
        return self.MODELS.get(query_type, self.MODELS["default"])
```

---

## Privacy and Security

### Key Principles
1. **All processing is local** - No data leaves your machine
2. **No API keys required** - No external service dependencies
3. **Logs are local** - Interaction history stays on your machine
4. **Models can be deleted** - Remove models when course ends
5. **Open source** - All code is auditable

### Data Handling
```python
# All interaction logs are stored locally
LOG_DIR = os.path.expanduser("~/.ai_ta_logs")
os.makedirs(LOG_DIR, exist_ok=True)

# Students control their own data
# Logs can be exported, deleted, or shared at student's discretion
```

---

## Integration Checklist

- [ ] Ollama installed and running
- [ ] At least one model downloaded (llama3.1:8b recommended)
- [ ] Python client tested and working
- [ ] AI TA integrated with course materials
- [ ] Usage logging enabled
- [ ] Student privacy policy communicated
- [ ] Backup plan for AI unavailability (human TA, offline materials)
- [ ] Effectiveness tracking configured
- [ ] Instructor dashboard for monitoring

---

*This AI Teaching Assistant setup ensures zero-cost, privacy-preserving, local AI assistance for all students in the Formal Methods course.*
