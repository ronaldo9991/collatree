import { NavHeader } from "@/components/nav-header";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About CollaboTree</h1>
        <p className="text-gray-700 mb-8">A student-only freelancing platform connecting buyers with verified students.</p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl shadow border">
              <h3 className="font-semibold mb-2">Verified Students</h3>
              <p className="text-gray-600">Every student is verified to ensure authenticity and trust.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow border">
              <h3 className="font-semibold mb-2">Fair Pricing</h3>
              <p className="text-gray-600">Transparent pricing that supports students and delivers value.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow border">
              <h3 className="font-semibold mb-2">Project Oversight</h3>
              <p className="text-gray-600">Admin-escrow and milestone monitoring for safe delivery.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
          <ol className="list-decimal pl-6 space-y-2 text-gray-700">
            <li>Choose a project or post a request.</li>
            <li>Agree on scope and send funds to admin-escrow.</li>
            <li>Project is delivered under platform monitoring.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}


