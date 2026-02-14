# Evaluation Guidelines
## Mental Health Chatbot "Pebbles the Pibble" - Study Protocol

**Version:** 1.0
**Date:** February 2026
**Study Type:** Comparative Evaluation Study

---

## Table of Contents

1. [Study Overview](#study-overview)
2. [Participant Groups](#participant-groups)
3. [Systems Being Evaluated](#systems-being-evaluated)
4. [Study Protocol](#study-protocol)
5. [Data Collection](#data-collection)
6. [Analysis Plan](#analysis-plan)
7. [Ethical Considerations](#ethical-considerations)

---

## Study Overview

### Research Questions

This evaluation aims to answer:

1. **Effectiveness:** How does Pebbles (intent-based CBT chatbot) compare to Raw GPT (unstructured CBT guidance) in therapeutic effectiveness?
2. **Human-likeness:** Do users perceive Pebbles as more natural and human-like than Raw GPT?
3. **Intent-based structure:** Does the 8-step CBT framework enhance or hinder the therapeutic process?
4. **Clinical validity:** Do mental health professionals consider Pebbles clinically safe and effective?
5. **User experience:** Would users choose Pebbles over alternatives for mental health support?

### Sample Size

- **Therapists:** ~5-8 licensed mental health professionals
- **Users:** ~15 general users (target minimum)
- **Total:** ~20-25 participants

### Timeline

- **Recruitment:** [INSERT DATES]
- **Data Collection:** [INSERT DATES]
- **Analysis:** [INSERT DATES]
- **Reporting:** [INSERT DATES]

---

## Participant Groups

### Group 1: Therapists (Professional Evaluators)

**Inclusion Criteria:**
- Licensed mental health professional (LCSW, LPC, psychologist, psychiatrist)
- Minimum 2 years clinical experience
- Familiarity with Cognitive Behavioral Therapy (CBT)
- Willing to complete 4 scenario evaluations (~2-3 hours total)

**Role:**
- Evaluate Pebbles across 1 preset scenario + 3 self-selected scenarios
- Compare to Raw GPT for each scenario
- Assess clinical safety, therapeutic adherence, and effectiveness
- Provide professional recommendations

**Compensation:** [INSERT COMPENSATION DETAILS]

---

### Group 2: General Users

**Inclusion Criteria:**
- Age 18+
- English-speaking
- Willing to share a stressful situation (real or realistic)
- Comfortable using chatbot interfaces
- No active suicidal ideation or crisis state

**Exclusion Criteria:**
- Currently in mental health crisis
- Unable to provide informed consent
- Under 18 years old

**Role:**
- Work through one stressful scenario with all three systems (Pebbles, Raw GPT, [Aidora])
- Complete comprehensive user survey
- Provide honest feedback on experience

**Compensation:** [INSERT COMPENSATION DETAILS]

---

## Systems Being Evaluated

### System 1: Pebbles (Intent-Based CBT Chatbot)

**Description:**
- 8-step intent-based CBT framework (I1-I8)
- Uses optimized prompt techniques for each intent
- Includes cognitive distortion identification
- Adaptive progression based on AI evaluation of intent completion
- Structured, guided therapeutic process

**Technical Details:**
- Model: GPT-4o-mini via LangChain
- Temperature: 0.2 (deterministic)
- Prompt Strategy: Best-performing technique per intent (based on prior evaluation)
- State Management: Intent tracking with completion criteria

**Access:** [INSERT URL/ACCESS INSTRUCTIONS]

---

### System 2: Raw GPT (Baseline Comparison)

**Description:**
- ChatGPT with basic CBT instructions
- No intent-based structure
- No cognitive distortion detection
- Open-ended, unstructured conversation
- Same underlying model (GPT-4o-mini)

**System Prompt for Raw GPT:**
```
You are a supportive mental health assistant trained in Cognitive Behavioral Therapy (CBT).
Help users work through stressful situations by:
- Listening empathetically
- Helping them identify negative thoughts
- Exploring evidence for and against those thoughts
- Developing more balanced perspectives
- Suggesting coping strategies

Be warm, non-judgmental, and supportive. Ask one question at a time.
Never provide medical diagnoses or prescribe treatment.
```

**Access:** [INSERT URL/ACCESS INSTRUCTIONS - e.g., ChatGPT interface with custom instructions]

---

### System 3: [Aidora / Comparison Chatbot]

**Description:** [INSERT DESCRIPTION OF AIDORA]

**Access:** [INSERT URL/ACCESS INSTRUCTIONS]

---

## Study Protocol

### A. Therapist Evaluation Protocol

#### Pre-Study Setup (30 minutes)

1. **Orientation Session:**
   - Explain study purpose and research questions
   - Demonstrate both systems (Pebbles and Raw GPT)
   - Review CBT framework and 8 intents
   - Explain evaluation criteria
   - Distribute therapist survey forms

2. **Scenario Preparation:**
   - Provide preset scenario (Scenario 1)
   - Ask therapists to select 3 additional scenarios based on common clinical presentations
   - Scenarios should represent diverse issues (anxiety, depression, stress, relationships, etc.)

#### Evaluation Sessions (4 scenarios × ~30-45 min each = 2-3 hours total)

**For Each Scenario:**

1. **Pebbles Session (15-20 minutes):**
   - Role-play as a client with the scenario
   - Interact naturally with Pebbles
   - Progress through the 8-step CBT framework
   - Take notes on observations

2. **Raw GPT Session (15-20 minutes):**
   - Role-play same scenario with Raw GPT
   - Interact naturally
   - Take notes on observations

3. **Complete Survey (10-15 minutes):**
   - Fill out therapist survey for this scenario
   - Rate both systems on all dimensions
   - Provide comparative analysis

4. **Break (optional):**
   - Take 5-10 minute break between scenarios if needed

#### Post-Study (10 minutes)

- Debrief and collect final feedback
- Answer questions
- Distribute compensation

---

### B. User Evaluation Protocol

#### Pre-Study Setup (10 minutes)

1. **Informed Consent:**
   - Explain study purpose
   - Review privacy and data use
   - Obtain written consent
   - Screen for crisis/exclusion criteria

2. **Orientation:**
   - Brief demo of chatbot interfaces
   - Explain that they'll use three different systems
   - Emphasize honesty in responses
   - Distribute user survey form

3. **Scenario Selection:**
   - Ask participant to think of a stressful situation (real or realistic)
   - Ensure scenario is:
     - Specific and concrete
     - Moderately stressful (not traumatic or crisis-level)
     - Something they're comfortable discussing
   - Have them write down brief notes about the scenario

#### Evaluation Sessions (~60-90 minutes total)

**IMPORTANT: Randomize order of systems to control for order effects**

Assign each participant to one of 6 possible orders:
1. Pebbles → Raw GPT → [Aidora]
2. Pebbles → [Aidora] → Raw GPT
3. Raw GPT → Pebbles → [Aidora]
4. Raw GPT → [Aidora] → Pebbles
5. [Aidora] → Pebbles → Raw GPT
6. [Aidora] → Raw GPT → Pebbles

**For Each System (20-30 minutes):**

1. **Interaction:**
   - User works through their scenario with the chatbot
   - Encourage natural, authentic responses
   - Observer takes notes but doesn't interrupt
   - Session continues until either:
     - Conversation reaches natural conclusion
     - 30 minutes elapsed
     - User indicates they're done

2. **Immediate Impressions:**
   - Ask user to jot down immediate reactions before moving to next system
   - Note any strong positive/negative reactions

**Between Systems:**
- 5-minute break
- Remind participant to approach each system fresh
- Don't compare systems aloud yet

#### Post-Study (20-30 minutes)

1. **Survey Completion:**
   - Complete full user survey
   - Review for completeness
   - Probe for any unclear responses

2. **Debrief:**
   - Open-ended discussion about experience
   - Clarify any questions
   - Provide mental health resources if needed
   - Distribute compensation

---

## Data Collection

### Survey Administration

**Format:**
- [ ] Paper surveys (manual data entry)
- [ ] Digital surveys (Google Forms, Qualtrics, etc.)
- [ ] Hybrid (initial paper, then digitized)

**Recommended:** Use digital forms to reduce data entry errors and enable immediate analysis.

### Data to Collect

#### For All Participants:
- Completed survey responses
- Demographic information
- Session timestamps (start/end times)
- System order (for users)
- Scenario descriptions

#### Optional Supplementary Data:
- **Conversation logs:** Full chat transcripts (with consent)
  - Useful for qualitative analysis
  - Can identify specific failure points
  - Privacy considerations: anonymize before analysis

- **Screen recordings:** Video of sessions (with consent)
  - Captures UI/UX issues
  - Shows hesitation or confusion points
  - Privacy considerations: faces can be blurred

- **Think-aloud protocols:** Audio recordings of users narrating thoughts
  - Provides insight into reasoning
  - Captures emotional reactions in real-time
  - Requires additional consent

### Data Storage & Privacy

- **De-identification:** Remove all personally identifiable information (PII)
  - Assign anonymous participant IDs
  - Remove names from scenarios
  - Redact specific locations, organizations, individuals mentioned

- **Secure Storage:**
  - Password-protected files
  - Encrypted storage for sensitive data
  - Access limited to research team
  - Comply with IRB requirements (if applicable)

- **Retention Period:** [INSERT RETENTION POLICY]
  - E.g., "Data will be kept for 3 years, then securely destroyed"

- **Data Sharing:** [INSERT POLICY]
  - E.g., "Anonymized aggregate data may be shared in publications"

---

## Analysis Plan

### Quantitative Analysis

#### 1. Descriptive Statistics

**For Each System (Pebbles, Raw GPT, [Aidora]):**
- Mean and SD for all Likert-scale items
- Frequency distributions for categorical responses
- Net Promoter Score (NPS) calculation

#### 2. Comparative Analysis

**Pebbles vs. Raw GPT:**
- Paired t-tests for rating differences
- Effect sizes (Cohen's d)
- Significance testing for preference choices

**Intent-Specific Analysis:**
- Compare ratings for each intent (I1-I8)
- Identify which intents perform best/worst

**Therapist vs. User Agreement:**
- Correlation between therapist and user ratings
- Identify discrepancies in perceptions

#### 3. Key Metrics

| Metric | Calculation | Target |
|--------|-------------|--------|
| Overall Preference | % choosing Pebbles as first choice | >60% |
| Human-likeness Score | Mean rating on human-like items | >4.0/5.0 |
| Therapeutic Effectiveness | Mean rating on helpfulness | >4.0/5.0 |
| NPS (Net Promoter Score) | % Promoters (9-10) - % Detractors (0-6) | >20 |
| Clinical Safety | % therapists rating as "safe" | 100% |

### Qualitative Analysis

#### Thematic Coding

**Open-Ended Responses:**
1. **Initial Coding:**
   - Read all responses
   - Identify recurring themes
   - Develop codebook

2. **Common Themes to Look For:**
   - Structure preferences (too rigid vs. helpful guidance)
   - Empathy and validation
   - Personalization and relevance
   - Human-likeness factors
   - Trust and credibility
   - Specific features liked/disliked
   - Comparison insights

3. **Coding Process:**
   - Two independent coders
   - Calculate inter-rater reliability (Cohen's kappa)
   - Resolve discrepancies through discussion

#### Conversational Analysis (if chat logs collected)

- **Intent Progression Patterns:**
  - How many turns per intent on average?
  - Where do users get stuck?
  - Do intent transitions feel natural?

- **Error Analysis:**
  - Identify misunderstandings or off-topic responses
  - Classify error types
  - Compare error rates across systems

- **Engagement Metrics:**
  - Message length (user)
  - Response length (bot)
  - Total conversation length
  - User sentiment over time

---

## Ethical Considerations

### Informed Consent

**Participants must understand:**
- Purpose of the research
- What they'll be asked to do
- How their data will be used
- Their right to withdraw at any time
- Privacy protections in place
- Compensation (if any)

**Consent Form Must Include:**
- Study description
- Risks and benefits
- Confidentiality procedures
- Contact information for questions
- Signature and date

### Participant Safety

**Mental Health Screening:**
- Screen for active crisis or suicidal ideation
- Exclude individuals currently in crisis
- Have mental health resources ready to provide

**Resources to Provide:**
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text "HELLO" to 741741
- Local mental health services
- Therapy directories (e.g., Psychology Today)

**Monitoring During Sessions:**
- Observer should watch for signs of distress
- Be prepared to pause/stop session if needed
- Have protocol for responding to crisis disclosure

### Data Ethics

**Privacy:**
- Minimize collection of identifying information
- Anonymize scenarios that contain identifying details
- Secure storage with access controls

**Transparency:**
- Participants should know they're talking to an AI
- Chatbots should not claim to be human therapists
- Limitations should be clearly stated

**Responsible AI:**
- Monitor for harmful outputs
- Document any concerning responses
- Have process for addressing safety issues

### IRB Approval

**May be required if:**
- Study is conducted at an academic institution
- Results will be published in peer-reviewed journals
- Funded by federal grants

**Submit IRB application including:**
- Research protocol
- Survey instruments
- Consent forms
- Data security plan
- Risk mitigation strategies

---

## Study Materials Checklist

### Before Starting Data Collection:

- [ ] IRB approval obtained (if required)
- [ ] Consent forms printed/digital
- [ ] Therapist surveys prepared
- [ ] User surveys prepared
- [ ] Preset scenario for therapists finalized
- [ ] Access to all three systems confirmed
- [ ] Randomization schedule for user order created
- [ ] Data collection spreadsheet/database set up
- [ ] Mental health resource list prepared
- [ ] Compensation method arranged
- [ ] Observer training completed
- [ ] Pilot test with 1-2 participants to identify issues

### During Data Collection:

- [ ] Track participant IDs and completion status
- [ ] Store completed surveys securely
- [ ] Monitor for any safety concerns
- [ ] Document any protocol deviations
- [ ] Keep notes on recurring issues or feedback

### After Data Collection:

- [ ] Verify all surveys complete
- [ ] Digitize paper surveys (if applicable)
- [ ] Clean and validate data
- [ ] Begin analysis
- [ ] Store raw data securely
- [ ] Prepare preliminary findings
- [ ] Share results with team

---

## Troubleshooting

### Common Issues & Solutions

**Issue:** Participant gets stuck or confused during chatbot interaction
- **Solution:** Remind them there's no "right" way to interact; encourage authenticity

**Issue:** Chatbot gives unexpected or off-topic response
- **Solution:** Document in notes; ask participant to continue naturally

**Issue:** Participant wants to skip a system
- **Solution:** Explore why; if strong discomfort, allow skip but note reason

**Issue:** Session runs long (>30 min per system)
- **Solution:** Allow to continue or offer to stop, participant's choice

**Issue:** Participant discloses crisis-level information
- **Solution:** Pause study, provide resources, check safety, document

**Issue:** Technical difficulties (system down, bugs)
- **Solution:** Reschedule session; document technical issues for developers

---

## Contact Information

**Principal Investigator:** [NAME]
**Email:** [EMAIL]
**Phone:** [PHONE]

**Study Coordinator:** [NAME]
**Email:** [EMAIL]
**Phone:** [PHONE]

**IRB Contact:** [IF APPLICABLE]

**Emergency Mental Health Resources:**
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text "HELLO" to 741741

---

## Appendices

### Appendix A: Preset Scenario for Therapists

**Scenario 1: Work Performance Anxiety**

*"I'm a 28-year-old software engineer at a tech startup. Last week, my manager pointed out a bug in my code during a team meeting in front of everyone. I felt my face turn red and couldn't concentrate for the rest of the meeting. Since then, I've been really anxious about going to work. Every time I submit code for review, I'm convinced there will be mistakes and everyone will think I'm incompetent. I've started triple-checking everything, which is making me fall behind on deadlines. I'm worried I'm going to get fired. This morning I almost called in sick because I couldn't face another day of feeling like an imposter."*

**Cognitive Distortions Present:**
- Catastrophizing ("I'm going to get fired")
- All-or-Nothing Thinking ("Everyone will think I'm incompetent")
- Overgeneralization (one bug → incompetent)
- Mind Reading ("everyone will think...")
- Labeling ("I'm an imposter")

**Expected Intent Progression:**
- I1: Work meeting where bug was pointed out
- I2: "I'm incompetent" / "I'm going to get fired" / "I'm an imposter"
- I3: Anxiety rated 7-8/10
- I4: Evidence for: bug was real, public correction, falling behind
- I5: Evidence against: one bug doesn't define competence, still employed, others make mistakes too
- I6: Alternative: "This bug was a learning opportunity, and everyone makes mistakes sometimes"
- I7: Anxiety reduced to 4-5/10
- I8: Coping strategies: self-compassion exercises, talking to manager, time management

---

### Appendix B: Sample Participant Recruitment Email

**Subject:** Participate in Mental Health Chatbot Research Study - Compensation Provided

Dear [Potential Participant],

We are conducting a research study comparing different AI chatbot approaches for mental health support. We're looking for [therapists/volunteers] to participate in a [2-3 hour / 90-minute] evaluation session.

**What you'll do:**
[For therapists: Evaluate chatbot responses across 4 mental health scenarios]
[For users: Work through a stressful situation with 3 different chatbot systems]

**Compensation:** [INSERT AMOUNT/TYPE]

**Time commitment:** [INSERT TIME]

**Location:** [INSERT - in-person/remote]

**Requirements:**
[INSERT INCLUSION CRITERIA]

If you're interested, please reply to this email or contact [NAME] at [EMAIL].

Thank you for considering participation!

Best regards,
[Research Team]

---

### Appendix C: Data Entry Template

[INSERT SPREADSHEET STRUCTURE OR DATABASE SCHEMA]

Example columns:
- Participant_ID
- Participant_Type (Therapist/User)
- Date_Completed
- System_Order (for users)
- Scenario_Number (for therapists)
- [All survey question columns]

---

**Document Version History:**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-14 | Initial guidelines created | [Team] |

---

**End of Evaluation Guidelines**
