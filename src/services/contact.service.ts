export interface ContactFormPayload {
  name: string;
  company: string;
  email_address: string;
  phone: string;
  message?: string;
}

export interface ContactFormSubmissionData {
  id: string;
  status: string;
  createdAt: string;
}

export interface BackendContactFormResponse {
  status: string;
  message: string;
  data: ContactFormSubmissionData;
}

const getApiConfig = (): { baseUrl: string; apiKey: string } => {
  const rawUrl = import.meta.env.BACKEND_API_URL;
  const apiKey = import.meta.env.BACKEND_API_KEY;

  if (!rawUrl || !apiKey) {
    throw new Error(
      'Missing BACKEND_API_URL or BACKEND_API_KEY environment variables'
    );
  }

  return {
    baseUrl: rawUrl.replace(/\/+$/, ''),
    apiKey,
  };
};

/**
 * Submits the contact form payload to the central backend forms endpoint.
 */
export const submitContactForm = async (
  payload: ContactFormPayload
): Promise<BackendContactFormResponse> => {
  const { baseUrl, apiKey } = getApiConfig();
  const url = `${baseUrl}/forms/contact-form/submit`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      name: payload.name,
      company: payload.company,
      email_address: payload.email_address,
      phone: payload.phone,
      message: payload.message ?? '',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Contact form API request failed (${response.status}): ${errorText || response.statusText}`
    );
  }

  const json = (await response.json()) as BackendContactFormResponse;
  if (json.status !== 'success') {
    throw new Error(json.message || 'Contact form submission failed');
  }

  return json;
};
