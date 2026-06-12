import { Outlet, Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function AuthLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">
          TaskFlow
        </h1>
        <Outlet />
      </div>
    </div>
  )
}
