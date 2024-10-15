import GetIpfsUrlFromPinata from "@/utils/index";
import Image from "next/image";
import Link from "next/link";

export default function NFTCard({ item }) {
  const IPFSUrls = GetIpfsUrlFromPinata(item.image);
  let n = Math.floor(Math.random() * IPFSUrls.length)
  const IPFSUrl = IPFSUrls[n]; // Select the first gateway URL

  const limitedDescription =
    item.description.length > 100
      ? item.description.substring(0, 100) + "..."
      : item.description;

  return (
    <div className="relative overflow-hidden rounded-lg group w-full md:w-80 border shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out bg-white">
      <Link href={`/nft/${item.tokenId}`}>
      <div className="relative w-full h-56">
        <Image
          src={IPFSUrl}
          alt={item.name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
      </div>
      <div className="p-4">
          <div className="text-indigo-800 no-underline hover:underline">
            <strong className="text-lg font-extrabold mb-2 block">{item.name}</strong>
          </div>
        <p className="text-gray-600 text-base m-0 overflow-hidden text-ellipsis max-h-[3em]">
          {limitedDescription}
        </p>
      </div>
      </Link>
    </div>
  );
}
