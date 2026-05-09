import Footer from "../../components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow max-w-4xl mx-auto px-6 py-20 w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
        <div className="prose max-w-none text-gray-600">
          <p>[Contact Information here]</p>
          <br />
          <p>[Physical Address here]</p>
          <p>[Phone Number here]</p>
          <p>[Email Address here]</p>
          <br />
          <p>[Grievance Officer details here]</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
