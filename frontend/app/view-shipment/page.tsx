"use client";
import { WalletContext } from "@/context/wallet";
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import materialTracking from "@/app/materialTracking.json";
import { Loader2 } from "lucide-react";

interface Shipment {
  supplier: string;
  contractor: string;
  materialType: string;
  quantity: string;
  pickupTime: string;
  deliveryTime: string;
  distance: string;
  price: string;
  status: string;
  isPaid: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in transit":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

const PaymentBadge = ({ isPaid }: { isPaid: string }) => (
  <span 
    className={`px-2 py-1 rounded-full text-sm font-medium ${
      isPaid === "Paid" 
        ? "bg-green-100 text-green-800" 
        : "bg-red-100 text-red-800"
    }`}
  >
    {isPaid}
  </span>
);

const formatAddress = (address: string): string => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export default function ViewShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const { isConnected, signer } = useContext(WalletContext);

  async function getShipments() {
    const shipmentsArray: Shipment[] = [];
    if (!signer) return;
    
    let contract = new ethers.Contract(
      materialTracking.address,
      materialTracking.abi,
      signer
    );

    try {
      let transactions = await contract.getAllMaterialTransactions();

      for (const shipment of transactions) {
        const supplier = shipment.supplier;
        const contractor = shipment.contractor;
        const materialType = shipment.materialType;
        const quantity = shipment.quantity.toString();
        const pickupTime = new Date(Number(shipment.pickupTime) * 1000).toLocaleString();
        const deliveryTime = shipment.deliveryTime === BigInt(0) 
          ? "Not Delivered" 
          : new Date(Number(shipment.deliveryTime) * 1000).toLocaleString();
        const distance = shipment.distance.toString();
        const price = ethers.formatEther(shipment.price);

        let status = "";
        const statusNumber = Number(shipment.status);
        if (statusNumber === 0) {
          status = "Pending";
        } else if (statusNumber === 1) {
          status = "In Transit";
        } else if (statusNumber === 2) {
          status = "Delivered";
        }

        const isPaid = shipment.isPaid ? "Paid" : "Not Paid";

        const item: Shipment = {
          supplier,
          contractor,
          materialType,
          quantity,
          pickupTime,
          deliveryTime,
          distance,
          price,
          status,
          isPaid,
        };

        shipmentsArray.push(item);
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
    }

    return shipmentsArray;
  }

  useEffect(() => {
    const fetchData = async () => {
      if (isConnected) {
        setLoading(true);
        try {
          const shipmentsArray = await getShipments();
          setShipments(shipmentsArray || []);
        } catch (error) {
          console.error("Error fetching shipments:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [isConnected, signer]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-[#FF385C] mb-4">
            Wallet Not Connected
          </h2>
          <p className="text-gray-600">
            Please connect your wallet to view shipments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-col items-center flex-grow p-4 md:p-8">
        <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#222222]">
              Material Shipments
            </h2>
            <p className="text-[#FF385C] text-sm mt-1">
              View and track your material shipments
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-12 h-12 animate-spin text-[#FF385C]" />
            </div>
          ) : shipments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "ID",
                      "Supplier",
                      "Contractor",
                      "Material",
                      "Quantity",
                      "Pickup",
                      "Delivery",
                      "Distance",
                      "Price (ETH)",
                      "Status",
                      "Payment"
                    ].map((header) => (
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
                  {shipments.map((shipment, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatAddress(shipment.supplier)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatAddress(shipment.contractor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.materialType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.quantity.slice(0, -18)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {shipment.pickupTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {shipment.deliveryTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.distance.slice(0, -18)} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={shipment.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PaymentBadge isPaid={shipment.isPaid} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-xl font-semibold text-gray-500">
                No Shipments Found
              </p>
              <p className="text-sm text-gray-400 mt-2">
                New shipments will appear here once created
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}