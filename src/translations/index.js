import { tr } from "./tr";
import { en } from "./en";

export const translations = {
  tr,
  en,
};

export const getTranslation = (language, key) => {
  return translations[language]?.[key] || key;
};
