import Link from "next/link";
import { IoRocketSharp } from "react-icons/io5";
import { MdOutlineSell } from "react-icons/md";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between max-w-6xl mx-auto w-full flex-grow p-5 gap-5">
        <div className="text-center lg:text-left lg:w-1/2">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-[#222222]">
          Material-Flow <span className="text-[#5F259F]">Supply chain with Transparency & Trust.</span>
          </h1>
          <p className="text-md lg:text-lg  leading-relaxed mb-6 text-[#222222] ">
            Fosters accountability and enhances communication between suppliers and contractors, streamlining the entire supply chain process.          </p>
          <div className="flex justify-center  md:justify-start  space-x-5 items-center ">
            <button className="text-sm flex   text-white font-semibold  py-3 px-8 rounded-full transition duration-300 bg-[#5F259F] hover:bg-[#5F259F] items-center">            
              <Link href="/marketplace" className="flex space-x-3">
                <div className="font-semibold">Ship Now</div>
                <div className="text-2xl flex items-center"><IoRocketSharp className="items-center justify-items-center h-4 w-4" /></div>
              </Link>
            </button>
            <button className="text-sm flex bg-white text-[#5F259F] font-semibold border py-3 px-8 rounded-full transition duration-300 shadow-lg hover:bg-[#EBEBEB] items-center">            
              <Link href="/sellNFT" className="flex space-x-3">
                <div className="font-semibold">Explore </div>
                <div className="text-2xl flex items-center"><MdOutlineSell className=" items-center justify-items-center h-4 w-4" /></div>
              </Link>
            </button>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex justify-center">
          <img src="https://media4.giphy.com/media/6jnuP7BZPv3uAAtAFs/giphy.gif?cid=6c09b9526kgqe631adcddp6pimoc8f9wbhff2attw0srzw36&ep=v1_gifs_search&rid=giphy.gif&ct=g" alt="NFTs" width={1075} height={650} className="w-full h-auto object-cover rounded-xl" />
        </div>
      </div>
    </div>
  );
}