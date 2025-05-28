
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useTranslations } from '../context/LanguageContext';

interface FinalAssessmentDisplayProps {
  assessment: string;
  onStartNewFullAnalysis: () => void; 
  isLoading: boolean;
  isUltimate: boolean; // True if this is the ultimate final ruling after rebuttals
}

// Define the English structural headers the AI is instructed to use
const DEFINITIVE_SUMMARY_HEADER_EN = "Judge's Definitive Re-summary of the Core Issue:";
const ANALYSIS_FACTORS_HEADER_EN = "In-depth Analysis & Contributing Factors:";
const FINAL_RECOMMENDATIONS_HEADER_EN = "The AI Judge's Final Recommendations:";

// Headers for the Ultimate Final Ruling
const ULTIMATE_VERDICT_HEADER_EN = "[[Ultimate Verdict]]";
const PRIMARY_SUGGESTIONS_HEADER_EN = "[[Primary Suggestions]]";
const SECONDARY_SUGGESTIONS_HEADER_EN = "[[Secondary Suggestions]]";
const DETAILED_REASONING_HEADER_EN = "[[Detailed Reasoning]]";


export const FinalAssessmentDisplay: React.FC<FinalAssessmentDisplayProps> = ({ assessment, onStartNewFullAnalysis, isLoading, isUltimate }) => {
  const { t } = useTranslations();

  if (isLoading && !assessment) { 
    return <LoadingSpinner loadingText={t('loadingProfile')} />; // Or a more specific loading text
  }
  
  if (!assessment) return null;

  let title = isUltimate ? t('ultimateFinalRulingTitle') : t('finalRulingTitle');
  let summaryContent = "";
  let analysisContent = "";
  let recommendationsContent = "";
  let verdictContent = "";
  let primarySuggestionsContent = "";
  let secondarySuggestionsContent = "";
  let detailedReasoningContent = "";

  const extractSection = (text: string, startMarker: string, endMarkers: string[]): string => {
    const startIndex = text.toLowerCase().indexOf(startMarker.toLowerCase());
    if (startIndex === -1) return "";

    let endIndex = text.length;
    for (const marker of endMarkers) {
      const markerIndex = text.toLowerCase().indexOf(marker.toLowerCase(), startIndex + startMarker.length);
      if (markerIndex !== -1) {
        endIndex = Math.min(endIndex, markerIndex);
      }
    }
    return text.substring(startIndex + startMarker.length, endIndex).trim();
  };

  if (isUltimate) {
    verdictContent = extractSection(assessment, ULTIMATE_VERDICT_HEADER_EN, [PRIMARY_SUGGESTIONS_HEADER_EN, SECONDARY_SUGGESTIONS_HEADER_EN, DETAILED_REASONING_HEADER_EN]);
    primarySuggestionsContent = extractSection(assessment, PRIMARY_SUGGESTIONS_HEADER_EN, [SECONDARY_SUGGESTIONS_HEADER_EN, DETAILED_REASONING_HEADER_EN]);
    secondarySuggestionsContent = extractSection(assessment, SECONDARY_SUGGESTIONS_HEADER_EN, [DETAILED_REASONING_HEADER_EN]);
    detailedReasoningContent = extractSection(assessment, DETAILED_REASONING_HEADER_EN, []);
    
    if (!verdictContent && !primarySuggestionsContent && !secondarySuggestionsContent && !detailedReasoningContent && assessment) {
      console.warn("UltimateFinalAssessmentDisplay: Could not parse sections. Displaying full text.");
      detailedReasoningContent = assessment; // Put all text into reasoning if parsing fails
      title = t('finalAssessmentParseErrorTitle');
    }

  } else { // Initial Ruling Parsing
    summaryContent = extractSection(assessment, DEFINITIVE_SUMMARY_HEADER_EN, [ANALYSIS_FACTORS_HEADER_EN, FINAL_RECOMMENDATIONS_HEADER_EN]);
    analysisContent = extractSection(assessment, ANALYSIS_FACTORS_HEADER_EN, [FINAL_RECOMMENDATIONS_HEADER_EN]);
    recommendationsContent = extractSection(assessment, FINAL_RECOMMENDATIONS_HEADER_EN, []);
    
    if (!summaryContent && !analysisContent && !recommendationsContent && assessment) {
      console.warn("FinalAssessmentDisplay (Initial): Could not parse sections. Displaying full text under analysis.");
      analysisContent = assessment; 
      summaryContent = t("finalAssessmentParseError"); 
    }
  }


  return (
    <div className="w-full p-6 bg-slate-800 rounded-xl shadow-2xl text-slate-300 space-y-6">
      <h2 className="text-2xl font-semibold text-pink-400 text-center">{title}</h2>
      
      {isUltimate ? (
        <>
          {verdictContent && (
            <div className="mb-6 p-4 bg-slate-700/60 rounded-lg ring-2 ring-pink-500 shadow-lg">
              <h3 className="text-xl font-semibold text-pink-300 mb-2">{t('ultimateVerdictHeader')}</h3>
              <div className="whitespace-pre-wrap leading-relaxed text-slate-100">{verdictContent}</div>
            </div>
          )}
          {primarySuggestionsContent && (
            <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-300 mb-2">{t('primarySuggestionsHeader')}</h3>
              <div className="whitespace-pre-wrap leading-relaxed">{primarySuggestionsContent}</div>
            </div>
          )}
          {secondarySuggestionsContent && (
            <div className="mb-6 p-4 bg-slate-700/40 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">{t('secondarySuggestionsHeader')}</h3>
              <div className="whitespace-pre-wrap leading-relaxed">{secondarySuggestionsContent}</div>
            </div>
          )}
          {detailedReasoningContent && (
            <div className="p-4 bg-slate-600/30 rounded-lg">
              <h3 className="text-lg font-semibold text-teal-300 mb-2">{t('detailedReasoningHeader')}</h3>
              <div className="whitespace-pre-wrap leading-relaxed text-sm">{detailedReasoningContent}</div>
            </div>
          )}
        </>
      ) : ( // Initial Ruling Display
        <>
          {summaryContent && (
            <div className="mb-6 p-4 bg-slate-700/40 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-300 mb-2">{t('finalAssessmentDefinitiveSummaryHeader')}</h3>
              <div className="whitespace-pre-wrap leading-relaxed">{summaryContent}</div>
            </div>
          )}
          {analysisContent && (
            <div className="mb-6 p-4 bg-slate-700/40 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-300 mb-2">{t('finalAssessmentAnalysisFactorsHeader')}</h3>
              <div className="whitespace-pre-wrap leading-relaxed">{analysisContent}</div>
            </div>
          )}
          {recommendationsContent && (
            <div className="p-4 bg-slate-700/40 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-300 mb-2">{t('finalAssessmentRecommendationsHeader')}</h3>
              <div className="whitespace-pre-wrap leading-relaxed">{recommendationsContent}</div>
            </div>
          )}
        </>
      )}
      
      {(isUltimate || (!isUltimate && !assessment)) && ( // Show restart button for ultimate ruling, or if initial ruling failed to load
          <button
            onClick={onStartNewFullAnalysis}
            className="w-full mt-8 flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-lg"
          >
            {t('startNewAnalysisButton')}
          </button>
      )}
    </div>
  );
};
