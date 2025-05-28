import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { 
    ComprehensiveProfileData, AIClarificationPrompts, AIClarificationQuestionItem,
    UserClarificationAnswersBundle, ClarificationAnswer, LanguageCode 
} from '../types';
import { SUPPORTED_LANGUAGES } from '../context/LanguageContext';


const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY" });
const modelName = 'gemini-2.5-flash-preview-04-17';

const getLanguageName = (code: LanguageCode): string => {
  const langName = SUPPORTED_LANGUAGES[code];
  return langName || SUPPORTED_LANGUAGES['en'] || 'English';
};

const formatComprehensiveProfileForAI = (profile: ComprehensiveProfileData): string => {
  return `
Full Context for the AI Analysis:

User A's Profile:
- Name: ${profile.userA.name || 'User A'}
- Gender: ${profile.userA.gender || 'Not specified'}
- Age: ${profile.userA.age || 'Not specified'}
- Country: ${profile.userA.country || 'Not specified'}
- City: ${profile.userA.city || 'Not specified'}
- Religion/Beliefs: ${profile.userA.religion || 'Not specified'}
- Occupation: ${profile.userA.occupation || 'Not specified'}
- Work Hours: ${profile.userA.workHours || 'Not specified'} 
- Stress Level: ${profile.userA.stressLevel || 'Not specified'}
- Financial Situation: ${profile.userA.financialSituation || 'Not specified'}

Partner B's Profile:
- Name: ${profile.partnerB.name || 'Partner B'}
- Gender: ${profile.partnerB.gender || 'Not specified'}
- Age: ${profile.partnerB.age || 'Not specified'}
- Country: ${profile.partnerB.country || 'Not specified'}
- City: ${profile.partnerB.city || 'Not specified'}
- Religion/Beliefs: ${profile.partnerB.religion || 'Not specified'}
- Occupation: ${profile.partnerB.occupation || 'Not specified'}
- Work Hours: ${profile.partnerB.workHours || 'Not specified'}
- Stress Level: ${profile.partnerB.stressLevel || 'Not specified'}
- Financial Situation: ${profile.partnerB.financialSituation || 'Not specified'}

Home and Relationship Context:
- Relationship Duration: ${profile.homeRelationship.duration || 'Not specified'}
- Has Children: ${profile.homeRelationship.hasChildren || 'Not specified'}
- Children Details: ${profile.homeRelationship.hasChildren === 'Yes' ? (profile.homeRelationship.childrenDetails || 'Details not specified') : 'N/A'}
- Key Recurring Issues/Themes/Strengths in Relationship: ${profile.homeRelationship.recurringIssues || 'Not specified'}
  `.trim();
};

async function callGeminiAPI(model: string, contents: string, systemInstruction: string, temperature: number, topP: number, topK: number): Promise<string> {
  if (!apiKey || apiKey === "MISSING_API_KEY") {
    throw new Error("API_KEY_INVALID: GEMINI_API_KEY is not configured. Please set it up in your environment variables.");
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: { systemInstruction, temperature, topP, topK },
    });
    const text = response.text;
    if (!text) {
      throw new Error("Received an empty response from the AI.");
    }
    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      if (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID") || ((error as any).cause as any)?.message?.includes("API key not valid")) {
        throw new Error("API_KEY_INVALID: The provided API key is not valid or is missing. Please check your API key configuration.");
      }
      throw new Error(`Gemini API request failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching data from Gemini API.");
  }
}


export const getPerspectiveA_RolePlay = async (problemDescriptionA: string, profileData: ComprehensiveProfileData, language: LanguageCode): Promise<string> => {
  const languageName = getLanguageName(language);
  const userAName = profileData.userA.name || "User A";
  const systemInstruction = `You are an AI tasked with embodying ${userAName} (User A).
Your goal is to articulate ${userAName}'s perspective, feelings, and concerns regarding the specific problem they've described, based *solely* on their provided profile and the problem itself.
Speak in the first person, as if you ARE ${userAName}. Start with something like "My name is ${userAName}, and from my point of view..." or "As ${userAName}, how I see this situation is...".
Reflect their likely emotional state, their understanding of the issue, and what they might be hoping for or fearing.
Consider their age, gender, occupation, work hours, stress level, financial situation, and cultural context (religion, country, city) as you formulate their "voice."
If they have children, consider how that impacts their perspective on the problem.
Do not offer solutions or advice. Simply state their perspective clearly and empathetically.
Structure your response as a personal narrative or reflection.
Focus on the "I feel," "I think," "I'm concerned about" aspects.
IMPORTANT: Your entire response MUST be in ${languageName} (${language}).`;

  const fullPrompt = `
${formatComprehensiveProfileForAI(profileData)}

The Specific Problem ${userAName} (User A) is facing and has described:
${problemDescriptionA}

Now, embody ${userAName} (User A) and describe their perspective on this problem in ${languageName} (${language}):
  `;
  return callGeminiAPI(modelName, fullPrompt, systemInstruction, 0.75, 0.9, 35);
};

export const getPerspectiveB_RolePlay = async (
  problemDescriptionA: string, 
  problemDescriptionB: string, 
  profileData: ComprehensiveProfileData,
  perspectiveA_text: string, // Full perspective from A, for broader context for the AI
  summaryOfAComplaint: string, // New parameter: Concise summary of A's complaint
  language: LanguageCode
): Promise<string> => {
  const languageName = getLanguageName(language);
  const userAName = profileData.userA.name || "User A";
  const partnerBName = profileData.partnerB.name || "Partner B";
  const systemInstruction = `You are an AI tasked with first addressing ${partnerBName} (Partner B) directly, then embodying them.
Your multi-part goal is:
1.  **Present Partner A's Concern:** Start by presenting a concise summary of ${userAName}'s (User A's) complaint to ${partnerBName}. Phrase it like: "${userAName} has expressed their concern, summarizing it as: '${summaryOfAComplaint}'. From your perspective, ${partnerBName}, could you please share your understanding of why this might be happening or your thoughts on this?"
2.  **Embody Partner B:** After posing the question based on the summary, you will then articulate ${partnerBName}'s perspective, feelings, and concerns regarding the situation. This part should be based *solely* on their provided profile AND THEIR OWN DESCRIPTION OF THE PROBLEM.
    *   Speak in the first person, as if you ARE ${partnerBName}. Transition smoothly after your question. For example: "Now, speaking as ${partnerBName}, how I see this situation is..." or "From my point of view as ${partnerBName}, regarding my own description of what happened...".
    *   Reflect their likely emotional state, their understanding of the issue based on THEIR story, and how they might be reacting or what they might be hoping for/fearing.
    *   CRITICALLY CONSIDER: ${partnerBName}'s age, gender, occupation (e.g., 'None' for not working), work hours, stress level, financial situation, and cultural context (religion, country, city). These are paramount.
    *   If there are children, how does this problem and ${userAName}'s concern (as summarized) likely impact ${partnerBName}, considering the children and THEIR OWN problem description?
    *   Focus on how ${partnerBName} likely experiences the situation, based on their own words and profile.
    *   Do not offer solutions or advice in this embodied response. Simply state their perspective clearly and empathetically based on their story.
    *   Structure the embodied response as a personal narrative or reflection. Focus on the "I feel," "I think," "I'm concerned about" aspects from ${partnerBName}'s point of view of their problem description.
    *   You have User A's full problem description and their full articulated perspective for broader context, but ${partnerBName}'s embodied response should primarily stem from THEIR OWN inputs.

IMPORTANT: Your entire response, including the initial presentation of the summary and question, and the subsequent embodied perspective, MUST be in ${languageName} (${language}).`;

  const fullPrompt = `
${formatComprehensiveProfileForAI(profileData)}

User A's (${userAName}) Original Description of the Problem:
${problemDescriptionA}

Summary of User A's (${userAName}) Complaint (to be presented to ${partnerBName}):
${summaryOfAComplaint}

${partnerBName}'s (Partner B's) OWN Description of the Problem/Situation:
${problemDescriptionB}

User A's (${userAName}) Full Articulated Perspective (for AI's background context only for the embodiment part):
${perspectiveA_text}

Now, first, as the AI facilitator, present ${userAName}'s summarized complaint to ${partnerBName} and ask for their view. Then, embody ${partnerBName} (Partner B) and describe their perspective on their own described situation in ${languageName} (${language}). Follow all instructions in the system prompt.
  `;
  return callGeminiAPI(modelName, fullPrompt, systemInstruction, 0.8, 0.9, 40);
};

export const getAIJudgeClarificationPrompts = async (
  problemDescriptionA: string,
  problemDescriptionB: string,
  profileData: ComprehensiveProfileData,
  perspectiveA_text: string,
  perspectiveB_text: string,
  language: LanguageCode
): Promise<AIClarificationPrompts> => {
  const languageName = getLanguageName(language);
  const userAName = profileData.userA.name || "User A";
  const partnerBName = profileData.partnerB.name || "Partner B";

  const systemInstruction = `You are the AI Judge in the preliminary phase.
You have reviewed all context. Your task is to generate:
1.  An introductory statement for this clarification phase (addressing both users).
2.  A set of EXACTLY 3 specific, insightful clarification questions FOR ${userAName} (User A). Each question must include ${userAName}'s name and provide THREE distinct, nuanced suggested answer options (A, B, C).
3.  A set of EXACTLY 3 specific, insightful clarification questions FOR ${partnerBName} (Partner B). Each question must include ${partnerBName}'s name and provide THREE distinct, nuanced suggested answer options (A, B, C).
4.  A concluding statement for this clarification phase (addressing both users).

Output Format and Language Instruction:
You MUST structure your response using these exact English structural markers. All content *within* these markers (intro, questions, suggestions, outro) MUST be in ${languageName} (${language}).

[[AI Judge's Introductory Statement for Clarification Phase]]
... (content for this section, in ${languageName}) ...

[[User A Question Set Start - For ${userAName}]]
[[QUESTION]]
... (${userAName}, Question 1 text, in ${languageName}) ...
[[SUGGESTION_A]]
... (Suggested answer A for Question 1, in ${languageName}) ...
[[SUGGESTION_B]]
... (Suggested answer B for Question 1, in ${languageName}) ...
[[SUGGESTION_C]]
... (Suggested answer C for Question 1, in ${languageName}) ...

[[QUESTION]]
... (${userAName}, Question 2 text, in ${languageName}) ...
[[SUGGESTION_A]] ... [[SUGGESTION_B]] ... [[SUGGESTION_C]] ...

[[QUESTION]]
... (${userAName}, Question 3 text, in ${languageName}) ...
[[SUGGESTION_A]] ... [[SUGGESTION_B]] ... [[SUGGESTION_C]] ...
[[User A Question Set End]]

[[Partner B Question Set Start - For ${partnerBName}]]
[[QUESTION]]
... (${partnerBName}, Question 1 text, in ${languageName}) ...
[[SUGGESTION_A]]
... (Suggested answer A for Question 1, in ${languageName}) ...
[[SUGGESTION_B]]
... (Suggested answer B for Question 1, in ${languageName}) ...
[[SUGGESTION_C]]
... (Suggested answer C for Question 1, in ${languageName}) ...

[[QUESTION]]
... (${partnerBName}, Question 2 text, in ${languageName}) ...
[[SUGGESTION_A]] ... [[SUGGESTION_B]] ... [[SUGGESTION_C]] ...

[[QUESTION]]
... (${partnerBName}, Question 3 text, in ${languageName}) ...
[[SUGGESTION_A]] ... [[SUGGESTION_B]] ... [[SUGGESTION_C]] ...
[[Partner B Question Set End]]

[[AI Judge's Concluding Statement for this Clarification Phase]]
... (content for this section, in ${languageName}) ...

Make questions highly specific to the details in BOTH problem descriptions, profiles (e.g., work status 'None', stress, children for the relevant person), and the articulated perspectives. The goal is to elicit deeper, problem-focused insights. Phrase questions neutrally.
The suggested answers A, B, C should represent distinct, plausible responses or feelings.
`;

  const fullPrompt = `
${formatComprehensiveProfileForAI(profileData)}

User A's (${userAName}) Description of the Problem:
${problemDescriptionA}

Partner B's (${partnerBName}) Description of the Problem:
${problemDescriptionB}

User A's (${userAName}) Articulated Perspective (AI Role-Play):
${perspectiveA_text}

Partner B's (${partnerBName}) Articulated Perspective (AI Role-Play, based on THEIR problem description):
${perspectiveB_text}

Now, as the AI Judge, generate your introductory statement, 3 questions for ${userAName} (User A), 3 questions for ${partnerBName} (Partner B) (each question with three distinct suggested answers A, B, C), and a concluding statement. Follow the specified output format and language instructions (content in ${languageName} (${language}), structural markers in English) EXACTLY. Ensure each question for a specific user includes their name.
  `;
  
  const rawResponse = await callGeminiAPI(modelName, fullPrompt, systemInstruction, 0.7, 0.85, 38);

  const parsedPrompts: AIClarificationPrompts = {
    questionsForUserA: [],
    questionsForPartnerB: [],
  };

  const introRegex = /\[\[AI Judge's Introductory Statement for Clarification Phase\]\]\s*([\s\S]*?)\s*(?=\[\[User A Question Set Start|\n\n|$)/i;
  const outroRegex = /\[\[AI Judge's Concluding Statement for this Clarification Phase\]\]\s*([\s\S]*?)\s*($)/i;
  
  const userAQuestionSetRegex = new RegExp(`\\[\\[User A Question Set Start - For ${userAName}\\]\\]\\s*([\\s\\S]*?)\\s*\\[\\[User A Question Set End\\]\\]`, "i");
  const partnerBQuestionSetRegex = new RegExp(`\\[\\[Partner B Question Set Start - For ${partnerBName}\\]\\]\\s*([\\s\\S]*?)\\s*\\[\\[Partner B Question Set End\\]\\]`, "i");
  
  const introMatch = rawResponse.match(introRegex);
  if (introMatch && introMatch[1]) parsedPrompts.introductoryTextContent = introMatch[1].trim();
  
  const outroMatch = rawResponse.match(outroRegex);
  if (outroMatch && outroMatch[1]) parsedPrompts.concludingTextContent = outroMatch[1].trim();

  const parseQuestionBlock = (block: string): AIClarificationQuestionItem[] => {
    const questions: AIClarificationQuestionItem[] = [];
    const questionRegex = /\[\[QUESTION\]\]\s*([\s\S]*?)\s*\[\[SUGGESTION_A\]\]\s*([\s\S]*?)\s*\[\[SUGGESTION_B\]\]\s*([\s\S]*?)\s*\[\[SUGGESTION_C\]\]\s*([\s\S]*?)(?=\s*\[\[QUESTION\]\]|$)/gi;
    let match;
    while ((match = questionRegex.exec(block)) !== null) {
      questions.push({
        questionText: match[1].trim(), // AI should include the name here per instruction
        suggestedAnswers: {
          a: match[2].trim(),
          b: match[3].trim(),
          c: match[4].trim(),
        }
      });
    }
    return questions;
  };

  const userAQuestionSetMatch = rawResponse.match(userAQuestionSetRegex);
  if (userAQuestionSetMatch && userAQuestionSetMatch[1]) {
    parsedPrompts.questionsForUserA = parseQuestionBlock(userAQuestionSetMatch[1]);
  }

  const partnerBQuestionSetMatch = rawResponse.match(partnerBQuestionSetRegex);
  if (partnerBQuestionSetMatch && partnerBQuestionSetMatch[1]) {
    parsedPrompts.questionsForPartnerB = parseQuestionBlock(partnerBQuestionSetMatch[1]);
  }
  
  // Fallback Data
  const fallbackIntro = `In ${languageName}: I have reviewed both perspectives and problem descriptions. To provide the clearest final assessment, I need each of you to reflect on the following points regarding the current problem. Please answer thoughtfully:`;
  const fallbackConcluding = `In ${languageName}: Your individual, thoughtful answers will be crucial for forming the final assessment.`;

  const fallbackQuestionsForUserA: AIClarificationQuestionItem[] = [
      { questionText: `In ${languageName}: ${userAName}, reflecting on your own description of the events, what was your primary emotional response during the peak of this issue?`, suggestedAnswers: { a: `In ${languageName}: Primarily frustration/anger.`, b: `In ${languageName}: Primarily sadness/disappointment.`, c: `In ${languageName}: Primarily confusion/anxiety.` } },
      { questionText: `In ${languageName}: ${userAName}, what specific need or desire of yours was not met in this situation?`, suggestedAnswers: { a: `In ${languageName}: The need for understanding/validation.`, b: `In ${languageName}: The need for support/action.`, c: `In ${languageName}: The need for space/autonomy.` } },
      { questionText: `In ${languageName}: ${userAName}, considering the recurring issues you mentioned in your profile, how does this specific incident connect to those broader patterns?`, suggestedAnswers: { a: `In ${languageName}: It's a clear example of the same pattern.`, b: `In ${languageName}: It's related, but slightly different.`, c: `In ${languageName}: It seems unrelated to past issues.` } },
  ];
  const fallbackQuestionsForPartnerB: AIClarificationQuestionItem[] = [
      { questionText: `In ${languageName}: ${partnerBName}, reflecting on your own description of the events, what was your primary emotional response during the peak of this issue?`, suggestedAnswers: { a: `In ${languageName}: Mainly felt misunderstood/defensive.`, b: `In ${languageName}: Mainly felt hurt/rejected.`, c: `In ${languageName}: Mainly felt overwhelmed/stressed.` } },
      { questionText: `In ${languageName}: ${partnerBName}, considering ${userAName}'s description of the events, what is one point they made that you find most difficult to understand or accept from their perspective?`, suggestedAnswers: { a: `In ${languageName}: Their interpretation of my intentions.`, b: `In ${languageName}: Their description of my behavior.`, c: `In ${languageName}: Their stated emotional reaction to what happened.` } },
      { questionText: `In ${languageName}: ${partnerBName}, if you could change one thing about how this specific situation was handled by either of you, what would it be?`, suggestedAnswers: { a: `In ${languageName}: My own initial reaction.`, b: `In ${languageName}: ${userAName}'s approach to the discussion.`, c: `In ${languageName}: The timing or setting of the conversation.` } },
  ];


  if (parsedPrompts.questionsForUserA.length < 3) {
      console.warn(`AI Judge Clarification Prompts: Parsing failed or not enough questions generated for User A (${parsedPrompts.questionsForUserA.length}). Using hardcoded fallback questions for User A.`);
      parsedPrompts.questionsForUserA = fallbackQuestionsForUserA;
  }
  if (parsedPrompts.questionsForPartnerB.length < 3) {
      console.warn(`AI Judge Clarification Prompts: Parsing failed or not enough questions generated for Partner B (${parsedPrompts.questionsForPartnerB.length}). Using hardcoded fallback questions for Partner B.`);
      parsedPrompts.questionsForPartnerB = fallbackQuestionsForPartnerB;
  }

  parsedPrompts.introductoryTextContent = parsedPrompts.introductoryTextContent || fallbackIntro;
  parsedPrompts.concludingTextContent = parsedPrompts.concludingTextContent || fallbackConcluding;
  
  return parsedPrompts;
};

const formatClarificationAnswerForPrompt = (answer: ClarificationAnswer): string => {
    let response = `Q: ${answer.questionText}\nA: `;
    if (answer.answerValue === 'skipped') {
        response += "(Skipped)";
    } else if (answer.answerValue === 'D' && answer.customAnswer) {
        response += `Other - ${answer.customAnswer}`;
    } else if (answer.answerValue === 'D' && !answer.customAnswer) {
        response += `Other (No specification provided)`;
    } else if (answer.chosenAnswerText) { 
        response += `${answer.answerValue} - ${answer.chosenAnswerText}`;
    } else { 
        response += `Selected option ${answer.answerValue} (text not available)`;
    }
    return response;
};

const formatClarificationAnswersBundleForPrompt = (bundle: UserClarificationAnswersBundle, userAName: string, partnerBName: string): string => {
  let formatted = `${userAName}'s (User A's) Answers to Clarification Questions:\n`;
  bundle.userAAnswers.forEach((ans) => {
    formatted += `${formatClarificationAnswerForPrompt(ans)}\n`;
  });
  formatted += `\n${partnerBName}'s (Partner B's) Answers to Clarification Questions:\n`;
  bundle.partnerBAnswers.forEach((ans) => {
    formatted += `${formatClarificationAnswerForPrompt(ans)}\n`;
  });
  return formatted.trim();
};


export const getFinalAIJudgeRulingWithClarifications = async (
  problemDescriptionA: string,
  problemDescriptionB: string,
  profileData: ComprehensiveProfileData,
  perspectiveA_text: string,
  perspectiveB_text: string,
  clarificationAnswersBundle: UserClarificationAnswersBundle,
  language: LanguageCode
): Promise<string> => {
  const languageName = getLanguageName(language);
  const userAName = profileData.userA.name || "User A";
  const partnerBName = profileData.partnerB.name || "Partner B";
  const systemInstruction = `You are the AI Judge delivering your Initial Ruling (pre-rebuttal).
You have ALL information:
1. ${userAName}'s & ${partnerBName}'s detailed profiles (including name, gender, work status like "None", stress, finance, children, culture).
2. ${userAName}'s description of the problem.
3. ${partnerBName}'s description of the problem.
4. ${userAName}'s articulated perspective (AI role-play).
5. ${partnerBName}'s articulated perspective (AI role-play based on their story).
6. CRUCIALLY, ${userAName}'s direct answers (including chosen text for A/B/C options) to your targeted clarification questions about this specific problem.
7. CRUCIALLY, ${partnerBName}'s direct answers (including chosen text for A/B/C options) to your targeted clarification questions about this specific problem.

Your Task for this INITIAL RULING:
1.  **Acknowledge Your Role & Full Context:** Briefly state you are providing the initial ruling, having considered all information including the recent clarifications from BOTH parties.
2.  **Judge's Definitive Re-summary of the Core Issue:** Under the English heading "Judge's Definitive Re-summary of the Core Issue:", provide a concise (2-4 sentences) synthesis of the central conflict, now refined by BOTH sets of clarification answers.
3.  **In-depth Analysis of Perspectives, Contributing Factors & Responsibilities:** Under the English heading "In-depth Analysis & Contributing Factors:", discuss:
    *   How ${userAName}'s clarifications shed new light on their perspective and actions.
    *   How ${partnerBName}'s clarifications shed new light on their perspective and actions.
    *   Compare and contrast their answers to the same questions (if any were similar). Where do their views converge or diverge significantly based on their answers to their specific question sets?
    *   CRITICALLY analyze how each person's specific circumstances (name, gender, occupation/work status "None", work hours, stress, financial situation, children, culture FROM PROFILES) AND their behaviors/attitudes (FROM BOTH PROBLEM DESCRIPTIONS, BOTH PERSPECTIVES, AND BOTH SETS OF CLARIFICATIONS) contribute to THIS SPECIFIC PROBLEM.
    *   **Assigning Responsibility (If Clear and Warranted by Evidence):** Based on the totality of evidence (especially the dual clarifications), if one party's actions or inactions appear to be the primary driver of THIS specific negative outcome, or if their behavior is clearly more unconstructive or unfair, you MUST state this clearly and directly, but without inflammatory language. Explain *why* the evidence points to this conclusion (e.g., "${userAName}'s actions, as described in their problem description and clarification [answer X], seem to have escalated the conflict significantly because..."). If responsibility is shared, explain the dynamics of that shared responsibility. Avoid assigning blame if the situation is genuinely ambiguous or complexly co-created without a clear primary instigator. Your goal is CLARITY.
4.  **The AI Judge's Actionable & Directive Final Recommendations:** Under the English heading "The AI Judge's Final Recommendations:", provide 2-4 extremely clear, actionable, and summarized bullet points.
    *   These must be highly realistic, compassionate, and deeply informed by the full context including BOTH sets of clarifications. Avoid vague, "political" or overly diplomatic phrasing.
    *   If responsibility was assigned, recommendations should directly address what the individual(s) identified as contributing more to the problem *must do* or *must change*.
    *   Provide recommendations for BOTH parties, even if one had less responsibility for this specific issue (e.g., how to respond, how to protect their well-being, how to support positive change).
    *   Focus on concrete steps for resolution, improved communication, boundary setting, or healthier coping.
    *   If children are involved, ensure recommendations consider their well-being as a priority.
5.  **Concluding Thought (Optional):** A brief, impactful closing statement related to growth or future interactions.
6.  **Tone:** Impartial and objective in analysis. Can be more direct and assertive in recommendations if the situation and evidence (especially from clarifications) warrant it. Always maintain profound empathy and respect. The goal is constructive resolution and clarity, even if it involves difficult truths.
7.  **Structure:** Use newline characters for clear separation. Use English headings as specified.
8.  **Safety First:** If any information hints at abuse, severe mental health crisis, or danger, you MUST strongly and clearly advise seeking immediate help from qualified human professionals. State that you, as an AI, cannot offer solutions for such critical situations.
IMPORTANT: All content under these English headings MUST be in ${languageName} (${language}). The structural English headings themselves MUST be used for parsing.`;

  const fullPrompt = `
${formatComprehensiveProfileForAI(profileData)}

${userAName}'s (User A's) Description of the Problem:
${problemDescriptionA}

${partnerBName}'s (Partner B's) Description of the Problem:
${problemDescriptionB}

${userAName}'s (User A's) Articulated Perspective (as voiced by AI role-play):
${perspectiveA_text}

${partnerBName}'s (Partner B's) Articulated Perspective (as voiced by AI role-play based on their story):
${perspectiveB_text}

BOTH PARTIES' Direct Answers to Your Clarification Questions about THIS SPECIFIC PROBLEM:
${formatClarificationAnswersBundleForPrompt(clarificationAnswersBundle, userAName, partnerBName)}

Now, as the AI Judge, provide your INITIAL RULING. ALL content under the specified English headings MUST be in ${languageName} (${language}). Follow the specified structure, directness, and tone guidelines meticulously.
  `;
  return callGeminiAPI(modelName, fullPrompt, systemInstruction, 0.55, 0.7, 20);
};

export const summarizeInputText = async (
    textToSummarize: string, 
    language: LanguageCode, 
    contextLabel: string,
    profileData: ComprehensiveProfileData,
    originalProblemA: string,
    originalProblemB?: string
): Promise<string> => {
    const languageName = getLanguageName(language);
    const systemInstruction = `You are an AI assistant. Your task is to concisely and neutrally summarize the following text. This text represents ${contextLabel} in the context of a relationship disagreement.
    Focus on extracting the core points and arguments. Do not add interpretation or judgment.
    Respond ONLY with the summary in ${languageName}. The summary should be 1-3 sentences long.`;

    let problemContext = `Original Problem (User A - ${profileData.userA.name || 'User A'}): ${originalProblemA}`;
    if (originalProblemB) {
        problemContext += `\nOriginal Problem (Partner B - ${profileData.partnerB.name || 'Partner B'}): ${originalProblemB}`;
    }

    const fullPrompt = `
Context: Relationship Disagreement
Parties Involved: User A (${profileData.userA.name || 'User A'}) and Partner B (${profileData.partnerB.name || 'Partner B'}).
Full Profile Data:
${formatComprehensiveProfileForAI(profileData)}
${problemContext}

Text to Summarize (${contextLabel}, to be output in ${languageName}):
${textToSummarize}

Summary (in ${languageName}):
`;
    return callGeminiAPI(modelName, fullPrompt, systemInstruction, 0.3, 0.8, 15);
};


export const getTheUltimateFinalJudgeRuling = async (
  profileData: ComprehensiveProfileData,
  problemA: string,
  problemB: string,
  perspectiveA: string,
  perspectiveB: string,
  clarificationsA: ClarificationAnswer[],
  clarificationsB: ClarificationAnswer[],
  initialRuling: string,
  rebuttalA_summary: string | null, // Could be User A's first rebuttal, or counter-rebuttal
  rebuttalB_summary: string | null, // Could be Partner B's first rebuttal, or counter-rebuttal
  language: LanguageCode
): Promise<string> => {
  const languageName = getLanguageName(language);
  const userAName = profileData.userA.name || "User A";
  const partnerBName = profileData.partnerB.name || "Partner B";

  let rebuttalContext = "";
  if (rebuttalA_summary && rebuttalB_summary) {
    rebuttalContext = `Both parties provided rebuttals. ${userAName}'s summarized rebuttal: "${rebuttalA_summary}". ${partnerBName}'s summarized rebuttal: "${rebuttalB_summary}".`;
  } else if (rebuttalA_summary) {
    rebuttalContext = `${userAName} provided rebuttal points: "${rebuttalA_summary}". ${partnerBName} provided no counter-rebuttal or accepted these points.`;
  } else if (rebuttalB_summary) {
    rebuttalContext = `${partnerBName} provided rebuttal points: "${rebuttalB_summary}". ${userAName} provided no counter-rebuttal or accepted these points.`;
  } else {
    rebuttalContext = "Neither party provided new rebuttal points after the initial ruling, or both agreed with it / subsequent rebuttals.";
  }


  const systemInstruction = `You are the AI Judge delivering your ULTIMATE FINAL RULING. This is after an initial ruling and a potential rebuttal process.
You have ALL information:
1.  ${userAName}'s & ${partnerBName}'s detailed profiles (name, gender, work, stress, finance, children, culture).
2.  ${userAName}'s original problem description.
3.  ${partnerBName}'s original problem description.
4.  AI-articulated perspective for ${userAName}.
5.  AI-articulated perspective for ${partnerBName}.
6.  ${userAName}'s answers to their specific clarification questions (including chosen text for A/B/C options).
7.  ${partnerBName}'s answers to their specific clarification questions (including chosen text for A/B/C options).
8.  Your own Initial AI Judge Ruling.
9.  Rebuttal Phase Outcome: ${rebuttalContext}

Your Task for this ULTIMATE FINAL RULING:
Your response MUST be structured using the following English headings EXACTLY. All content under these headings must be in ${languageName}.

[[Ultimate Verdict]]
... (Provide an extremely concise, 1-2 sentence core verdict. Acknowledge the rebuttal process. Be UNFLINCHINGLY DIRECT: If, after considering EVERYTHING (initial info + rebuttals), one party is clearly more "in the wrong" or their arguments/rebuttals were found to be less valid or not well-supported by the overall context and profile data (e.g., work status of 'None', stress levels, religious views if relevant), you MUST state this clearly without "shying away". E.g., "${userAName}'s position, even after rebuttal, remains less substantiated given X, Y, Z factors from their profile and the overall evidence." or "${partnerBName}'s rebuttal did not sufficiently address the core inconsistencies pointed out in the initial ruling, and their responsibility in this matter remains primary." If responsibility is shared, affirm that. If the rebuttals changed your mind from the initial ruling, state that.) ...

[[Primary Suggestions]]
... (Provide 1-3 highly summarized, extremely clear, actionable bullet points. These are the most critical actions. If responsibility was clearly assigned in the verdict, these suggestions MUST directly address what the identified individual(s) *must do* or *must change*. Be directive.)
- Suggestion 1...
- Suggestion 2...
- (Suggestion 3 if absolutely critical)...

[[Secondary Suggestions]]
... (Provide 2-3 slightly more general but still concrete bullet points for ongoing improvement or consideration by both parties. These support the primary suggestions or address broader relationship health related to the case.)
- Suggestion 1...
- Suggestion 2...
- (Suggestion 3 if useful)...

[[Detailed Reasoning]]
... (This is CRUCIAL. Explain HOW you arrived at the [[Ultimate Verdict]] and [[Primary Suggestions]].
    -   Briefly state how (or if) the rebuttal points (or lack thereof) influenced this final outcome compared to the initial ruling. Explicitly mention if a rebuttal was strong, weak, or changed nothing.
    -   Explicitly reference key elements from the comprehensive profiles (e.g., ${userAName}'s stated stress level of '${profileData.userA.stressLevel}', ${partnerBName}'s occupation of '${profileData.partnerB.occupation}', religious views like '${profileData.userA.religion}', financial situation, presence of children and their details like '${profileData.homeRelationship.childrenDetails}') and explain how these factual profile details, alongside the narratives, clarifications, and rebuttals, informed your logic and weighing of responsibilities.
    -   Connect these profile elements to the behaviors, communication patterns, and emotional responses demonstrated in the problem descriptions and clarification answers.
    -   If one party's rebuttal was deemed weak or invalid, explain why in the context of the total evidence.
    -   This section must clearly "show your work" on how profile data + user inputs + rebuttals led to the direct verdict. Be analytical and evidence-based.) ...

Tone: Maintain impartiality in analysis where possible, but the [[Ultimate Verdict]] and [[Primary Suggestions]] MUST be direct and assertive, especially if evidence strongly points to unequal responsibility. Empathy should underpin the reasoning, but clarity and directness are paramount for this final stage.
Safety First: If any information (original or rebuttal) hints at abuse, severe mental health crisis, or danger, prioritize advising seeking immediate help from qualified human professionals within the [[Detailed Reasoning]] or as a standalone warning if severe.
IMPORTANT: All content under the English headings MUST be in ${languageName}.
`;

  const clarificationBundle: UserClarificationAnswersBundle = {
      userAAnswers: clarificationsA,
      partnerBAnswers: clarificationsB,
  };
  
  const fullPrompt = `
Full User & Partner Profile Data:
${formatComprehensiveProfileForAI(profileData)}

User A's (${userAName}) Original Description of the Problem:
${problemA}

Partner B's (${partnerBName}) Original Description of the Problem:
${problemB}

User A's (${userAName}) Articulated Perspective (AI Role-Play):
${perspectiveA}

Partner B's (${partnerBName}) Articulated Perspective (AI Role-Play, based on THEIR problem description):
${perspectiveB}

Clarification Phase - BOTH PARTIES' Direct Answers to their respective question sets:
${formatClarificationAnswersBundleForPrompt(clarificationBundle, userAName, partnerBName)}

The AI Judge's Initial Ruling (before any rebuttal):
${initialRuling}

Rebuttal Phase Information:
${userAName}'s (User A) Summarized Rebuttal Points (if any, could be initial or counter):
${rebuttalA_summary || "No rebuttal points were actively submitted by User A in this final stage calculation."}

${partnerBName}'s (Partner B) Summarized Rebuttal Points (if any, could be initial or counter):
${rebuttalB_summary || "No rebuttal points were actively submitted by Partner B in this final stage calculation."}
(Note: "No rebuttal points" above means either they agreed, or their points were from an earlier stage and are now implicitly part of the context if they led to this final calculation with the other party's rebuttal.)

Now, as the AI Judge, provide your ULTIMATE FINAL RULING in ${languageName}. Follow the specified structure, directness, and tone guidelines meticulously, using the English structural markers provided.
  `;
  return callGeminiAPI(modelName, fullPrompt, systemInstruction, 0.45, 0.75, 25); 
};
