"use client";
import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/utils/pinata";
import marketplace from "@/app/marketplace.json";
import { ethers } from "ethers";
import { WalletContext } from "@/context/wallet";
import { toast } from "react-toastify";
import { IoPaperPlaneOutline } from "react-icons/io5";

export default function SellNFT() {
  const [formParams, updateFormParams] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [fileURL, setFileURL] = useState();
  const [message, updateMessage] = useState("");
  const [btnEnabled, setBtnEnabled] = useState(false);
  const [btnContent, setBtnContent] = useState("List NFT");
  const router = useRouter();
  const { isConnected, signer } = useContext(WalletContext);

  useEffect(() => {
    // Check if all fields are filled to enable the button
    const { name, description, price } = formParams;
    if (name && description && price && fileURL) {
      setBtnEnabled(true);
    } else {
      setBtnEnabled(false);
    }
  }, [formParams, fileURL]);

  async function onFileChange(e) {
    try {
      const file = e.target.files[0];
      const fileType = file.type;

      // Check if the file is a valid image type (jpeg, jpg, png)
      const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validImageTypes.includes(fileType)) {
        updateMessage("Please upload a valid image file (JPEG, JPG, PNG).");
        toast.error("Please upload a valid image file (JPEG, JPG, PNG).")
        return;
      }

      const data = new FormData();
      data.set("file", file);
      updateMessage("Uploading image... Please don't click anything!");
      const response = await uploadFileToIPFS(data);
      if (response.success === true) {
        setFileURL(response.pinataURL);
        updateMessage("");
      }
    } catch (e) {
      console.log("Error during file upload...", e);
      toast.error("Error during file upload...");
    }
  }

  async function uploadMetadataToIPFS() {
    const { name, description, price } = formParams;
    if (!name) {
      toast.error("NFT name is missing!");
      return -1;
    }
    if (!description) {
      toast.error("NFT description is missing!");
      return -1;
    }
    if (!price) {
      toast.error("NFT price is missing!");
      return -1;
    }
    if (!fileURL) {
      toast.error("NFT image is missing!");
      return -1;
    }

    const nftJSON = {
      name,
      description,
      price,
      image: fileURL,
    };

    try {
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        return response.pinataURL;
      }
    } catch (e) {
      console.log("Error uploading JSON metadata: ", e);
    }
  }

  async function listNFT(e) {
    try {
      setBtnContent("Processing...");
      const metadataURL = await uploadMetadataToIPFS();
      if (metadataURL === -1) return;

      updateMessage("Uploading NFT...Please don't click anything!");
      let contract = new ethers.Contract(
        marketplace.address,
        marketplace.abi,
        signer
      );
      const price = ethers.parseEther(formParams.price);

      let transaction = await contract.createToken(metadataURL, price);
      await transaction.wait();

      setBtnContent("List NFT");
      updateMessage("");
      updateFormParams({ name: "", description: "", price: "" });
      setFileURL(null);
      toast.success("Successfully listed your NFT!");
      router.push("/marketplace");
    } catch (e) {
      console.log("Upload error", e);
      toast.error("Didn't Mint NFT");
      router.push("/profile");
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900">
      {isConnected ? (
        <div className="flex flex-col items-center justify-center flex-grow mx-2">
          <div className="border-2 border-indigo-800 w-full max-w-lg p-8 shadow-2xl rounded-lg my-5">
            <h2 className="text-3xl md:text-4xl text-white mb-5 text-center uppercase font-extrabold">Upload your NFT</h2>
            <h5 className="font-bold text-md my-2 text-center text-white">List and Sell your NFT</h5>
            <div className="mb-6">
              <label className="block text-left text-lg font-bold mb-2 text-indigo-100">
                NFT name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 text-base bg-indigo-900 text-indigo-50 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formParams.name}
                onChange={(e) =>
                  updateFormParams({ ...formParams, name: e.target.value })
                }
              />
            </div>
            <div className="mb-6">
              <label className="block text-left text-lg font-bold mb-2 text-indigo-100">
                NFT description
              </label>
              <textarea
                className="w-full px-4 py-2 text-base bg-indigo-900 text-indigo-50 border border-indigo-300 rounded-lg h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formParams.description}
                onChange={(e) =>
                  updateFormParams({
                    ...formParams,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-6">
              <label className="block text-left text-lg font-bold mb-2 text-indigo-100">
                Price (in tCORE)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 text-base bg-indigo-900 text-indigo-50 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formParams.price}
                onChange={(e) =>
                  updateFormParams({ ...formParams, price: e.target.value })
                }
              />
            </div>
            <div className="mb-6">
              <label className="block text-left text-lg font-bold mb-2 text-indigo-100">
                Upload image
              </label>
              <input
                type="file"
                className="w-full px-4 py-2 text-base bg-indigo-900 text-indigo-50 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={onFileChange}
                required
              />
            </div>
            <div className="text-indigo-100 font-medium text-center my-4">{message}</div>
            <button
              onClick={listNFT}
              type="submit"
              className={`border-none rounded-lg w-full py-3 px-6 flex items-center justify-center text-lg font-bold transition-colors ${
                btnEnabled ? "bg-indigo-600 text-white cursor-pointer hover:bg-indigo-600" : "bg-indigo-400 text-indigo-100 cursor-not-allowed"
              }`}
              disabled={!btnEnabled}
            >
              {btnContent === "Processing..." && (
                <span className="inline-block border-4 border-indigo-300 border-l-white rounded-full mr-2 w-6 h-6 animate-spin" />
              )}
              {btnContent}
              <IoPaperPlaneOutline className="ml-4 font-bold" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-grow">
          <div className="text-4xl font-bold text-indigo-100 max-w-6xl mx-auto mb-20 p-4 text-center">
            Connect Your Wallet to Continue...
          </div>
        </div>
      )}
    </div>
  );
}
