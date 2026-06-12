import { Outlet } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import Button from '../ui/Button'

export default function AppLayout() {
  const { user, signOut } = useAuth()

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Log out
          </Button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Sidebar</p>
        </aside>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
