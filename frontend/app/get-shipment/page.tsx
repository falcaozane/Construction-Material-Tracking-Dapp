"use client";
import { useState, useContext } from "react";
import { ethers } from "ethers";
import { WalletContext } from "@/context/wallet";
import materialTracking from "@/app/materialTracking.json"; // ABI

interface WalletContextType {
  signer: any;
  isConnected: boolean;
}

interface ShipmentDetails {
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

export default function GetShipment() {
  const { signer, isConnected } = useContext(WalletContext) as WalletContextType;
  const [supplierAddress, setSupplierAddress] = useState("");
  const [shipmentIndex, setShipmentIndex] = useState("");
  const [shipmentDetails, setShipmentDetails] = useState<ShipmentDetails | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch shipment by supplier address and index
  async function getShipment() {
    if (!signer || !supplierAddress || !shipmentIndex) return;

    const contract = new ethers.Contract(
      materialTracking.address,
      materialTracking.abi,
      signer
    );

    try {
      setLoading(true);
      const shipment = await contract.getMaterialShipment(
        supplierAddress,
        shipmentIndex
      );

      console.log(shipment)

      const formattedShipment = {
        supplier: shipment[0],
        contractor: shipment[1],
        materialType: shipment[2],
        quantity: ethers.formatUnits(shipment[3], 18), // Assuming quantity is in wei
        pickupTime: new Date(Number(shipment[4]) * 1000).toLocaleString(), // Convert BigInt to Number
        deliveryTime: shipment[5] === BigInt(0) ? "Not Delivered" : new Date(Number(shipment[5]) * 1000).toLocaleString(), // Convert BigInt to Number
        distance: ethers.formatUnits(shipment[6], 18), // Assuming distance is in wei
        price: ethers.formatEther(shipment[7]), // Price in Ether
        status: ["Pending", "In Transit", "Delivered"][Number(shipment[8])], // Convert BigInt to Number for index
        isPaid: shipment[9] ? "Paid" : "Not Paid", // Boolean to string
      };
  
      setShipmentDetails(formattedShipment);
    } catch (error) {
      console.error("Error fetching shipment:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSupplierAddress(e.target.value);
  };

  const handleShipmentIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipmentIndex(e.target.value);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex flex-col items-center flex-grow">
        <div className="max-w-full w-full mx-auto p-4 flex-grow py-5">
          {isConnected ? (
            <>
              <div className="my-5">
                <h2 className="text-4xl font-bold text-center text-[#222222] uppercase">
                  Get Shipment Details
                </h2>
                <h6 className="text-[16px] text-center text-[#FF385C] mb-7">
                  Enter supplier address and shipment index
                </h6>
                <div className="flex flex-col md:flex-row justify-center mb-6 gap-2">
                  <input
                    type="text"
                    name="supplierAddress"
                    placeholder="Supplier Address"
                    className="w-full md:w-60 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 md:mb-0 md:mr-4"
                    value={supplierAddress}
                    onChange={handleSupplierChange}
                  />
                  <input
                    type="number"
                    name="shipmentIndex"
                    placeholder="Shipment Index"
                    className="w-full md:w-60 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 md:mb-0"
                    value={shipmentIndex}
                    onChange={handleShipmentIndexChange}
                  />
                  <button
                    onClick={getShipment}
                    className="py-2 px-6 bg-[#5E2B9D] text-white font-bold rounded-lg"
                    disabled={!supplierAddress || !shipmentIndex || loading}
                  >
                    {loading ? "Loading..." : "Get Shipment"}
                  </button>
                </div>

                {shipmentDetails ? (
                  <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-md">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 border-b text-start">Field</th>
                          <th className="py-2 px-4 border-b text-start">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(shipmentDetails).map(([key, value]) => (
                          <tr key={key}>
                            <td className="py-2 px-4 border-b font-bold capitalize">
                              {key}
                            </td>
                            <td className="py-2 px-4 border-b">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-2xl text-gray-500">
                    {loading ? "" : "Enter supplier address and shipment index to fetch details"}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-3xl font-bold text-[#FF385C] flex justify-center py-8">
              Connect Your Wallet...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
