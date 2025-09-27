// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-green-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-12 py-6">
        <h1 className="text-2xl font-bold">Receipt Shield</h1>
        <nav className="space-x-6">
          <Link 
            href="/login" 
            className="px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/signup" 
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
          >
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-1 items-center px-12">
        {/* Left Content */}
        <div className="w-1/2 space-y-6">
          <h2 className="text-5xl font-extrabold leading-tight">
            The <span className="text-green-400">fastest</span> way to do your
            expenses
          </h2>

          <p className="text-lg text-gray-200">
            All inclusive. Manage expenses, book travel, reimburse employees,
            and create expense reports.
          </p>

          <ul className="space-y-2 text-green-100">
            <li>✔ Corporate cards with cashback on every purchase</li>
            <li>
              ✔ 65+ integrations: QuickBooks, NetSuite, Xero, Workday, Gusto,
              and more
            </li>
            <li>✔ Secure receipt storage powered by AI</li>
          </ul>

          {/* CTA Input + Button */}
          <div className="mt-6 flex">
            <input
              type="text"
              placeholder="Enter your email or phone"
              className="flex-1 px-4 py-3 rounded-l-lg text-black focus:outline-none"
            />
            <Link
              href="/signup"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-r-lg font-semibold"
            >
              Get Started
            </Link>
          </div>

          {/* Alt options */}
          <div className="mt-4 flex space-x-4 text-sm text-gray-300">
            <Link href="/signup" className="px-4 py-2 bg-green-800 rounded-lg hover:bg-green-700 transition-colors">
              Open my own expenses
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-green-800 rounded-lg hover:bg-green-700 transition-colors">
              Manage employees (1-50)
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-green-800 rounded-lg hover:bg-green-700 transition-colors">
              Manage employees (100+)
            </Link>
          </div>
        </div>

        {/* Right Side - Dashboard Preview */}
        <div className="w-1/2 flex justify-center">
          <div className="bg-white text-gray-800 rounded-xl shadow-lg p-8 w-[400px] h-[500px] flex items-center justify-center">
            <p className="text-gray-500">[Dashboard Preview Here]</p>
          </div>
        </div>
      </section>
    </main>
  );
}
