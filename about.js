import { translations, detectLanguage, getLocale, isRTL } from './localization.js';

/**
 * About page localization
 */
const currentLang = detectLanguage();
const t = translations[currentLang] || translations.en;
const rtl = isRTL(currentLang);

/**
 * Initialize localization for About page
 */
function initializeAboutLocalization() {
  // Update HTML lang attribute and direction
  document.documentElement.lang = currentLang;
  document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  
  // Apply RTL styles
  if (rtl) {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }

  // Update all text elements
  const elements = {
    backToCalendar: document.getElementById('backLink')?.querySelector('span'),
    aboutTitle: document.getElementById('aboutTitle'),
    projectTitle: document.getElementById('projectTitle'),
    projectDescription: document.getElementById('projectDescription'),
    featuresTitle: document.getElementById('featuresTitle'),
    featuresList: document.getElementById('featuresList'),
    technologiesTitle: document.getElementById('technologiesTitle'),
    creatorTitle: document.getElementById('creatorTitleText'),
    creatorLocation: document.getElementById('creatorLocation'),
    creatorBio: document.getElementById('creatorBio'),
    aiTitle: document.getElementById('aiTitle'),
    aiDescription: document.getElementById('aiDescription'),
    aiNote: document.getElementById('aiNote'),
    licenseTitle: document.getElementById('licenseTitle'),
    licenseText: document.getElementById('licenseText')
  };

  if (elements.backToCalendar && t.backToCalendar) {
    elements.backToCalendar.textContent = t.backToCalendar;
  }

  if (elements.aboutTitle && t.aboutTitle) {
    elements.aboutTitle.textContent = t.aboutTitle;
  }

  if (elements.projectTitle && t.projectTitle) {
    elements.projectTitle.textContent = t.projectTitle;
  }

  if (elements.projectDescription && t.projectDescription) {
    elements.projectDescription.textContent = t.projectDescription;
  }

  if (elements.featuresTitle && t.featuresTitle) {
    elements.featuresTitle.textContent = t.featuresTitle;
  }

  if (elements.featuresList && t.features) {
    elements.featuresList.innerHTML = t.features.map(feature => `<li>${feature}</li>`).join('');
  }

  if (elements.technologiesTitle && t.technologiesTitle) {
    elements.technologiesTitle.textContent = t.technologiesTitle;
  }

  if (elements.creatorTitle && t.creatorTitle) {
    elements.creatorTitle.textContent = t.creatorTitle;
  }

  if (elements.creatorLocation && t.creatorLocation) {
    elements.creatorLocation.textContent = t.creatorLocation;
  }

  if (elements.creatorBio && t.creatorBio) {
    elements.creatorBio.textContent = t.creatorBio;
  }

  if (elements.aiTitle && t.aiTitle) {
    elements.aiTitle.textContent = t.aiTitle;
  }

  if (elements.aiDescription && t.aiDescription) {
    elements.aiDescription.textContent = t.aiDescription;
  }

  if (elements.aiNote && t.aiNote) {
    elements.aiNote.innerHTML = t.aiNote;
  }

  if (elements.licenseTitle && t.licenseTitle) {
    elements.licenseTitle.textContent = t.licenseTitle;
  }

  if (elements.licenseText && t.licenseText) {
    elements.licenseText.textContent = t.licenseText;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAboutLocalization);
} else {
  initializeAboutLocalization();
}

