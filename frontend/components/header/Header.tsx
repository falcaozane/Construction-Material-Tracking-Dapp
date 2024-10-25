"use client";
import { WalletContext } from "@/context/wallet";
import { BrowserProvider } from "ethers";
import Link from "next/link";
import { useContext, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { SiWalletconnect } from "react-icons/si";

export default function Header() {
  const {
    isConnected,
    setIsConnected,
    userAddress,
    setUserAddress,
    signer,
    setSigner,
  } = useContext(WalletContext);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error("Metamask is not installed");
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setSigner(signer);
      const accounts = await provider.send("eth_requestAccounts", []);
      setIsConnected(true);
      setUserAddress(accounts[0]);
      const network = await provider.getNetwork();
      console.log(network);
      const chainID = network.chainId;
      const sepolia = "11155111";

      if (chainID.toString() !== sepolia) {
        alert("Please switch your MetaMask to Sepolia network");
        return;
      }
    } catch (error) {
      console.error("Connection error: ", error);
    }
  };

  return (
    <header className="sticky top-0 z-20 left-0 w-full bg-white text-black p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="text-lg md:text-2xl font-bold">
          <Link href="/">JAZ Corp</Link>
        </div>
        <div className="flex space-x-10 items-center">
          <div className="hidden md:flex items-center space-x-4 text-sm">
            <ul className="flex space-x-10 text-black font-semibold">
              <li>
                <Link href="/create-shipment" className="hover:text-black">
                  create
                </Link>
              </li>
              <li>
                <Link href="/start-shipment" className="hover:text-black">
                  start
                </Link>
              </li>
              <li>
                <Link href="/complete-shipment" className="hover:text-black">
                  complete
                </Link>
              </li>
              <li>
                <Link href="/get-shipment" className="hover:text-black">
                  get-shipment
                </Link>
              </li>
              <li>
                <Link href="/view-shipment" className="hover:text-black">
                  view-shipment
                </Link>
              </li>
              <li>
                <Link href="/view-transactions" className="hover:text-black">
                  view-transactions
                </Link>
              </li>
            </ul>
          </div>
          <div className="">
            <button
              className={`px-4 py-2 rounded-full text-sm font-semibold text-white flex items-center ${
                isConnected
                  ? "bg-[#5F259F] cursor-not-allowed"
                  : "bg-[#5F259F] hover:bg-inblack"
              }`}
              onClick={connectWallet}
              disabled={isConnected}
            >
              {isConnected ? (
                <>{userAddress?.slice(0, 10)}...</>
              ) : (
                <>
                  <SiWalletconnect className="md:mr-4" />
                  <span className="hidden md:inline-block">Connect Wallet</span>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <nav className="md:hidden flex flex-col items-center space-y-4 mt-4">
          <ul className="flex flex-col items-center space-y-4">
            <li>
              <Link href="/marketplace" className="text-blue-300 hover:text-black">
                MarketPlace
              </Link>
            </li>
            <li>
              <Link href="/sellNFT" className="text-blue-300 hover:text-black">
                List
              </Link>
            </li>
            <li>
              <Link href="/profile" className="text-blue-300 hover:text-black">
                Profile
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
