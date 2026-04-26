import { useState, useEffect } from 'react'

function buildTmdbRequest(url) {
  const token = import.meta.env.VITE_TMDB_TOKEN?.trim()

  if (!token) {
    return { requestUrl: url, headers: {} }
  }

  // Поддерживаем оба варианта: v4 Bearer token и v3 API key.
  const isBearerToken = token.startsWith('eyJ') || token.startsWith('Bearer ')

  if (isBearerToken) {
    return {
      requestUrl: url,
      headers: {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      },
    }
  }

  const urlObj = new URL(url)
  urlObj.searchParams.set('api_key', token)

  return { requestUrl: urlObj.toString(), headers: {} }
}

function useFetch(url) {
  const [result, setResult] = useState({
    resolvedUrl: null,
    data: null,
    error: null,
  })

  useEffect(() => {
    if (!url) return

    const controller = new AbortController()
    const { requestUrl, headers } = buildTmdbRequest(url)

    fetch(requestUrl, { headers, signal: controller.signal })
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json?.status_message || `HTTP ${res.status}`)
        }
        return json
      })
      .then((json) => {
        setResult({ resolvedUrl: url, data: json, error: null })
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setResult({ resolvedUrl: url, data: null, error: err.message })
      })

    return () => controller.abort()
  }, [url])

  const loading = Boolean(url) && result.resolvedUrl !== url
  const data = result.resolvedUrl === url ? result.data : null
  const error = result.resolvedUrl === url ? result.error : null

  return { data, loading, error }
}

export default useFetch