import React, { createContext, useContext, useState, ReactNode } from 'react';

type LoadingContextType = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isMediaLoaded: boolean;
  setIsMediaLoaded: (loaded: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, isMediaLoaded, setIsMediaLoaded }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}