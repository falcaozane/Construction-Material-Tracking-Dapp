"use client";
import { useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { WalletContext } from "@/context/wallet";
import materialTracking from "@/app/materialTracking.json"; // Import your contract's ABI and address

export default function CreateShipment() {
  const { signer, isConnected } = useContext(WalletContext) as { signer: any, isConnected : any };
  const router = useRouter();

  const [formParams, setFormParams] = useState({
    contractor: "",
    materialType: "",
    quantity: "",
    pickupTime: "",
    distance: "",
    price: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const { contractor, materialType, quantity, pickupTime, distance, price } = formParams;
    setIsFormValid(
      contractor && materialType && quantity && pickupTime && distance && price
    );
  }, [formParams]);

  async function createShipment() {
    try {
      setIsSubmitting(true);

      const { contractor, materialType, quantity, pickupTime, distance, price } = formParams;

      if (!isFormValid) {
        toast.error("Please fill in all the fields!");
        return;
      }

      const contract = new ethers.Contract(materialTracking.address, materialTracking.abi, signer);

      const priceInEther = ethers.parseEther(price); // Convert price to ether

      const tx = await contract.createMaterialShipment(
        contractor,
        materialType,
        ethers.parseUnits(quantity, 18), // Convert quantity to a BigNumber
        new Date(pickupTime).getTime() / 1000, // Convert pickupTime to UNIX timestamp
        ethers.parseUnits(distance, 18), // Distance as BigNumber
        priceInEther, // Price in ethers
        { value: priceInEther } // Sending the value with the transaction
      );

      await tx.wait(); // Wait for transaction confirmation

      toast.success("Shipment created successfully!");
      router.push("/view-shipment"); // Navigate to the shipments page
    } catch (error) {
      console.error("Error creating shipment:", error);
      toast.error("Error creating shipment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormParams({ ...formParams, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#DED9FA]">
      {isConnected ? (
        <div className="flex flex-col items-center justify-center flex-grow mx-2">
          <div className="border-2  bg-[#7557B8] w-full max-w-2xl p-8  rounded-2xl my-5">
            <h2 className="text-3xl md:text-4xl text-white mb-5 text-center uppercase font-extrabold">
              Create Material Shipment
            </h2>
            <h5 className="font-bold text-md my-2 text-center text-white">
              Input Shipment Details
            </h5>
            <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 mx-auto items-center">
              <div className="mb-6">
                <label className="block text-left text-lg font-bold mb-2 text-indigo-100">
                  Contractor Address
                </label>
                <input
                  type="text"
                  name="contractor"
                  className="w-full px-4 py-2 text-base bg-[#967EDD] text-indigo-50  rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formParams.contractor}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-6">
                <label className="block text-left text-lg font-bold mb-2 text-indigo-100">
                  Material Type
                </label>
                <input
                  type="text"
                  name="materialType"
                  className="w-full px-4 py-2 text-base bg-[#967EDD] text-indigo-50  rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formParams.materialType}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-6">
                <label className="block text-left text-lg font-bold mb-2 text-indigo-100">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  className="w-full px-4 py-2 text-base bg-[#967EDD] text-indigo-50  rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formParams.quantity}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-6">
                <label className="block text-left text-lg font-bold mb-2 text-indigo-100">
                  Pickup Time
                </label>
                <input
                  type="datetime-local"
                  name="pickupTime"
                  className="w-full px-4 py-2 text-base bg-[#967EDD] text-indigo-50  rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formParams.pickupTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-6">
                <label className="block text-left text-lg font-bold mb-2 text-indigo-100">
                  Distance (km)
                </label>
                <input
                  type="number"
                  name="distance"
                  className="w-full px-4 py-2 text-base bg-[#967EDD] text-indigo-50  rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formParams.distance}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-6">
                <label className="block text-left text-lg font-bold mb-2 text-indigo-100">
                  Price (ETH)
                </label>
                <input
                  type="number"
                  name="price"
                  className="w-full px-4 py-2 text-base bg-[#967EDD] text-indigo-50  rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formParams.price}
                  onChange={handleInputChange}
                />
              </div>
              
                <button
                  type="button"
                  onClick={createShipment}
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full py-3 px-6 text-lg font-bold rounded-lg transition-colors ${
                    isFormValid
                      ? "bg-white text-[#5E2B9D] hover:bg-gray-100"
                      : "bg-white text-[#5E2B9D] cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="inline-block bo border-l-white rounded-full mr-2 w-6 h-6 animate-spin" />
                  ) : (
                    "Create Shipment"
                  )}
                </button>
                <button className="bg-red-500 text-white py-3 px-6 text-lg font-bold rounded-lg">
                  Cancel transaction
                </button>
            </form>
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
