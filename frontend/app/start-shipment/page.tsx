"use client"
import React, { useState, useContext, useEffect } from "react";
import { WalletContext } from "@/context/wallet";
import { ethers } from "ethers";
import materialTracking from "@/app/materialTracking.json";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import { db } from '@/app/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

interface MaterialShipment {
  supplier: string;
  contractor: string;
  materialType: string;
  quantity: number;
  pickupTime: bigint;
  deliveryTime: bigint;
  distance: bigint;
  price: bigint;
  status: number;
  isPaid: boolean;
}

interface TransactionRecord {
  hash: string;
  timestamp: number;
}

const StatusBadge = ({ status }: { status: number }) => {
  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-yellow-100 text-yellow-800";
      case 1:
        return "bg-blue-100 text-blue-800";
      case 2:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "PENDING";
      case 1:
        return "IN TRANSIT";
      case 2:
        return "DELIVERED";
      default:
        return "UNKNOWN";
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </span>
  );
};

const StartShipmentPage = () => {
  const { signer } = useContext(WalletContext) as { signer: any };
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shipmentDetails, setShipmentDetails] = useState<MaterialShipment | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<Record<string, TransactionRecord[]>>({});

  const [formData, setFormData] = useState({
    supplierAddress: "",
    contractorAddress: "",
    shipmentIndex: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatTimestamp = (timestamp: bigint | number): string => {
    if (timestamp === BigInt(0)) return "N/A";
    try {
      return new Date(typeof timestamp === 'bigint' ? Number(timestamp) * 1000 : timestamp).toLocaleString();
    } catch (error) {
      console.error(error);
      return "Invalid Date";
    }
  };

  const getShipmentKey = (supplier: string, index: string) => {
    return `${supplier.toLowerCase()}-${index}`;
  };

  const addTransactionToHistory = async (supplier: string, index: string, hash: string) => {
    const shipmentKey = getShipmentKey(supplier, index);
    const newTransaction = {
      hash,
      timestamp: Date.now()
    };
    
    setTransactionHistory(prev => ({
      ...prev,
      [shipmentKey]: [
        ...(prev[shipmentKey] || []),
        newTransaction
      ]
    }));

    setTransactionHash(hash);
  };

  const fetchShipmentDetails = async () => {
    if (!signer) {
      setError("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const contract = new ethers.Contract(
        materialTracking.address,
        materialTracking.abi,
        signer
      );

      const details = await contract.getMaterialShipment(
        formData.supplierAddress,
        formData.shipmentIndex
      );

      setShipmentDetails({
        supplier: details[0],
        contractor: details[1],
        materialType: details[2],
        quantity: ethers.formatUnits(details[3], 18),
        pickupTime: details[4],
        deliveryTime: details[5],
        distance: ethers.formatUnits(details[6], 18),
        price: details[7],
        status: Number(details[8]),
        isPaid: details[9],
      });

      // Try to fetch existing transaction hash for this shipment
      const shipmentKey = getShipmentKey(formData.supplierAddress, formData.shipmentIndex);
      const docRef = doc(db, 'shipments', shipmentKey);
      const docSnapshot = await getDoc(docRef);
      
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        console.log(data)
        if (data.transactionHash) {
          setTransactionHash(data.transactionHash);
        }
      }

    } catch (error) {
      console.error("Error fetching shipment details:", error);
      setError("Failed to fetch shipment details. Please verify the inputs and try again.");
    } finally {
      setLoading(false);
      toast.success("Shipment details retrieved");
    }
  };

  const handleStartShipment = async () => {
    if (!signer) {
      setError("Please connect your wallet");
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
  
      const contract = new ethers.Contract(
        materialTracking.address,
        materialTracking.abi,
        signer
      );
  
      const tx = await contract.startMaterialShipment(
        formData.supplierAddress,
        formData.contractorAddress,
        formData.shipmentIndex
      );
  
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      const confirmedHash = receipt.hash;
  
      // Store transaction hash in state and history
      await addTransactionToHistory(formData.supplierAddress, formData.shipmentIndex, confirmedHash);
  
      // Store in Firestore using shipment key as document ID
      const shipmentKey = getShipmentKey(formData.supplierAddress, formData.shipmentIndex);
      await setDoc(doc(db, 'shipments', shipmentKey), {
        supplier: formData.supplierAddress,
        contractor: formData.contractorAddress,
        shipmentIndex: formData.shipmentIndex,
        timestamp: serverTimestamp(),
        transactionHash: confirmedHash
      });
  
      // Refresh shipment details
      await fetchShipmentDetails();
      
      toast.success("Shipment started successfully");
    } catch (error: any) {
      console.error("Error starting shipment:", error);
      setError(error.message || "Failed to start shipment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!signer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-violet-100 border border-violet-400 text-violet-700 px-4 py-3 rounded">
          Please connect your wallet to continue.
        </div>
      </div>
    );
  }

  const currentShipmentKey = shipmentDetails
    ? getShipmentKey(shipmentDetails.supplier, formData.shipmentIndex)
    : null;
  const currentTransactions = currentShipmentKey
    ? transactionHistory[currentShipmentKey] || []
    : [];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-violet-600 text-center">
            Start Material Shipment
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="supplierAddress">Supplier Address</Label>
              <Input
                id="supplierAddress"
                name="supplierAddress"
                value={formData.supplierAddress}
                onChange={handleInputChange}
                placeholder="0x..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="contractorAddress">Contractor Address</Label>
              <Input
                id="contractorAddress"
                name="contractorAddress"
                value={formData.contractorAddress}
                onChange={handleInputChange}
                placeholder="0x..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="shipmentIndex">Shipment Index</Label>
              <Input
                id="shipmentIndex"
                name="shipmentIndex"
                value={formData.shipmentIndex}
                onChange={handleInputChange}
                type="number"
                placeholder="0"
                className="mt-1"
              />
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={fetchShipmentDetails}
                disabled={loading}
                variant="outline"
                className="flex items-center"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                View Details
              </Button>

              <Button
                onClick={handleStartShipment}
                disabled={loading || !shipmentDetails || shipmentDetails.status !== 0}
                className="flex items-center"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Start Shipment
              </Button>
            </div>
          </div>

          {shipmentDetails && (
            <div className="mt-8 border rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Shipment Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Supplier</p>
                  <p className="text-sm font-medium">
                    {formatAddress(shipmentDetails.supplier)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contractor</p>
                  <p className="text-sm font-medium">
                    {formatAddress(shipmentDetails.contractor)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Material Type</p>
                  <p className="text-sm font-medium">{shipmentDetails.materialType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="text-sm font-medium">{shipmentDetails.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-sm font-medium">
                    {ethers.formatEther(shipmentDetails.price)} ETH
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <StatusBadge status={shipmentDetails.status} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pickup Time</p>
                  <p className="text-sm font-medium">
                    {formatTimestamp(shipmentDetails.pickupTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Distance</p>
                  <p className="text-sm font-medium">
                    {Number(shipmentDetails.distance)} km
                  </p>
                </div>
              </div>

              {currentTransactions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">
                    Transaction History
                  </h4>
                  <div className="space-y-2">
                    {currentTransactions.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-2">
                          Transaction History
                        </h4>
                        <div className="space-y-2">
                          {currentTransactions.length > 0 && (
                            <div className="mt-6">
                              <h4 className="text-md font-semibold text-gray-900 mb-2">
                                Transaction History
                              </h4>
                              <div className="space-y-2">
                                {currentTransactions.map((tx, index) => (
                                  <div key={tx.hash} className="bg-white p-3 rounded border">
                                    <p className="text-sm text-gray-500">Transaction {index + 1}</p>
                                    <p className="text-sm font-medium text-blue-500">{tx.hash}</p>
                                    <p className="text-xs text-gray-400">
                                      {formatTimestamp(tx.timestamp)}
                                    </p>
                                    <h4 className="text-md font-semibold text-gray-900 mb-2 text-center">
                                      Shipment QR Code
                                    </h4>
                                    <div className="flex justify-center">
                                      <QRCodeSVG
                                        value={`https://sepolia.etherscan.io/tx/${tx.hash}`} // Changed from transactionHash to tx.hash
                                        size={150}
                                        renderAs="svg"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartShipmentPage;