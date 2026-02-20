/**
 * Internationalization (i18n) - English & Hindi
 */

export type Language = 'en' | 'hi'

export const translations = {
  en: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      narrativeEngine: 'Narrative Engine',
    },

    // Dashboard
    dashboard: {
      title: 'Content Library',
      subtitle: 'Manage your content and generate narratives',
      newContent: '+ New Content',
      createContent: 'Create New Content',
      createButton: 'Create Content',
      cancel: 'Cancel',
      generating: 'Generating...',
      creating: 'Creating...',
      loadingContent: 'Loading content...',
      noContent: 'No content yet',
      noContentSubtext: 'Get started by creating your first content piece',
      viewNarratives: 'View Narratives',
      generateNarratives: 'Generate Narratives',
      generateNewSet: 'Generate New Set',
      candidates: 'candidates',
      created: 'Created',
    },

    // Form Fields
    form: {
      title: 'Title',
      titleRequired: 'Title *',
      titlePlaceholder: 'Content title',
      genre: 'Genre',
      genrePlaceholder: 'e.g., Drama, Action, Thriller',
      runtime: 'Runtime (minutes)',
      runtimePlaceholder: '120',
      targetAudience: 'Target Audience',
      audiencePlaceholder: 'e.g., 18-35, Urban, Premium',
      summary: 'Summary',
      summaryPlaceholder: 'Brief content summary',
      script: 'Script / Storyline',
      scriptPlaceholder: 'Full script or detailed storyline (or upload PDF above)',
      themes: 'Themes',
      themesPlaceholder: 'e.g., Love, Revenge, Justice',
      tone: 'Tone',
      tonePlaceholder: 'e.g., Dark, Emotional, Suspenseful',
    },

    // PDF Upload
    pdf: {
      dropHere: 'Drop PDF script here or',
      browse: 'browse',
      autoExtract: "We'll automatically extract text from your PDF",
      extracting: 'Extracting text from PDF...',
      success: 'Text extracted successfully',
      characters: 'characters',
      remove: 'Remove & upload different PDF',
      canEdit: 'You can edit the extracted text above before submitting',
    },

    // Flow Selection
    flow: {
      title: 'Choose Evaluation Flow',
      subtitle: 'Select how narratives should be created and evaluated',

      // Flow selection removed - using council brainstorming only
    },

    // Session Results
    session: {
      title: 'Session Results',
      session: 'Session',
      complete: 'complete',
      generating: 'generating',
      evaluating: 'evaluating',
      loadingSession: 'Loading session results...',

      // Flow badges removed - using council brainstorming only

      // Round 2
      refineGenerate: 'Refine & Generate Round 2',
      learnFrom: 'Learn from Round 1',
      generateImproved: 'Generate improved narratives based on Round 1 insights',
      currentBest: 'Current best',

      // Content Analysis
      contentAnalysis: 'Content Analysis',
      whatAIUnderstood: 'What AI Understood',
      logline: 'Logline',
      brief: 'Story Brief',
      usps: 'Unique Selling Points',
      bestMoments: 'Best Moments',
      coreCharacters: 'Core Characters',
      genrePositioning: 'Genre & Positioning',
      targetAudience: 'Target Audience',
      themes: 'Themes & Hook Potential',
      hook: 'Hook',

      // Council Conversation
      councilConversation: 'Council Brainstorming Transcript',
      viewConversation: 'View Full Conversation',
      hideConversation: 'Hide Conversation',
      messages: 'messages',

      // Candidates
      topNarratives: 'Top 10 Narratives',
      narrativePreview: 'Narrative Preview',
      overallScore: 'Overall Score',
      productionCouncil: 'Production Council',
      audienceCouncil: 'Audience Council',
      strategicInsights: 'Strategic Insights',
      conflictsDetected: 'Conflicts Detected',

      // Evaluation details
      reasoning: 'Reasoning',
      greenLights: 'Green Lights',
      concerns: 'Concerns',
      redFlags: 'Red Flags',
      recommendation: 'Recommendation',
      approve: 'approve',
      revise: 'revise',
      reject: 'reject',
    },

    // Errors
    error: {
      loading: 'Error loading',
      generating: 'Failed to generate',
      unknown: 'Unknown error',
    },
  },

  hi: {
    // Navigation
    nav: {
      dashboard: 'डैशबोर्ड',
      narrativeEngine: 'नैरेटिव इंजन',
    },

    // Dashboard
    dashboard: {
      title: 'कंटेंट लाइब्रेरी',
      subtitle: 'अपना कंटेंट मैनेज करें और नैरेटिव जेनरेट करें',
      newContent: '+ नया कंटेंट',
      createContent: 'नया कंटेंट बनाएं',
      createButton: 'कंटेंट बनाएं',
      cancel: 'रद्द करें',
      generating: 'जेनरेट हो रहा है...',
      creating: 'बना रहे हैं...',
      loadingContent: 'कंटेंट लोड हो रहा है...',
      noContent: 'अभी कोई कंटेंट नहीं',
      noContentSubtext: 'अपना पहला कंटेंट बनाकर शुरू करें',
      viewNarratives: 'नैरेटिव देखें',
      generateNarratives: 'नैरेटिव जेनरेट करें',
      generateNewSet: 'नया सेट जेनरेट करें',
      candidates: 'कैंडिडेट',
      created: 'बनाया गया',
    },

    // Form Fields
    form: {
      title: 'शीर्षक',
      titleRequired: 'शीर्षक *',
      titlePlaceholder: 'कंटेंट का शीर्षक',
      genre: 'जॉनर',
      genrePlaceholder: 'जैसे, ड्रामा, एक्शन, थ्रिलर',
      runtime: 'रनटाइम (मिनट)',
      runtimePlaceholder: '120',
      targetAudience: 'टारगेट ऑडियंस',
      audiencePlaceholder: 'जैसे, 18-35, शहरी, प्रीमियम',
      summary: 'सारांश',
      summaryPlaceholder: 'संक्षिप्त कंटेंट सारांश',
      script: 'स्क्रिप्ट / कहानी',
      scriptPlaceholder: 'पूरी स्क्रिप्ट या विस्तृत कहानी (या ऊपर PDF अपलोड करें)',
      themes: 'थीम्स',
      themesPlaceholder: 'जैसे, प्यार, बदला, न्याय',
      tone: 'टोन',
      tonePlaceholder: 'जैसे, डार्क, भावनात्मक, रहस्यमय',
    },

    // PDF Upload
    pdf: {
      dropHere: 'PDF स्क्रिप्ट यहाँ ड्रॉप करें या',
      browse: 'ब्राउज़ करें',
      autoExtract: 'हम आपकी PDF से टेक्स्ट अपने आप निकाल लेंगे',
      extracting: 'PDF से टेक्स्ट निकाला जा रहा है...',
      success: 'टेक्स्ट सफलतापूर्वक निकाला गया',
      characters: 'अक्षर',
      remove: 'हटाएं और दूसरी PDF अपलोड करें',
      canEdit: 'सबमिट करने से पहले आप ऊपर निकाले गए टेक्स्ट को एडिट कर सकते हैं',
    },

    // Flow Selection
    flow: {
      title: 'इवैल्यूएशन फ्लो चुनें',
      subtitle: 'चुनें कि नैरेटिव कैसे बनाए और परखे जाएं',

      flow1Title: 'फ्लो 1: स्वतंत्र मूल्यांकन',
      flow1Desc: 'AI जेनरेट करता है → काउंसिल अलग-अलग परखते हैं',
      flow1Time: '3-5 मिनट',
      flow1Details: 'AI विविध कैंडिडेट बनाता है, फिर प्रोडक्शन और ऑडियंस काउंसिल स्वतंत्र रूप से प्रत्येक का मूल्यांकन करते हैं।',

      flow2Title: 'फ्लो 2: काउंसिल ब्रेनस्टॉर्मिंग',
      flow2Desc: 'काउंसिल मिलकर ब्रेनस्टॉर्म करती है → नैरेटिव बनाती है',
      flow2Time: '4-6 मिनट',
      flow2Details: 'प्रोडक्शन काउंसिल टीम के रूप में चर्चा करती है, विचारों पर बहस करती है, और मिलकर नैरेटिव बनाती है। आप पूरी बातचीत पढ़ सकते हैं!',

      recommended: 'सुझाया गया',
      new: 'नया!',
      readConversation: 'बातचीत पढ़ें',
    },

    // Session Results
    session: {
      title: 'सेशन रिजल्ट',
      session: 'सेशन',
      complete: 'पूर्ण',
      generating: 'जेनरेट हो रहा',
      evaluating: 'मूल्यांकन हो रहा',
      loadingSession: 'सेशन रिजल्ट लोड हो रहे हैं...',

      // Flow badges
      flow1: 'फ्लो 1: स्वतंत्र',
      flow2: 'फ्लो 2: ब्रेनस्टॉर्मिंग',

      // Round 2
      refineGenerate: 'रिफाइन करें और राउंड 2 जेनरेट करें',
      learnFrom: 'राउंड 1 से सीखें',
      generateImproved: 'राउंड 1 की समझ के आधार पर बेहतर नैरेटिव जेनरेट करें',
      currentBest: 'वर्तमान सर्वश्रेष्ठ',

      // Content Analysis
      contentAnalysis: 'कंटेंट एनालिसिस',
      whatAIUnderstood: 'AI ने क्या समझा',
      logline: 'लॉगलाइन',
      brief: 'स्टोरी ब्रीफ',
      usps: 'यूनिक सेलिंग पॉइंट्स',
      bestMoments: 'बेस्ट मोमेंट्स',
      coreCharacters: 'मुख्य किरदार',
      genrePositioning: 'जॉनर और पोजिशनिंग',
      targetAudience: 'टारगेट ऑडियंस',
      themes: 'थीम्स और हुक पोटेंशियल',
      hook: 'हुक',

      // Council Conversation
      councilConversation: 'काउंसिल ब्रेनस्टॉर्मिंग ट्रांसक्रिप्ट',
      viewConversation: 'पूरी बातचीत देखें',
      hideConversation: 'बातचीत छुपाएं',
      messages: 'संदेश',

      // Candidates
      topNarratives: 'टॉप 10 नैरेटिव',
      narrativePreview: 'नैरेटिव प्रीव्यू',
      overallScore: 'कुल स्कोर',
      productionCouncil: 'प्रोडक्शन काउंसिल',
      audienceCouncil: 'ऑडियंस काउंसिल',
      strategicInsights: 'स्ट्रैटेजिक इनसाइट्स',
      conflictsDetected: 'विरोधाभास पाए गए',

      // Evaluation details
      reasoning: 'तर्क',
      greenLights: 'ग्रीन लाइट्स',
      concerns: 'चिंताएं',
      redFlags: 'रेड फ्लैग्स',
      recommendation: 'सिफारिश',
      approve: 'स्वीकृत',
      revise: 'संशोधन',
      reject: 'अस्वीकृत',
    },

    // Errors
    error: {
      loading: 'लोड करने में त्रुटि',
      generating: 'जेनरेट करने में विफल',
      unknown: 'अज्ञात त्रुटि',
    },
  },
}

export function useTranslation(lang: Language) {
  return translations[lang]
}
