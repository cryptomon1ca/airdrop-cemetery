"use client";

import { useState, useEffect } from "react";

// Map project ID → CoinGecko coin ID
const CG_ID_MAP: Record<string, string> = {
  'starknet':       'starknet',
  'friend-tech':    'friend-tech',
  'hamster':        'hamster-kombat',
  'zksync':         'zksync',
  'kadena':         'kadena',
  'scroll':         'scroll',
  'blast':          'blast',
  'manta-network':  'manta-network',
  'moonbeam':       'moonbeam',
  'aptos':          'aptos',
  'eigenlayer':     'eigenlayer',
  'layerzero':      'layerzero',
  'wormhole':       'wormhole',
  'altlayer':       'altlayer',
  'berachain':      'berachain',
  'story-protocol': 'story',
  'animecoin':      'anime',
  'linea':          'linea',
  'backpack':       'backpack',
};

export interface LivePrice {
  currentPrice: number;
  priceChange: number; // % change from ATH
  priceChange24h: number; // % change in last 24h
  updatedAt: string;
}

export type LivePriceMap = Record<string, LivePrice>;

const CACHE_KEY = "airdrop_cemetery_prices";
const CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours

function loadCache(): { data: LivePriceMap; ts: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(data: LivePriceMap) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage not available (SSR, private mode, etc.)
  }
}

export function useLivePrices(
  projects: { id: string; athPrice: number; currentPrice: number; priceChange: number }[]
) {
  const [prices, setPrices] = useState<LivePriceMap>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    // Check cache first
    const cached = loadCache();
    if (cached) {
      setPrices(cached.data);
      const ts = new Date(cached.ts);
      setLastUpdated(
        ts.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })
      );
      return;
    }

    // Fetch fresh prices
    const projectsWithCG = projects.filter(p => CG_ID_MAP[p.id]);
    if (projectsWithCG.length === 0) return;

    const cgIds = projectsWithCG.map(p => CG_ID_MAP[p.id]).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cgIds}&vs_currencies=usd&include_24hr_change=true`;

    setLoading(true);

    fetch(url)
      .then(r => r.json())
      .then((data: Record<string, { usd: number; usd_24h_change: number }>) => {
        const result: LivePriceMap = {};

        for (const project of projectsWithCG) {
          const cgId = CG_ID_MAP[project.id];
          const entry = data[cgId];
          if (!entry) continue;

          const livePrice = entry.usd;
          const change24h = entry.usd_24h_change ?? 0;

          // Recalculate % change from ATH
          const fromAth = project.athPrice > 0
            ? Math.round(((livePrice - project.athPrice) / project.athPrice) * 1000) / 10
            : project.priceChange;

          result[project.id] = {
            currentPrice: livePrice,
            priceChange: fromAth,
            priceChange24h: Math.round(change24h * 10) / 10,
            updatedAt: new Date().toISOString(),
          };
        }

        setPrices(result);
        saveCache(result);
        setLastUpdated(
          new Date().toLocaleDateString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })
        );
      })
      .catch(err => {
        console.warn("CoinGecko price fetch failed:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // only on mount

  return { prices, loading, lastUpdated };
}
