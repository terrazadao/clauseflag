import { API_BASE_URL } from '../constants';

export async function uploadContract(formData: FormData): Promise<{ contractId: string }> {
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }

  return data;
}

export async function createPaymentIntent(contractId: string): Promise<{ clientSecret: string }> {
  const response = await fetch(`${API_BASE_URL}/payment/create-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contractId }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Payment initialization failed');
  }

  return data;
}

export async function startAnalysis(contractId: string): Promise<{ analysisId: string }> {
  const response = await fetch(`${API_BASE_URL}/analysis/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contractId }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Analysis failed to start');
  }

  return data;
}

export async function getAnalysis(analysisId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}`, {
    method: 'GET',
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to get analysis');
  }

  return data;
}

export async function sendReportEmail(analysisId: string, email: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/email/send-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ analysisId, email }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to send email');
  }
}
