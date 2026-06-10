'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function PrescriptionUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-prescription', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload');
      }

      setResult({ success: true, analysis: data.analysis });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">Upload Prescription (Rx)</h3>
      <p className="text-sm text-blue-700 mb-4">
        Some medicines in your cart require a valid doctor's prescription. Our AI will verify it instantly.
      </p>

      <div className="flex items-center gap-4">
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
        />
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          variant="outline"
          className="bg-white"
        >
          {uploading ? 'Verifying...' : 'Verify AI'}
        </Button>
      </div>

      {result && (
        <div className={`mt-4 p-4 rounded-md text-sm ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {result.success ? (
            <div>
              <strong>✅ Verified!</strong> Doctor: {result.analysis.doctorName}
              <br/>
              Medicines detected: {result.analysis.extractedMedicines.join(", ")}
            </div>
          ) : (
            <div><strong>❌ Rejected:</strong> {result.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
