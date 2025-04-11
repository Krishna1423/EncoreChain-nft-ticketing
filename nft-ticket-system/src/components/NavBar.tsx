"use client";
import Link from "next/link";
import WalletConnect from "./auth/WalletConnect";

export default function NavBar() {
  return (
    <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="text-2xl font-extrabold tracking-wide mb-3 sm:mb-0">
          🎟️ NFT Ticket Marketplace
        </div>
        <nav className="flex gap-5 text-sm sm:text-base font-medium">
          <Link
            href="/"
            className="hover:text-yellow-300 transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            href="/resale"
            className="hover:text-yellow-300 transition-colors duration-200"
          >
            Secondary Market
          </Link>
          <Link
            href="#my-tickets"
            className="hover:text-yellow-300 transition-colors duration-200"
          >
            My Tickets
          </Link>

          <WalletConnect />
        </nav>
      </div>
    </header>
  );
}

// "use client";
// import Link from "next/link";
// import WalletConnect from "./auth/WalletConnect";

// export default function NavBar() {
//   return (
//     <header className="bg-blue-600 text-white p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
//       <div className="text-2xl font-bold mb-2 sm:mb-0">
//         NFT Ticket Marketplace
//       </div>
//       <nav className="flex gap-4 text-sm sm:text-base">
//         <Link href="/" className="hover:underline">
//           Home
//         </Link>
//         <Link href="/resale" className="hover:underline">
//           Secondary Market
//         </Link>
//         <Link href="#my-tickets" className="hover:underline">
//           My Tickets
//         </Link>
//         <WalletConnect />
//       </nav>
//     </header>
//   );
// }
