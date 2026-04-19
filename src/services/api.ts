// Constants for the AnimeSalt API
export const API_BASE = "https://animesalt-api-lovat.vercel.app";

export interface AnimeSaltItem {
  title: string;
  url: string;
  slug: string;
  image: string;
}

export interface HomeResponse {
  success: boolean;
  data: {
    fresh_drops: AnimeSaltItem[];
    "on-air_series_view_more": AnimeSaltItem[];
    new_anime_arrivals_view_more: AnimeSaltItem[];
    "just_in:_cartoon_series_view_more": AnimeSaltItem[];
    latest_anime_movies_view_more: AnimeSaltItem[];
    fresh_cartoon_films_view_more: AnimeSaltItem[];
  };
}

export async function fetchHomeData(): Promise<HomeResponse> {
  const url = `${API_BASE}/api/home`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch home data`);
  return await response.json();
}

export interface AnimeSaltEpisode {
  number: string;
  title: string;
  url: string;
  id: string;
  thumbnail: string;
  season: string;
}

export interface AnimeSaltDetail {
  success: boolean;
  data: {
    title: string;
    description: string;
    genres: string[];
    thumbnail: string;
    is_movie: boolean;
    episodes: AnimeSaltEpisode[];
    movie_players?: {
      source: string;
      url: string;
    }[];
  };
}

export async function fetchAnimeDetails(slug: string): Promise<AnimeSaltDetail> {
  const url = `${API_BASE}/api/anime/${slug}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch anime details`);
  return await response.json();
}

export interface EpisodeResponse {
  success: boolean;
  data: {
    video_player: string;
    m3u8_link: string | null;
    source: string;
    next_episode_id: string | null;
    prev_episode_id: string | null;
  };
}

export async function fetchEpisodeDetails(episodeId: string): Promise<EpisodeResponse> {
  const url = `${API_BASE}/api/episode/${episodeId}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch episode details`);
  return await response.json();
}

export interface SearchResponse {
  success: boolean;
  query: string;
  results: AnimeSaltItem[];
}

export async function fetchSearchData(query: string): Promise<SearchResponse> {
  const url = `${API_BASE}/api/search?q=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch search data`);
  return await response.json();
}
