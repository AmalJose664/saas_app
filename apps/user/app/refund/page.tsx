import Footer from "../../components/Footer";

export default function RefundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow max-w-4xl mx-auto px-6 py-20 w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Refund & Cancellation Policy</h1>
        <div className="prose max-w-none text-gray-600">
          <p>[Refund and Cancellation Policy here]</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
