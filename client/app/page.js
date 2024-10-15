import Image from "next/image";
import Link from "next/link";
import { IoRocketSharp } from "react-icons/io5";
import { MdOutlineSell } from "react-icons/md";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900">
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between max-w-6xl mx-auto mb-20 w-full flex-grow p-5 gap-5">
        <div className="text-center lg:text-left lg:w-1/2">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-white">
            Where Art Meets Innovation, Step into NFTstore!
          </h1>
          <p className="text-md lg:text-lg  leading-relaxed mb-6 text-[#6A6E9F]">
            Enter the nexus of creativity and innovation at NFTstore. Uncover a
            realm of digital marvels, and together, let&apos;s redefine the future of
            collectibles.
          </p>
          <div className="flex justify-center  md:justify-start  space-x-5 items-center ">
            <button className="text-sm flex   text-white font-semibold  py-3 px-8 rounded-full transition duration-300 bg-gradient-to-br from-[#5E83EE] to-[#956AFF] hover:bg-gradient-to-br hover:from-[#5E83FF] hover:to-[#9872f7] items-center">            
              <Link href="/marketplace" className="flex space-x-3">
                <div className="font-semibold">Buy Now</div>
                <div className="text-2xl flex items-center"><IoRocketSharp className="items-center justify-items-center h-4 w-4" /></div>
              </Link>
            </button>
            <button className="text-sm flex bg-white text-indigo-600 font-semibold  py-3 px-8 rounded-full transition duration-300 hover:bg-gray-300 items-center">            
              <Link href="/sellNFT" className="flex space-x-3">
                <div className="font-semibold">List Now</div>
                <div className="text-2xl flex items-center"><MdOutlineSell className=" items-center justify-items-center h-4 w-4" /></div>
              </Link>
            </button>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex justify-center">
          <Image src="/download.jpeg" alt="NFTs" width={1075} height={650} className="w-full h-auto object-cover rounded-xl" />
        </div>
      </div>
    </div>
  );
}
