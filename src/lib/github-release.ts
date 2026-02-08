// -- Raw GitHub API response types (subset we actually use) ----------

interface GitHubAsset {
  name: string
  size: number
  browser_download_url: string
}

interface GitHubRelease {
  tag_name: string
  name: string
  html_url: string
  assets: GitHubAsset[]
}

// -- Processed types consumed by the UI ------------------------------

export type Platform = 'windows' | 'macos' | 'linux'

export interface PlatformAsset {
  url: string
  sizeFormatted: string
  sizeBytes: number
  filename: string
}

export interface ReleaseData {
  version: string
  releasePageUrl: string
  downloadsAvailable: boolean
  assets: Partial<Record<Platform, PlatformAsset>>
  fetchedAt: string
}

// -- Configuration ---------------------------------------------------

const GITHUB_API_URL =
  'https://api.github.com/repos/LxusBrain/termivoxed/releases/latest'

const CACHE_KEY = 'termivoxed-latest-release'
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes

export const FALLBACK_RELEASE: ReleaseData = {
  version: 'v1.0.10',
  releasePageUrl: 'https://github.com/LxusBrain/termivoxed/releases/tag/v1.0.10',
  downloadsAvailable: true,
  assets: {
    windows: {
      url: 'https://github.com/LxusBrain/termivoxed/releases/download/v1.0.10/TermiVoxed-1.0.10-Setup.exe',
      sizeFormatted: '282 MB',
      sizeBytes: 282001193,
      filename: 'TermiVoxed-1.0.10-Setup.exe',
    },
    macos: {
      url: 'https://github.com/LxusBrain/termivoxed/releases/download/v1.0.10/TermiVoxed-1.0.10-macos.dmg',
      sizeFormatted: '437 MB',
      sizeBytes: 436879609,
      filename: 'TermiVoxed-1.0.10-macos.dmg',
    },
  },
  fetchedAt: '',
}

// -- Asset classification --------------------------------------------

function classifyAsset(asset: GitHubAsset): Platform | null {
  const name = asset.name.toLowerCase()

  if (name.endsWith('-setup.exe')) return 'windows'
  if (name.endsWith('-macos.dmg')) return 'macos'
  if (name.includes('-linux-') && name.endsWith('.tar.gz') && !name.includes('.part-')) {
    return 'linux'
  }

  return null
}

// -- Formatting ------------------------------------------------------

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1000
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  const value = bytes / Math.pow(k, i)
  const formatted = value % 1 < 0.05 ? Math.round(value).toString() : value.toFixed(1)

  return `${formatted} ${units[i]}`
}

// -- Cache management ------------------------------------------------

interface CachedRelease {
  data: ReleaseData
  timestamp: number
}

function getCachedRelease(): ReleaseData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null

    const cached: CachedRelease = JSON.parse(raw)
    const age = Date.now() - cached.timestamp

    if (age > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return cached.data
  } catch {
    localStorage.removeItem(CACHE_KEY)
    return null
  }
}

function setCachedRelease(data: ReleaseData): void {
  try {
    const cached: CachedRelease = {
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
  } catch {
    // localStorage full or unavailable -- silently ignore
  }
}

// -- API fetch -------------------------------------------------------

function transformRelease(raw: GitHubRelease): ReleaseData {
  const assets: Partial<Record<Platform, PlatformAsset>> = {}

  for (const ghAsset of raw.assets) {
    const platform = classifyAsset(ghAsset)
    if (platform && !assets[platform]) {
      assets[platform] = {
        url: ghAsset.browser_download_url,
        sizeFormatted: formatBytes(ghAsset.size),
        sizeBytes: ghAsset.size,
        filename: ghAsset.name,
      }
    }
  }

  return {
    version: raw.tag_name,
    releasePageUrl: raw.html_url,
    downloadsAvailable: Object.keys(assets).length > 0,
    assets,
    fetchedAt: new Date().toISOString(),
  }
}

export async function fetchLatestRelease(): Promise<{
  data: ReleaseData
  fromCache: boolean
  fromFallback: boolean
}> {
  const cached = getCachedRelease()
  if (cached) {
    return { data: cached, fromCache: true, fromFallback: false }
  }

  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`)
    }

    const raw: GitHubRelease = await response.json()
    const data = transformRelease(raw)

    setCachedRelease(data)

    return { data, fromCache: false, fromFallback: false }
  } catch (error) {
    console.warn('Failed to fetch latest release from GitHub:', error)
    return { data: FALLBACK_RELEASE, fromCache: false, fromFallback: true }
  }
}
