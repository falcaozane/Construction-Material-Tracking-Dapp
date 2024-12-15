import Link from "next/link";

// Define the shipment type
interface Shipment {
  shipmentId: string;
  contractor: string;
  quantity: number;
  distance: number;
  price: number;
}

interface ShipmentCardProps {
  shipment: Shipment;
}

export default function ShipmentCard({ shipment }: ShipmentCardProps) {
  

  return (
    <div className="relative overflow-hidden rounded-lg group w-full md:w-80 border shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out bg-white">
      <Link href={`/shipment/${shipment.shipmentId}`}>
        <div className="p-4">
          <div className="text-indigo-800 no-underline hover:underline">
            <strong className="text-lg font-extrabold mb-2 block">
              Shipment #{shipment.shipmentId}
            </strong>
          </div>
          <p className="text-gray-600 text-base m-0 overflow-hidden text-ellipsis max-h-[3em]">
            Contractor: {shipment.contractor}
          </p>
          <p className="text-gray-600 text-base m-0 overflow-hidden text-ellipsis max-h-[3em]">
            Quantity: {shipment.quantity}
          </p>
          <p className="text-gray-600 text-base m-0 overflow-hidden text-ellipsis max-h-[3em]">
            Distance: {shipment.distance} km
          </p>
          <p className="text-gray-600 text-base m-0 overflow-hidden text-ellipsis max-h-[3em]">
            Price: {shipment.price} ETH
          </p>
        </div>
      </Link>
    </div>
  );
}
