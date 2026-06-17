import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import es from './locales/es.json'
import zh from './locales/zh.json'
import id from './locales/id.json'

const saved = localStorage.getItem('lang')
if (saved && !['en', 'es', 'zh', 'id'].includes(saved)) {
  localStorage.removeItem('lang')
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, es: { translation: es }, zh: { translation: zh }, id: { translation: id } },
  lng: saved || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
