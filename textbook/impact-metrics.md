# Impact Metrics and Assessment Framework

## Measuring What Matters: Learning, Quality, and Productivity

This document defines the complete impact assessment framework for the Formal Methods + AI course. It establishes quantifiable metrics, measurement methods, and targets for evaluating student outcomes and course effectiveness.

---

## 1. Learning Impact Metrics

### 1.1 Specification Proficiency

**Metric:** Percentage of exercises where students write complete, correct specifications before implementation.

| Level | Criteria | Score |
|-------|----------|-------|
| Expert | Pre/post conditions, invariants, types, examples, edge cases | 90-100% |
| Proficient | Pre/post conditions, types, examples | 70-89% |
| Developing | Basic pre/post conditions, some types | 50-69% |
| Beginning | Incomplete specifications, missing edge cases | 30-49% |
| Novice | No formal specifications | 0-29% |

**Measurement:** Pre/post course assessment with controlled specification exercises.

**Target:** 85% of students achieve Proficient or Expert by course end.

### 1.2 Bug Detection Ability

**Metric:** Percentage of bugs caught before implementation through specification review.

**Methodology:**
1. Provide students with intentionally buggy specifications
2. Ask them to identify bugs without running code
3. Compare with actual bugs

**Target:** 75% of bugs caught before any code is written (up from 15% baseline).

### 1.3 Architecture Reasoning

**Metric:** Score on architecture design rubric.

| Criterion | Weight | Excellent | Good | Adequate | Poor |
|-----------|--------|-----------|------|----------|------|
| Interface completeness | 25% | All interfaces specified | Most specified | Some specified | Minimal |
| Invariant identification | 25% | All critical invariants | Most identified | Some identified | Few identified |
| Error handling | 20% | Complete error spec | Good coverage | Basic coverage | Minimal |
| Scalability consideration | 15% | Full NFR analysis | Some NFRs | Minimal NFRs | None |
| AI integration | 15% | AI used thoughtfully | AI used mostly well | Some AI use | No AI use |

**Target:** 80% average score (up from 30% baseline).

### 1.4 AI Tool Literacy

**Metric:** Ability to effectively use AI tools for specification, testing, and implementation.

**Dimensions:**
- Prompt engineering quality (20%)
- AI output verification (25%)
- Error detection in AI output (25%)
- Appropriate AI use selection (15%)
- Ethical AI use documentation (15%)

**Target:** 95% proficiency (up from 20% baseline).

---

## 2. Productivity Impact Metrics

### 2.1 Defect Reduction

**Metric:** Defects per 1000 lines of code (DPL).

| Phase | Baseline (Industry) | Target (After Course) | Measurement Method |
|-------|---------------------|----------------------|---------------------|
| Development | 15-20 DPL | 3-5 DPL | Static analysis + test failures |
| Integration | 5-10 DPL | 1-2 DPL | Integration test failures |
| Production | 2-5 DPL | 0.5-1 DPL | Bug reports + monitoring |

**Measurement:** Automated analysis of student projects using bandit, mypy, and test failures.

### 2.2 Time to Correctness

**Metric:** Time from requirement to verified correct implementation.

| Task Type | Before Course | After Course | Improvement |
|-----------|---------------|--------------|-------------|
| Simple function | 30 min | 15 min | 2x faster |
| Algorithm | 4 hours | 1.5 hours | 2.7x faster |
| Small system | 3 days | 1 day | 3x faster |
| Architecture change | 2 weeks | 3 days | 4.7x faster |

**Measurement:** Timed exercises with verification requirements.

### 2.3 Refactoring Confidence

**Metric:** Self-reported confidence in making changes to existing code (1-10 scale).

**Dimensions:**
- Understanding existing code (30%)
- Impact analysis ability (30%)
- Regression test writing (20%)
- Safe refactoring techniques (20%)

**Target:** Average confidence 8.5+ (up from 3.5 baseline).

### 2.4 Onboarding Speed

**Metric:** Time to productive contribution in new codebase.

**Before Course:** 2 weeks to understand and modify unfamiliar code.
**After Course:** 3 days to understand and safely modify code with specifications.

**Measurement:** Controlled study with unfamiliar codebases.

---

## 3. AI-Specific Impact Metrics

### 3.1 AI Accuracy Tracking

**Metric:** How often AI-generated output is correct and useful.

| Task | AI Accuracy Target | Human Verification Required |
|------|-------------------|---------------------------|
| Specification generation | 70% | Always |
| Test generation | 80% | Always |
| Code generation | 60% | Always |
| Error explanation | 85% | Spot-check |
| Concept explanation | 90% | Review |

**Measurement:** Student logs of AI usage with correctness ratings.

### 3.2 AI-Human Collaboration Quality

**Metric:** Ratio of AI-assisted work to total work, with quality maintained.

**Target:** 40% of specification work AI-assisted, 100% human-verified.
**Target:** 30% of test generation AI-assisted, 100% human-verified.
**Target:** 20% of code generation AI-assisted, 100% human-verified.

### 3.3 AI Error Detection Rate

**Metric:** Percentage of incorrect AI output caught by students.

**Target:** 95% of incorrect AI output is caught by students.

**Measurement:** Logged AI interactions with error flagging.

---

## 4. Course-Level Metrics

### 4.1 Student Satisfaction

**Metric:** Course evaluation scores (1-5 scale).

| Dimension | Target |
|-----------|--------|
| Course usefulness for career | 4.5+ |
| Instructor/clarity of materials | 4.5+ |
| AI TA usefulness | 4.0+ |
| Lab quality | 4.5+ |
| Overall satisfaction | 4.5+ |

### 4.2 Retention and Engagement

**Metric:** Course completion and engagement rates.

| Metric | Target |
|--------|--------|
| Lab completion rate | 95% |
| Weekly exercise submission | 90% |
| Capstone project completion | 100% |
| Average time spent per week | 8+ hours |
| Forum participation | 70% of students |

### 4.3 Knowledge Retention

**Metric:** Post-course assessment at 3 months and 6 months.

**Target:** 80% of knowledge retained at 3 months.
**Target:** 70% of knowledge retained at 6 months.

**Measurement:** Follow-up assessments with specification and testing tasks.

---

## 5. Assessment Instruments

### 5.1 Pre-Course Assessment

```markdown
# Pre-Course Assessment (30 minutes)

## Part 1: Specification Writing (15 min)
Write specifications for 3 functions:
1. sort_list(arr)
2. find_duplicates(arr)
3. binary_search(arr, target)

Score on: completeness, correctness, clarity

## Part 2: Bug Detection (10 min)
Given 3 code snippets with bugs, identify bugs without running code.
Score on: number of bugs found, accuracy

## Part 3: AI Literacy (5 min)
Rate your AI tool usage and confidence.
```

### 5.2 Weekly Exercise Rubric

| Criterion | Excellent (A) | Good (B) | Adequate (C) | Needs Work (D) |
|-----------|--------------|----------|--------------|----------------|
| Specification completeness | All conditions specified | Most conditions | Basic conditions | Incomplete |
| Type correctness | mypy --strict clean | Minor issues | Some issues | Many errors |
| Test coverage | 100% branch + properties | 90%+ | 70%+ | <70% |
| AI usage log | Complete, reflective | Good log | Basic log | Missing |
| Learning journal | Deep reflection | Good reflection | Surface level | Missing |

### 5.3 Capstone Project Rubric

See Chapter 9 for complete rubric.

---

## 6. Data Collection and Analysis

### 6.1 Automated Metrics

```python
# Automated metrics collection script
from dataclasses import dataclass
from typing import Dict, List
from datetime import datetime
import json

@dataclass
class StudentMetrics:
    student_id: str
    week: int
    exercises_completed: int
    exercises_total: int
    mypy_errors: int
    test_coverage: float
    ai_interactions: int
    ai_corrections: int
    time_spent_hours: float
    specification_score: float
    bug_detection_score: float

class MetricsCollector:
    """Collect and analyze course metrics."""
    
    def __init__(self):
        self.metrics: List[StudentMetrics] = []
    
    def collect_weekly(self, metrics: StudentMetrics) -> None:
        self.metrics.append(metrics)
    
    def analyze_progress(self, student_id: str) -> Dict:
        student_data = [m for m in self.metrics if m.student_id == student_id]
        if not student_data:
            return {"error": "No data found"}
        
        return {
            "exercises_completion_rate": sum(m.exercises_completed for m in student_data) / 
                                         sum(m.exercises_total for m in student_data),
            "average_mypy_errors": sum(m.mypy_errors for m in student_data) / len(student_data),
            "average_coverage": sum(m.test_coverage for m in student_data) / len(student_data),
            "ai_accuracy": 1 - (sum(m.ai_corrections for m in student_data) / 
                               sum(m.ai_interactions for m in student_data)),
            "weekly_progress": [
                {
                    "week": m.week,
                    "spec_score": m.specification_score,
                    "bug_detection": m.bug_detection_score
                }
                for m in student_data
            ]
        }
    
    def generate_class_report(self) -> Dict:
        """Generate aggregate metrics for the class."""
        if not self.metrics:
            return {"error": "No metrics collected"}
        
        return {
            "total_students": len(set(m.student_id for m in self.metrics)),
            "average_completion_rate": sum(m.exercises_completed for m in self.metrics) / 
                                      sum(m.exercises_total for m in self.metrics),
            "average_mypy_errors": sum(m.mypy_errors for m in self.metrics) / len(self.metrics),
            "average_coverage": sum(m.test_coverage for m in self.metrics) / len(self.metrics),
            "average_ai_accuracy": 1 - (sum(m.ai_corrections for m in self.metrics) / 
                                       sum(m.ai_interactions for m in self.metrics)),
            "specification_improvement": self._calculate_improvement("specification_score"),
            "bug_detection_improvement": self._calculate_improvement("bug_detection_score")
        }
    
    def _calculate_improvement(self, metric_name: str) -> float:
        # Compare first and last week for each student
        # Return average improvement percentage
        pass
    
    def export_report(self, filepath: str) -> None:
        report = self.generate_class_report()
        with open(filepath, 'w') as f:
            json.dump(report, f, indent=2)
```

### 6.2 Privacy Considerations

- All metrics are anonymized (student_id is hashed)
- Metrics are stored locally on institution servers
- Students can opt out of metrics collection
- AI interaction logs are stored locally only
- No data is shared with third parties

---

## 7. Continuous Improvement

### 7.1 Weekly Review Process

1. **Collect metrics** from automated tools and student submissions
2. **Analyze trends** in specification quality, bug detection, and AI usage
3. **Identify struggling students** based on metric patterns
4. **Adjust course materials** based on common difficulties
5. **Update AI prompts** based on accuracy tracking

### 7.2 Semester Review Process

1. **Compare pre/post assessments** for all students
2. **Analyze capstone project quality** against rubric
3. **Review student satisfaction surveys**
4. **Update course materials** based on findings
5. **Publish anonymized impact report**

---

## 8. Target Summary

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Specification Proficiency | 0% | 85% | Pre/post assessment |
| Bug Detection (Pre-impl) | 15% | 75% | Controlled exercises |
| Architecture Reasoning | 30% | 80% | Design rubric |
| AI Tool Literacy | 20% | 95% | Practical assessment |
| Test Coverage Confidence | 40% | 90% | PBT assessment |
| Code Review Quality | 50% | 85% | Peer review analysis |
| Time to Correctness | 100% | 60% | Timed exercises |
| System Design Competence | 25% | 70% | Capstone evaluation |
| Defects per 1000 LOC | 15-20 | 3-5 | Static analysis |
| Onboarding Time | 2 weeks | 3 days | Controlled study |
| AI-Assisted Speed | N/A | 2.5x | Project timelines |
| Student Satisfaction | N/A | 4.5/5 | Course evaluation |
| Knowledge Retention (6mo) | N/A | 70% | Follow-up assessment |

---

## 9. Impact Visualization

### Dashboard Metrics

The course website includes a dashboard showing:
- Class-wide progress over time
- Individual student progress (private)
- AI accuracy trends
- Common bug types found
- Most used AI features
- Specification quality distribution

### Example Dashboard Layout

```
+--------------------------------------------------+
|  Course Impact Dashboard                           |
+--------------------------------------------------+
|  Overall Progress: 78% ████████████████████▓▓▓  |
|                                                    |
|  Learning Metrics:          Productivity Metrics:  |
|  - Spec Proficiency: 82%    - DPL: 4.2              |
|  - Bug Detection: 71%       - Time to Correct: 65% |
|  - Architecture: 76%        - Refactoring Conf: 8.2 |
|  - AI Literacy: 91%         - Onboarding: 4 days  |
|                                                    |
|  AI Usage This Week:                              |
|  - Interactions: 1,245    - Accuracy: 73%        |
|  - Corrections: 328       - Most Used: Spec Gen  |
|                                                    |
|  Top Student Achievements:                        |
|  - Most bugs prevented: 42 (Rahul)               |
|  - Best specification: Ananya                     |
|  - Most AI-verified: Priya                         |
+--------------------------------------------------+
```

---

## 10. Research Integration

This course is designed to contribute to the research literature on:
- Specification-driven education
- AI-assisted software engineering education
- Formal methods in undergraduate curricula
- Impact measurement in CS education

**Data Sharing:**
- Anonymized pre/post assessment data may be shared with IRB approval
- Student consent required for research use
- All research publications acknowledge student contributions
- Findings are shared back with the class

---

*This impact framework ensures that the course delivers measurable, verifiable improvements in student learning and software engineering productivity.*
