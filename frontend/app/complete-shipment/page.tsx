"use client";

import React, { useState, useContext } from "react";
import { WalletContext } from "@/context/wallet";
import { ethers } from "ethers";
import materialTracking from "@/app/materialTracking.json";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";

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

const CompleteShipmentPage = () => {
  const { signer } = useContext(WalletContext) as { signer: any };
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shipmentDetails, setShipmentDetails] = useState<MaterialShipment | null>(null);
  
  const [formData, setFormData] = useState({
    supplierAddress: "",
    contractorAddress: "",
    shipmentIndex: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === 'shipmentIndex' ? Number(e.target.value) : e.target.value,
    });
  };

  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatTimestamp = (timestamp: bigint): string => {
    if (timestamp === BigInt(0)) return "N/A";
    try {
      return new Date(Number(timestamp) * 1000).toLocaleString();
    } catch (error) {
      console.error(error);
      return "Invalid Date";
    }
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
        Number(formData.shipmentIndex)
      );

      setShipmentDetails({
        supplier: details[0],
        contractor: details[1],
        materialType: details[2],
        quantity: Number(ethers.formatUnits(details[3],18)),
        pickupTime: details[4],
        deliveryTime: details[5],
        distance: Number(ethers.formatUnits(details[6],18)),
        price: details[7],
        status: Number(details[8]),
        isPaid: details[9],
      });
    } catch (error) {
      console.error("Error fetching shipment details:", error);
      setError("Failed to fetch shipment details. Please verify the inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteShipment = async () => {
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

      const tx = await contract.completeMaterialShipment(
        formData.supplierAddress,
        formData.contractorAddress,
        formData.shipmentIndex
      );

      await tx.wait();
      
      // Refresh shipment details after completion
      await fetchShipmentDetails();
    } catch (error: any) {
      console.error("Error completing shipment:", error);
      setError(error.message || "Failed to complete shipment. Please try again.");
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-indigo-600 text-center">
            Complete Material Shipment
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
                onClick={handleCompleteShipment}
                disabled={loading || !shipmentDetails}
                className="flex items-center"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Complete Shipment
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
                  <p className="text-sm text-gray-500">Delivery Time</p>
                  <p className="text-sm font-medium">
                    {formatTimestamp(shipmentDetails.deliveryTime)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteShipmentPage;