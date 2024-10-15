"use client";
import { WalletContext } from "@/context/wallet";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import MarketplaceJson from "../../marketplace.json";
import { ethers } from "ethers";
import axios from "axios";
import GetIpfsUrlFromPinata from "@/utils/index";
import Image from "next/image";
import { toast } from "react-toastify";
import { IoBagCheckOutline } from "react-icons/io5";

export default function NFTPage() {
  const params = useParams();
  const tokenId = params.tokenId;
  const [item, setItem] = useState();
  const [msg, setmsg] = useState();
  const [btnContent, setBtnContent] = useState("Buy NFT");
  const [loading, setLoading] = useState(true);
  const { isConnected, userAddress, signer } = useContext(WalletContext);
  const router = useRouter();

  async function getNFTData() {
    if (!signer) return;
    let contract = new ethers.Contract(
      MarketplaceJson.address,
      MarketplaceJson.abi,
      signer
    );
    let tokenURI = await contract.tokenURI(tokenId);
    const listedToken = await contract.getNFTListing(tokenId);

    console.log(listedToken)

    const ipfsUrls = GetIpfsUrlFromPinata(tokenURI);

    let meta;
    for (const url of ipfsUrls) {
      try {
        meta = (await axios.get(url)).data;
        break;
      } catch (error) {
        console.error(`Error fetching metadata from ${url}:`, error);
      }
    }

    if (!meta) {
      throw new Error("Unable to fetch metadata from any IPFS gateway.");
    }

    const item = {
      price: meta.price,
      tokenId,
      seller: listedToken.seller,
      owner: listedToken.owner,
      image: meta.image,
      name: meta.name,
      description: meta.description,
      isListed: listedToken.isListed,
    };
    return item;
  }

  useEffect(() => {
    async function fetchData() {
      if (!signer) return;
      try {
        const itemTemp = await getNFTData();
        setItem(itemTemp);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching NFT items:", error);
        setItem(null);
        setLoading(false);
      }
    }

    fetchData();
  }, [isConnected, signer]);

  async function buyNFT() {
    try {
      if (!signer) return;
      let contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );
      const salePrice = ethers.parseUnits(item.price, "ether").toString();
      setBtnContent("Processing...");
      setmsg("Buying the NFT... Please Wait (Up to 5 mins)");
      toast.info("Buying the NFT... Please Wait (Up to 5 mins)");
      let transaction = await contract.executeSale(tokenId, {
        value: salePrice,
      });
      await transaction.wait();
      toast.success("You successfully bought the NFT!");
      setmsg("");
      setBtnContent("Buy NFT");
      router.push("/profile");
    } catch (e) {
      console.log("Buying Error: ", e);
      toast.error("Buying Error please check wallet balance")
      router.push("/marketplace")
    }
  }

  const PlaceholderCard = () => (
    <div className="w-full md:h-80 bg-indigo-500 border-2 border-indigo-400 animate-pulse rounded-lg"></div>
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-indigo-950 to-indigo-900">
      <div className="flex flex-col items-center justify-center flex-grow mx-2">
        {isConnected ? (
          loading ? (
            <div className="flex items-center justify-center h-screen">
              <PlaceholderCard />
            </div>
          ) : (
            <div className="border-2 border-indigo-800 max-w-6xl w-full mx-2 md:mx-auto shadow-lg rounded-lg p-4 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="w-full">
                  <Image
                    src={item?.image}
                    alt=""
                    width={800}
                    height={520}
                    className="w-full h-auto rounded-lg object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="w-full flex flex-col justify-between md:p-4">
                  <div className="space-y-4">
                    <div className="md:text-xl font-bold text-indigo-100">
                      <p>Name: {item?.name}</p>
                    </div>
                    <div className="md:text-xl font-bold text-indigo-100">
                      <p>Description: {item?.description}</p>
                    </div>
                    <div className="md:text-xl font-bold text-indigo-100">
                      <p>Price: {item?.price} tCore</p>
                    </div>
                    {/* <div className="flex md:text-xl font-bold text-indigo-100 items-center justify-items-center text-center">
                      <p className="flex items-center">Seller: <p className="text-md md:mx-2 mx-1">{item?.seller.slice(0, 16)}...</p> </p>
                    </div> */}
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-indigo-100 text-lg">{msg}</div>
                    {item?.isListed ? (
                      userAddress.toLowerCase() === item?.seller.toLowerCase() ? (
                        <div className="text-indigo-50 font-bold">
                          You already own this NFT!
                        </div>
                      ) : (
                        <button
                          onClick={buyNFT}
                          className="bg-indigo-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                        >
                          {btnContent === "Processing..." && (
                            <span className="spinner" />
                          )}
                          {btnContent}
                          <IoBagCheckOutline className="ml-4 text-white font-bold h-5 w-5" />
                        </button>
                      )
                    ) : (
                      <div className="text-indigo-100 font-bold">
                        <p className="text-sm md:text-xl">
                          This NFT was bought by: {item?.owner}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="text-white text-2xl">You are not connected...</div>
        )}
      </div>
    </div>
  );
}
