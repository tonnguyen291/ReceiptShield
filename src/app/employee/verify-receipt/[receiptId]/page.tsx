// Required for static export
export async function generateStaticParams() {
  return [
    { receiptId: '1' },
    { receiptId: '2' },
    { receiptId: '3' }
  ];
}

export default function VerifyReceiptPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Verify Receipt</h1>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Receipt verification functionality is temporarily disabled for deployment.
        </p>
      </div>
    </div>
  );
}
