"use client";

import { createContext, ReactNode, useState } from "react";

import { JsonRpcSigner } from "ethers";

interface WalletContextProps {
  isConnected: boolean;
  setIsConnected: (value: boolean) => void;
  userAddress: string | null;
  setUserAddress: (address: string | null) => void;
  signer: JsonRpcSigner | null;
  setSigner: (signer: JsonRpcSigner | null) => void;
}

export const WalletContext = createContext<WalletContextProps | undefined>(undefined);

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider = ({ children }: WalletContextProviderProps) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<any>(null);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        setIsConnected,
        userAddress,
        setUserAddress,
        signer,
        setSigner,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
