import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

const DEFAULT_CONFIG = {
  site_name: 'PivotPoint',
  default_language: 'en',
  default_theme: 'light',
  tasks_per_page: 50,
}

export function useSystemConfig() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchConfig = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: rpcError } = await supabase.rpc('get_system_config')
      if (rpcError) throw rpcError
      setConfig((prev) => ({ ...prev, ...(data || {}) }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const setConfigValue = useCallback(async (key, value) => {
    const { error: rpcError } = await supabase.rpc('set_system_config', {
      p_key: key,
      p_value: typeof value === 'string' ? JSON.stringify(value) : value,
    })
    if (rpcError) throw rpcError
    setConfig((prev) => ({ ...prev, [key]: value }))
  }, [])

  const deleteConfigKey = useCallback(async (key) => {
    const { error: rpcError } = await supabase.rpc('delete_system_config', { p_key: key })
    if (rpcError) throw rpcError
    setConfig((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  useEffect(() => { fetchConfig() }, [fetchConfig])

  return { config, loading, error, fetchConfig, setConfigValue, deleteConfigKey }
}
