import Link from "next/link";
import { FaTwitter, FaTelegram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full py-6 bg-gradient-to-t from-indigo-950 to-indigo-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-2 md:px-0">
        <div className='flex justify-between'>
          <div className="pr-8">
            <p className="text-sm my-2 text-gray-400">Copyright &copy; {year} Ignitus Network. All rights reserved!</p>
          </div>
          <div className="">
            <ul className="flex space-x-5 my-2">
              <li>
                <Link href="#">
                  <FaTwitter className='text-white  hover:text-[#818CF8]' size={20} />
                </Link>
              </li>
              <li>
                <Link href="https://telegram.org/">
                  <FaTelegram className='text-white hover:text-[#818CF8]' size={20} />
                </Link>
              </li>
              <li>
                <Link href="#">
                  <FaYoutube className='text-white hover:text-[#818CF8]' size={20} />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
