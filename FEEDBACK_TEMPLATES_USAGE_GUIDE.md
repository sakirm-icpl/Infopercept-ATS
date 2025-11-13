# Feedback Templates - User Guide

## Overview
The Feedback Templates feature helps team members provide consistent, comprehensive feedback efficiently by offering predefined comment templates for common evaluation scenarios.

## How to Use

### For Team Members

#### Step 1: Access the Feedback Form
1. Navigate to "My Assignments" from the main menu
2. Click on an assigned stage to open the feedback form
3. You'll see the standard feedback form with three fields:
   - Approval Status (dropdown)
   - Performance Rating (1-10)
   - Comments (textarea)

#### Step 2: Use a Template
1. Look for the **"Use Template"** button next to the "Comments" label
2. Click the button to open the template selector dropdown
3. Browse through categorized templates:
   - **Strong Candidate**: For highly qualified candidates
   - **Needs Improvement**: For candidates with potential but gaps
   - **Not Suitable**: For candidates who don't meet requirements
   - **Neutral/General**: For standard evaluations

#### Step 3: Select a Template
1. Click on any template to see a preview of its content
2. Click the template to populate the comments field
3. A green confirmation banner will appear: "Template applied - You can edit the text below"

#### Step 4: Customize (Optional)
1. The template text is now in the comments field
2. You can edit, add, or remove any text as needed
3. The character count (0/1000) updates as you type
4. If you want to start over, click the "Clear" button in the green banner

#### Step 5: Complete the Feedback
1. Select the Approval Status (Approved/Rejected)
2. Enter the Performance Rating (1-10)
3. Review your comments (template-based or custom)
4. Click "Submit Feedback"

## Available Templates

### Strong Candidate (4 templates)

**1. Strong Technical Skills**
> "The candidate demonstrated excellent technical skills during the interview. They showed strong problem-solving abilities, clear communication, and a deep understanding of the required technologies. Their approach to the technical challenges was methodical and well-structured. I recommend moving forward with this candidate."

**2. Excellent Cultural Fit**
> "The candidate exhibited outstanding alignment with our company values and culture. They demonstrated strong teamwork skills, excellent communication abilities, and a positive attitude. Their experience and approach to work align well with our team dynamics. I highly recommend this candidate for the next stage."

**3. Strong Leadership Potential**
> "The candidate showed impressive leadership qualities and strategic thinking. They articulated clear vision, demonstrated experience in managing teams, and showed excellent decision-making skills. Their past achievements and approach to challenges indicate strong potential for leadership roles. I strongly recommend advancing this candidate."

**4. Outstanding Overall Performance**
> "The candidate exceeded expectations across all evaluation criteria. They demonstrated exceptional technical competence, excellent communication skills, strong cultural alignment, and impressive problem-solving abilities. Their qualifications and performance make them an ideal fit for this position. I highly recommend proceeding to the next stage."

### Needs Improvement (4 templates)

**1. Technical Skills Need Development**
> "The candidate showed potential but has noticeable gaps in technical skills required for this role. While they demonstrated basic understanding, they struggled with more complex problems and lacked depth in key areas. With additional training and experience, they could be a good fit. I recommend proceeding with caution or considering for a junior position."

**2. Communication Skills Need Improvement**
> "The candidate has relevant technical skills but needs to improve their communication abilities. They had difficulty articulating their thoughts clearly and explaining technical concepts. This could impact their effectiveness in a collaborative environment. I recommend additional evaluation or considering for roles with less communication requirements."

**3. Limited Relevant Experience**
> "The candidate shows enthusiasm and willingness to learn but lacks sufficient relevant experience for this role. While they have foundational knowledge, they would require significant onboarding and mentoring. I recommend considering them for a more junior position or providing additional training opportunities."

**4. Mixed Performance**
> "The candidate demonstrated strengths in some areas but showed weaknesses in others. While they have potential, there are concerns about their readiness for this specific role. I recommend further evaluation in the next stage to better assess their overall fit and capabilities."

### Not Suitable (4 templates)

**1. Insufficient Technical Skills**
> "The candidate does not meet the minimum technical requirements for this position. They demonstrated significant gaps in essential skills and struggled with fundamental concepts. Their current skill level does not align with the role's requirements. I do not recommend moving forward with this candidate at this time."

**2. Poor Cultural Alignment**
> "While the candidate may have relevant technical skills, they do not align well with our company culture and values. Their approach to work, communication style, and professional demeanor raised concerns about their fit within our team. I do not recommend proceeding with this candidate."

**3. Inadequate Preparation**
> "The candidate appeared unprepared for the interview and lacked basic knowledge about our company and the role. They were unable to answer fundamental questions and did not demonstrate genuine interest in the position. I do not recommend advancing this candidate to the next stage."

**4. Not Recommended**
> "After careful evaluation, I do not recommend this candidate for the position. They did not meet the required standards across multiple evaluation criteria including technical skills, communication abilities, and cultural fit. I suggest we continue our search for more suitable candidates."

### Neutral/General (2 templates)

**1. Standard Evaluation**
> "The candidate completed the interview stage. They demonstrated adequate understanding of the role requirements and answered questions satisfactorily. Based on this evaluation, I recommend proceeding to the next stage for further assessment."

**2. Requires Team Discussion**
> "The candidate presents an interesting profile with both strengths and areas of concern. I believe this case warrants team discussion before making a final decision. I recommend scheduling a debrief to align on the evaluation and next steps."

## Tips for Best Results

### Do's ✅
- **Use templates as a starting point**: Templates provide structure, but personalize them
- **Add specific examples**: Include concrete examples from the interview
- **Be honest and constructive**: Provide actionable feedback
- **Review before submitting**: Ensure the template matches your evaluation
- **Edit as needed**: Customize templates to fit the specific situation

### Don'ts ❌
- **Don't submit without reading**: Always review the template content
- **Don't use conflicting templates**: Match template to your approval status
- **Don't skip personalization**: Add candidate-specific details when possible
- **Don't ignore validation**: Ensure all required fields are completed
- **Don't rush**: Take time to provide thoughtful feedback

## Keyboard Shortcuts

- **Esc**: Close template dropdown
- **Tab**: Navigate through form fields
- **Enter**: Submit form (when focused on submit button)

## Troubleshooting

### Template dropdown not appearing?
- Ensure you're not in read-only mode
- Check that you're assigned to the stage
- Verify you're logged in as a team member

### Can't edit template text?
- Templates are fully editable after selection
- Click in the comments field to start editing
- If field is disabled, you may be in read-only mode

### Template not saving?
- Templates only populate the comments field
- You must click "Submit Feedback" to save
- Ensure all required fields are completed

### Want to remove a template?
- Click the "Clear" button in the green banner
- Or manually delete all text from the comments field

## For Administrators

### Viewing Template-Based Feedback
- Admins can view all feedback in read-only mode
- Template-based feedback appears the same as custom feedback
- No special indicator shows if a template was used
- Focus is on the content quality, not the source

### Managing Templates
- Templates are stored in backend configuration
- To add/modify templates, update `backend/app/config/feedback_templates.py`
- No database changes required
- Restart backend service after template changes

## Benefits

1. **Save Time**: Pre-written templates speed up feedback submission
2. **Consistency**: Standardized feedback across team members
3. **Quality**: Well-structured, comprehensive templates
4. **Flexibility**: Full editing capability after template selection
5. **Guidance**: Templates help structure thoughts and feedback
6. **Professional**: Polished, professional feedback language

## Support

For questions or issues with the feedback templates feature:
1. Contact your system administrator
2. Refer to the main ATS documentation
3. Check the implementation guide for technical details

---

**Last Updated**: November 2025
**Version**: 1.0
**Feature Status**: Active
