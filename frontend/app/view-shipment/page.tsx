"use client";
import { WalletContext } from "@/context/wallet";
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import materialTracking from "@/app/materialTracking.json";

export default function ViewShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isConnected, signer } = useContext(WalletContext);

  // Fetch shipments from the contract
  async function getShipments() {
    const shipmentsArray = [];
    if (!signer) return;
    let contract = new ethers.Contract(
      materialTracking.address,
      materialTracking.abi,
      signer
    );

    try {
      // Call the correct function from the smart contract
      let transactions = await contract.getAllMaterialTransactions();

      // Loop through each shipment and format the data correctly
      for (const shipment of transactions) {
        const supplier = shipment.supplier;
        const contractor = shipment.contractor;
        const materialType = shipment.materialType;
        const quantity = shipment.quantity.toString(); // Assuming it's not in ether
        const pickupTime = new Date(parseInt(shipment.pickupTime) * 1000).toLocaleString();
        const deliveryTime = shipment.deliveryTime === 0 ? "Not Delivered" : new Date(parseInt(shipment.deliveryTime) * 1000).toLocaleString();
        const distance = shipment.distance.toString(); // Convert if needed
        const price = ethers.formatEther(shipment.price); // Convert price to ether

        // Map status based on the ShipmentStatus enum in the smart contract
        let status = "";
        console.log(typeof(shipment.status))

        let statusNumber = Number(shipment.status)

        if (statusNumber === 0) {
          status = "Pending";
        } else if (statusNumber === 1) {
          status = "In Transit";
        } else if (statusNumber === 2) {
          status = "Delivered";
        }

        const isPaid = shipment.isPaid ? "Paid" : "Not Paid";

        const item = {
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
          setShipments(shipmentsArray);
        } catch (error) {
          console.error("Error fetching shipments:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [isConnected, signer]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex flex-col items-center flex-grow">
        <div className="max-w-6xl w-full mx-auto p-4 flex-grow py-5">
          {isConnected ? (
            <>
              <div className="my-5">
                <h2 className="text-4xl font-bold text-center text-[#222222] uppercase">
                  Shipments
                </h2>
                <h6 className="text-[16px] text-center text-[#FF385C] mb-7">
                  View your material shipments
                </h6>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="w-40 h-40 border-4 border-dashed rounded-full animate-spin border-white mt-14"></div>
                  </div>
                ) : shipments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 border-b">Supplier</th>
                          <th className="py-2 px-4 border-b">Contractor</th>
                          <th className="py-2 px-4 border-b">Material Type</th>
                          <th className="py-2 px-4 border-b">Quantity</th>
                          <th className="py-2 px-4 border-b">Pickup Time</th>
                          <th className="py-2 px-4 border-b">Delivery Time</th>
                          <th className="py-2 px-4 border-b">Distance</th>
                          <th className="py-2 px-4 border-b">Price (ETH)</th>
                          <th className="py-2 px-4 border-b">Status</th>
                          <th className="py-2 px-4 border-b">Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipments.map((shipment, index) => (
                          <tr key={index}>
                            <td className="py-2 px-4 border-b">{shipment.supplier}</td>
                            <td className="py-2 px-4 border-b">{shipment.contractor}</td>
                            <td className="py-2 px-4 border-b">{shipment.materialType}</td>
                            <td className="py-2 px-4 border-b">{shipment.quantity}</td>
                            <td className="py-2 px-4 border-b">{shipment.pickupTime}</td>
                            <td className="py-2 px-4 border-b">{shipment.deliveryTime}</td>
                            <td className="py-2 px-4 border-b">{shipment.distance}</td>
                            <td className="py-2 px-4 border-b">{shipment.price}</td>
                            <td className="py-2 px-4 border-b">{shipment.status}</td>
                            <td className="py-2 px-4 border-b">{shipment.isPaid}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-red-400 text-center my-8 py-16 h-screen">
                    No Shipments Found...
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
