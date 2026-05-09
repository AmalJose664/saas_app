import Footer from "../../components/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow max-w-4xl mx-auto px-6 py-20 w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Pricing Policy</h1>
        <div className="prose max-w-none text-gray-600">
          <p>[Pricing details and custom plan explanations here]</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
