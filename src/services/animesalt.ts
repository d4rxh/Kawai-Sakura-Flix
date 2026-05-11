export const ANIMESALT_BASE = "/api/animesalt";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const apiCache: Record<string, { data: any; timestamp: number }> = {};

async function fetchWithCache<T>(url: string): Promise<T> {
  const now = Date.now();
  if (apiCache[url] && now - apiCache[url].timestamp < CACHE_TTL) {
    return apiCache[url].data;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${url}: ${response.statusText}`);
  }
  const data = await response.json();
  if (data && typeof data === 'object' && 'success' in data && data.success === false) {
    throw new Error(data.message || `API returned success: false for ${url}`);
  }
  apiCache[url] = { data, timestamp: now };
  return data;
}

export interface AnimeSaltHomeItem {
  title: string;
  url: string;
  slug: string;
  image: string;
}

export interface AnimeSaltHomeResponse {
  success: boolean;
  data: {
    fresh_drops: AnimeSaltHomeItem[];
    "on-air_series_view_more": AnimeSaltHomeItem[];
    new_anime_arrivals_view_more: AnimeSaltHomeItem[];
    "just_in:_cartoon_series_view_more": AnimeSaltHomeItem[];
    latest_anime_movies_view_more?: AnimeSaltHomeItem[];
    fresh_cartoon_films_view_more: AnimeSaltHomeItem[];
  }
}

export async function fetchAnimeSaltHome(): Promise<AnimeSaltHomeResponse> {
  return fetchWithCache<AnimeSaltHomeResponse>(`${ANIMESALT_BASE}/api/home`);
}

export interface AnimeSaltDetailsResponse {
  success: boolean;
  data: {
    title: string;
    description: string;
    genres: string[];
    thumbnail: string;
    is_movie: boolean;
    episodes: {
      number: string;
      title: string;
      url: string;
      id: string;
      thumbnail: string;
      season: string;
    }[];
    movie_players: {
      url: string;
      label: string;
    }[];
  };
}

export async function fetchAnimeSaltDetails(slug: string): Promise<AnimeSaltDetailsResponse> {
  const url = `${ANIMESALT_BASE}/api/anime/${encodeURIComponent(slug.trim())}`;
  console.log("Fetching Anime Details URL:", url);
  return fetchWithCache<AnimeSaltDetailsResponse>(url);
}

export interface AnimeSaltEpisodeResponse {
  success: boolean;
  data: {
    video_player: string;
    m3u8_link: string | null;
    source: string;
    next_episode_id: string | null;
    prev_episode_id: string | null;
  }
}

export async function fetchAnimeSaltEpisode(id: string): Promise<AnimeSaltEpisodeResponse> {
  return fetchWithCache<AnimeSaltEpisodeResponse>(`${ANIMESALT_BASE}/api/episode/${encodeURIComponent(id.trim())}`);
}

export async function fetchAnimeSaltSearch(query: string): Promise<{ results: AnimeSaltHomeItem[] }> {
  // Always trim before encoding since trailing spaces return error or empty set for animesalt backend!
  return fetchWithCache<{ results: AnimeSaltHomeItem[] }>(`${ANIMESALT_BASE}/api/search?q=${encodeURIComponent(query.trim())}`);
}
