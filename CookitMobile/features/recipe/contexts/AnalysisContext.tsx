import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import recipeService from '@features/recipe/services/recipeService';

type AnalysisStatus = 'idle' | 'processing' | 'completed' | 'error';

export type AnalysisItem = {
  id: string; // videoId
  videoId: string;
  videoUrl: string;
  title?: string;
  channelTitle?: string;
  thumbnail?: string;
  status: AnalysisStatus;
  progress: number;
  recipe?: any;
  error?: string;
  startedAt: string;
  completedAt?: string;
};

export type CurrentAnalysis = AnalysisItem;

type AnalysisContextType = {
  current: CurrentAnalysis | null;
  history: AnalysisItem[];
  startAnalysis: (videoUrl: string, meta?: { title?: string; channelTitle?: string; thumbnail?: string }) => Promise<void>;
  clear: () => void;
  removeFromHistory: (videoId: string) => void;
  clearHistory: () => void;
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const useAnalysis = () => {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error('useAnalysis must be used within AnalysisProvider');
  return ctx;
};

const HISTORY_KEY = '@analysis_history';

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [current, setCurrent] = useState<CurrentAnalysis | null>(null);
  const [history, setHistory] = useState<AnalysisItem[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // 히스토리 로드
  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('히스토리 로드 실패:', e);
    }
  };

  const saveHistory = async (newHistory: AnalysisItem[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (e) {
      console.error('히스토리 저장 실패:', e);
    }
  };

  const addToHistory = useCallback((item: AnalysisItem) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.videoId !== item.videoId);
      const newHistory = [item, ...filtered].slice(0, 50); // 최대 50개 유지
      saveHistory(newHistory);
      return newHistory;
    });
  }, []);

  const updateHistoryItem = useCallback((videoId: string, updates: Partial<AnalysisItem>) => {
    setHistory(prev => {
      const newHistory = prev.map(h => 
        h.videoId === videoId ? { ...h, ...updates } : h
      );
      saveHistory(newHistory);
      return newHistory;
    });
  }, []);

  const startAnalysis = useCallback(async (videoUrl: string, meta?: { title?: string; channelTitle?: string; thumbnail?: string }) => {
    try {
      // videoId 추출
      const match = videoUrl.match(/v=([a-zA-Z0-9_-]+)/);
      const videoId = match ? match[1] : '';
      const newItem: AnalysisItem = {
        id: videoId,
        videoId,
        videoUrl,
        title: meta?.title,
        channelTitle: meta?.channelTitle,
        thumbnail: meta?.thumbnail,
        status: 'processing',
        progress: 15,
        startedAt: new Date().toISOString(),
      };
      setCurrent(newItem);
      addToHistory(newItem);

      const res = await recipeService.analyzeYouTubeVideo(videoUrl);
      if (!res?.success) throw new Error(res?.error || '분석 요청 실패');

      // 이미 완료된 경우 즉시 완료 처리
      if (res.status === 'completed' && res.recipe) {
        const completedItem = { ...newItem, status: 'completed' as AnalysisStatus, progress: 100, recipe: res.recipe, completedAt: new Date().toISOString() };
        setCurrent(completedItem);
        updateHistoryItem(videoId, completedItem);
        stopPolling();
        return;
      }

      const vId = res.videoId || videoId;
      if (!vId) throw new Error('videoId 확인 실패');

      const intervalMs = 15000; // 15초 간격
      const MAX_DURATION_MS = 10 * 60 * 1000; // 10분

      stopPolling();
      const startedAtMs = new Date(newItem.startedAt).getTime();
      pollRef.current = setInterval(async () => {
        try {
          // 진행률을 더 천천히 증가 (15초마다 2%씩) - current 상태 기반으로 계산
          setCurrent(prev => {
            if (!prev) return prev;
            const newProgress = Math.min(95, (prev.progress || 20) + 2);
            const updated = { ...prev, progress: newProgress };
            updateHistoryItem(vId, { progress: newProgress });
            return updated;
          });
          
          // 최대 분석 시간 초과 처리
          const elapsed = Date.now() - startedAtMs;
          if (elapsed > MAX_DURATION_MS) {
            const errMsg = '최대 분석 시간(10분) 초과로 분석이 종료되었습니다.';
            stopPolling();
            setCurrent(prev => {
              if (!prev) return prev;
              const failedItem = { ...prev, status: 'error' as AnalysisStatus, error: errMsg };
              updateHistoryItem(vId, failedItem);
              return failedItem;
            });
            return;
          }

          const statusRes = await recipeService.getAnalysisStatus(vId);
          if (statusRes?.success && statusRes.status === 'completed' && statusRes.recipe) {
            stopPolling();
            setCurrent(prev => {
              if (!prev) return prev;
              const completedItem = { ...prev, status: 'completed' as AnalysisStatus, progress: 100, recipe: statusRes.recipe, completedAt: new Date().toISOString() };
              updateHistoryItem(vId, completedItem);
              return completedItem;
            });
          }
        } catch (e: any) {
          // 네트워크 오류 등은 여전히 처리하지만 폴링은 계속
          console.error('폴링 중 오류:', e);
        }
      }, intervalMs);
    } catch (e: any) {
      setCurrent(prev => prev ? { ...prev, status: 'error', error: e?.message || '분석 요청 실패' } : prev);
      stopPolling();
    }
  }, [stopPolling, addToHistory, updateHistoryItem]);

  const clear = useCallback(() => {
    stopPolling();
    setCurrent(null);
  }, [stopPolling]);

  const removeFromHistory = useCallback((videoId: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(h => h.videoId !== videoId);
      saveHistory(newHistory);
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    await AsyncStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }, []);

  return (
    <AnalysisContext.Provider value={{ current, history, startAnalysis, clear, removeFromHistory, clearHistory }}>
      {children}
    </AnalysisContext.Provider>
  );
};


