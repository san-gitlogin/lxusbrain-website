import { useState, useEffect } from 'react'
import {
  fetchLatestRelease,
  FALLBACK_RELEASE,
} from '../lib/github-release'
import type {
  ReleaseData,
  Platform,
  PlatformAsset,
} from '../lib/github-release'

export interface UseLatestReleaseResult {
  release: ReleaseData
  isLoading: boolean
  isFallback: boolean
}

export function useLatestRelease(): UseLatestReleaseResult {
  const [release, setRelease] = useState<ReleaseData>(FALLBACK_RELEASE)
  const [isLoading, setIsLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetchLatestRelease().then((result) => {
      if (cancelled) return

      setRelease(result.data)
      setIsFallback(result.fromFallback)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return { release, isLoading, isFallback }
}

export type { ReleaseData, Platform, PlatformAsset }
