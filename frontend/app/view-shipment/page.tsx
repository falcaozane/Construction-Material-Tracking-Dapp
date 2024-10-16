"use client";
import { WalletContext } from "@/context/wallet";
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import materialTracking from "@/app/materialTracking.json";
import ShipmentCard from "@/components/shipmentCard/ShipmentCard";

export default function ViewShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isConnected, signer } = useContext(WalletContext);

  async function getShipments() {
    const shipmentsArray = [];
    if (!signer) return;
    let contract = new ethers.Contract(
      materialTracking.address,
      materialTracking.abi,
      signer
    );

    try {
      let transaction = await contract.getAllShipments();

      for (const shipment of transaction) {
        const shipmentId = parseInt(shipment.shipmentId);
        const contractor = shipment.contractor;
        const materialType = shipment.materialType;
        const quantity = ethers.formatUnits(shipment.quantity, "ether");
        const distance = ethers.formatUnits(shipment.distance, "ether");
        const price = ethers.formatEther(shipment.price);
        const status = shipment.status;
        
        const item = {
          shipmentId,
          contractor,
          materialType,
          quantity,
          distance,
          price,
          status
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {shipments.map((shipment, index) => (
                      <ShipmentCard shipment={shipment} key={index} />
                    ))}
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
