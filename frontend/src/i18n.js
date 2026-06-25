import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import es from './locales/es.json'
import zh from './locales/zh.json'
import id from './locales/id.json'
import ar from './locales/ar.json'

const RTL_LANGS = ['ar']

const saved = localStorage.getItem('lang')
if (saved && !['en', 'es', 'zh', 'id', 'ar'].includes(saved)) {
  localStorage.removeItem('lang')
}

function applyDir(lng) {
  document.documentElement.dir = RTL_LANGS.includes(lng) ? 'rtl' : 'ltr'
  document.documentElement.lang = lng
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    zh: { translation: zh },
    id: { translation: id },
    ar: { translation: ar },
  },
  lng: saved || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

applyDir(saved || 'en')

export function changeLanguage(lng) {
  localStorage.setItem('lang', lng)
  i18n.changeLanguage(lng)
  applyDir(lng)
}

export default i18n
