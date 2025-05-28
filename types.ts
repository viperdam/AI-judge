
import { SUPPORTED_LANGUAGES } from './context/LanguageContext'; // For LanguageCode

export type Gender = 'male' | 'female' | 'other_gender' | 'prefer_not_to_say_gender' | '';

export interface UserInfo {
  name: string; 
  gender: Gender; 
  age: string;
  country: string;
  city: string;
  religion:string;
  occupation: string; 
  workHours: string; 
  stressLevel: string; 
  financialSituation: string; 
}

export interface PartnerProfile {
  name: string;
  gender: Gender; 
  age: string;
  country: string;
  city: string;
  religion: string;
  occupation: string;
  workHours: string; 
  stressLevel: string;
  financialSituation: string;
}

export interface HomeRelationshipInfo {
  duration: string; 
  recurringIssues: string; 
  hasChildren: 'Yes' | 'No' | ''; 
  childrenDetails: string; 
}

export interface ComprehensiveProfileData {
  userA: UserInfo;
  partnerB: PartnerProfile;
  homeRelationship: HomeRelationshipInfo;
  profileComplete: boolean;
}

export type AppStage =
  | 'loadingProfile'
  | 'profileIntake'
  | 'problemInputA'
  | 'problemInputB'
  | 'perspectiveA'
  | 'perspectiveB'
  | 'judgeClarificationIntakeA'
  | 'judgeClarificationIntakeB'
  | 'judgeFinalRulingDisplay' // This is the INITIAL ruling display
  | 'initialRulingFeedbackA' // User A decides to agree or rebut initial ruling
  | 'initialRulingFeedbackB' // User B decides if A agreed
  | 'rebuttalInputActiveUser' // The user who disagreed first inputs their rebuttal
  | 'presentRebuttalToOtherUser' // Show active user's rebuttal summary to the other user
  | 'rebuttalInputOtherUserCounter' // The other user inputs their counter-rebuttal
  | 'judgeUltimateFinalRulingDisplay' // Displays the FINAL-FINAL ruling after rebuttals
  | 'error';

export type IntakeWizardStep =
  | 'userA_Personal'
  | 'userA_WorkLife'
  | 'partnerB_Personal'
  | 'partnerB_WorkLife'
  | 'homeRelationshipInfo'
  | 'intakeSummary';

export interface AIPerspective {
  title: string; 
  perspectiveText: string;
}

export interface AIClarificationQuestionItem {
  questionText: string;
  suggestedAnswers: { 
    a: string; 
    b: string;
    c: string;
  };
}

export interface AIClarificationPrompts {
  introductoryTextContent?: string; 
  questionsForUserA: AIClarificationQuestionItem[];
  questionsForPartnerB: AIClarificationQuestionItem[];
  concludingTextContent?: string;
}


export interface ClarificationAnswer {
  questionText: string; 
  answerValue: 'A' | 'B' | 'C' | 'D' | 'skipped'; 
  customAnswer?: string; 
  chosenAnswerText?: string; 
}

export interface UserClarificationAnswersBundle {
  userAAnswers: ClarificationAnswer[];
  partnerBAnswers: ClarificationAnswer[];
}

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const GENDER_KEYS = ['male', 'female', 'other_gender', 'prefer_not_to_say_gender'] as const;
export const WORK_HOURS_KEYS_EXTENDED = [
    "prefer_not_to_say_wh", "none_wh", "unemployed_wh", "student_pt_wh", 
    "student_ft_wh", "part_time_wh", "standard_ft_wh", "demanding_ft_wh", 
    "very_demanding_wh", "shift_work_wh", "freelancer_wh", "homemaker_wh", 
    "retired_wh", "other_wh"
] as const;

export const STRESS_LEVEL_KEYS = ["prefer_not_to_say_sl", "low_sl", "moderate_sl", "high_sl", "very_high_sl", "variable_sl"] as const;
export const FINANCIAL_SITUATION_KEYS = ["prefer_not_to_say_fs", "comfortable_fs", "stable_fs", "managing_fs", "struggling_fs", "dependent_fs"] as const;
export const RELIGION_VALUE_KEYS = ['prefer_not_to_say_religion', 'agnostic', 'atheist', 'bahai_faith', 'buddhism', 'christianity', 'hinduism', 'islam', 'jainism', 'judaism', 'shinto', 'sikhism', 'spiritual_but_not_religious', 'taoism', 'zoroastrianism', 'other_religion'] as const;
