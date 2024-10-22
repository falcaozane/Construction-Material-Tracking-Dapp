"use client";
import React, { useState, useContext } from "react";
import { WalletContext } from "@/context/wallet";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import materialTracking from "@/app/materialTracking.json";

const StartShipment = () => {
  const { isConnected, signer } = useContext(WalletContext);
  const [supplier, setSupplier] = useState("");
  const [contractor, setContractor] = useState("");
  const [index, setIndex] = useState<number | string>("");
  const [statusMessage, setStatusMessage] = useState("");
  const router = useRouter();

  // Function to start the material shipment
  const startShipment = async () => {
    if (!signer || !isConnected) {
      setStatusMessage("Please connect your wallet.");
      return;
    }

    try {
      const contract = new ethers.Contract(
        materialTracking.address,
        materialTracking.abi,
        signer
      );

      setStatusMessage("Starting the shipment...");

      // Start the material shipment
      const tx = await contract.startMaterialShipment(supplier, contractor, index);
      await tx.wait(); // Wait for the transaction to be confirmed
      console.log(tx)

      setStatusMessage("Shipment started successfully!");
      router.push("/get-shipment")
    } catch (error) {
      console.error("Error starting shipment:", error);
    
      // Check if the error has a message property
      if (error instanceof Error) {
        setStatusMessage('Shipment Already in Transit');
      } else {
        setStatusMessage("Error: Unable to start shipment.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">
          Start Shipment
        </h2>
        <div className="mb-4">
          <label className="block text-gray-700">Supplier Address:</label>
          <input
            type="text"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter supplier's address"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Contractor Address:</label>
          <input
            type="text"
            value={contractor}
            onChange={(e) => setContractor(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter contractor's address"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Shipment Index:</label>
          <input
            type="number"
            value={index}
            onChange={(e) => setIndex(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter shipment index"
          />
        </div>
        <button
          onClick={startShipment}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg"
        >
          Start Shipment
        </button>
        {statusMessage && (
          <div className="mt-4 text-center text-gray-700">{statusMessage}</div>
        )}
      </div>
    </div>
  );
};

export default StartShipment;
