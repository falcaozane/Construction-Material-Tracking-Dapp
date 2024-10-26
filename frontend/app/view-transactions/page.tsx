"use client";
import React, { useEffect, useState, useContext } from "react";
import { WalletContext } from "@/context/wallet";
import { ethers } from "ethers";
import materialTracking from "@/app/materialTracking.json";

// Define proper types for BigInt values
interface MaterialShipment {
  supplier: string;
  contractor: string;
  materialType: string;
  quantity: bigint;
  pickupTime: bigint;
  deliveryTime: bigint;
  distance: bigint;
  price: bigint;
  status: number;
  isPaid: boolean;
}

// Separate component for status badge
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

const ViewTransactions = () => {
  const { signer } = useContext(WalletContext);
  const [transactions, setTransactions] = useState<MaterialShipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (signer) {
      fetchAllTransactions();
    }
  }, [signer]);

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const contract = new ethers.Contract(
        materialTracking.address,
        materialTracking.abi,
        signer
      );

      const allTransactions = await contract.getAllMaterialTransactions();
      setTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: bigint): string => {
    if (timestamp === BigInt(0)) return "N/A";
    try {
      return new Date(Number(timestamp) * 1000).toLocaleString();
    } catch (error) {
      console.log(error)
      return "Invalid Date";
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-indigo-600">
            Material Shipments Transactions
          </h2>
        </div>

        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Supplier", "Contractor", "Material", "Quantity", "Pickup", "Delivery", "Distance", "Price", "Status", "Paid"].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatAddress(transaction.supplier)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatAddress(transaction.contractor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transaction.materialType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transaction.quantity.toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatTimestamp(transaction.pickupTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatTimestamp(transaction.deliveryTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transaction.distance.toString()} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {ethers.formatEther(transaction.price)} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={Number(transaction.status)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        transaction.isPaid 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {transaction.isPaid ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTransactions;