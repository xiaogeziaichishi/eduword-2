import { YOUDAO_AUDIO_BASE } from "../constants";
import { SearchResult } from "../types";

// Helper to play audio
export const playAudio = (word: string, type: 1 | 2) => {
  const url = `${YOUDAO_AUDIO_BASE}${encodeURIComponent(word)}&type=${type}`;
  const audio = new Audio(url);
  audio.play().catch(e => console.error("Audio playback failed", e));
};

// Parse local CSV dictionary: word,tran1,tran2,...
type LocalDictionary = {
  map: Map<string, string>;
  words: string[];
};

let localDictPromise: Promise<Map<string, string>> | null = null;

const parseCsv = (csvText: string): LocalDictionary => {
  const map = new Map<string, string>();
  const words: string[] = [];
  const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

  lines.forEach(line => {
    const parts = line.split(",").map(p => p.trim());
    if (parts.length === 0) return;
    const word = parts[0];
    const translations = parts.slice(1).filter(Boolean);
    map.set(word.toLowerCase(), translations.join("，")); // allow empty translation
    words.push(word);
  });

  return { map, words };
};

let localDictLoader: Promise<LocalDictionary> | null = null;

const resolveCsvFilenameFromUrl = (): string => {
  const defaultCsv = "word_translations.csv";

  if (typeof window === "undefined") return defaultCsv;

  const url = new URL(window.location.href);
  const queryCsv = url.searchParams.get("csv")?.trim();
  if (queryCsv) {
    return queryCsv.endsWith(".csv") ? queryCsv : `${queryCsv}.csv`;
  }

  const baseUrl = (import.meta.env.BASE_URL ?? "/").replace(/^\/|\/$/g, "");
  const path = url.pathname.replace(/^\/|\/$/g, "");
  const segments = path ? path.split("/") : [];

  const appSegments = baseUrl ? baseUrl.split("/").filter(Boolean) : [];
  const effectiveSegments = segments.slice(appSegments.length);
  const firstSegment = effectiveSegments[0]?.trim();

  if (firstSegment && /^[A-Za-z0-9_-]+$/.test(firstSegment)) {
    return `${firstSegment}.csv`;
  }

  return defaultCsv;
};

export const loadLocalDictionary = (): Promise<LocalDictionary> => {
  if (!localDictLoader) {
    const base = import.meta.env.BASE_URL ?? "/";
    const csvFilename = resolveCsvFilenameFromUrl();
    const primaryCsvPath = `${base}${csvFilename}`;
    const fallbackCsvPath = `${base}word_translations.csv`;

    localDictLoader = fetch(primaryCsvPath)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load CSV: ${csvFilename}`);
        }
        return res.text();
      })
      .catch(async () => {
        const fallbackRes = await fetch(fallbackCsvPath);
        if (!fallbackRes.ok) {
          throw new Error("Failed to load fallback local dictionary");
        }
        return fallbackRes.text();
      })
      .then(parseCsv)
      .catch(err => {
        console.error("Load dictionary failed:", err);
        return { map: new Map<string, string>(), words: [] };
      });
  }
  return localDictLoader;
};

// Fetch Word Definition from local file only (no translation API)
export const fetchWordDefinition = async (word: string): Promise<SearchResult> => {
  const dict = await loadLocalDictionary();
  const key = word.toLowerCase();
  const translation = dict.map.get(key);

  return { 
    found: true, 
    data: { 
      definition: translation,
      chineseDefinition: translation,
      phonetic: "",
      example: ""
    } 
  };
};

// Check if Youdao audio exists (lightweight probe)
export const checkAudioAvailability = async (word: string): Promise<boolean> => {
  try {
    const url = `${YOUDAO_AUDIO_BASE}${encodeURIComponent(word)}&type=1`;
    const res = await fetch(url, { method: "GET", mode: "no-cors", cache: "no-store", redirect: "follow" });
    if (res.type === "opaque") return true; // CORS 不可读但请求已发出
    return res.ok;
  } catch (err) {
    console.error("Audio check failed:", err);
    return false;
  }
};
