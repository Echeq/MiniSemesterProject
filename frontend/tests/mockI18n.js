// Shared i18n mock for tests
// Returns proper English text for translation keys used in components
const TRANSLATIONS = {
  'auth.signIn': 'Sign in',
  'auth.signUp': 'Sign up',
  'auth.signOut': 'Sign out',
  'auth.displayName': 'Display name',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.signInToBoard': 'Sign in to your board',
  'auth.createAccount': 'Create an account',
  'auth.noAccount': "Don't have an account? Sign up",
  'auth.hasAccount': 'Already have an account? Sign in',
  'auth.checkEmail': 'Check your email to confirm your account, then sign in.',
  'board.todo': 'To Do',
  'board.inProgress': 'In progress',
  'board.done': 'Done',
  'board.noTasks': 'No tasks yet',
  'board.loading': 'Loading board…',
  'task.new': 'New task',
  'task.edit': 'Edit task',
  'task.title': 'Title',
  'task.description': 'Description',
  'task.dueDate': 'Due date',
  'task.status': 'Status',
  'task.assignee': 'Assignee',
  'task.unassigned': '— Unassigned —',
  'task.delete': 'Delete',
  'task.deleteConfirm': 'Delete this task?',
  'task.cancel': 'Cancel',
  'task.save': 'Save',
  'task.create': 'Create',
  'lang.switcher': 'Language',
}

export function mockT(key) {
  return TRANSLATIONS[key] || key
}

export function createI18nMock() {
  return {
    useTranslation: () => ({ t: mockT, i18n: { language: 'en', changeLanguage: vi.fn() } }),
  }
}
