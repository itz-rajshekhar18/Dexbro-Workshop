// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const PAYMENT_API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || `${API_BASE_URL}/payment`;

// Registration data type
export interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  grade: string;
  experience: string;
  interests: string[];
  message: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Registration extends RegistrationData {
  id: string;
  created_at: string;
  updated_at: string;
}

// Create a new registration
export async function createRegistration(data: RegistrationData): Promise<ApiResponse<Registration>> {
  try {
    const response = await fetch(`${API_BASE_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create registration');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Get all registrations
export async function getAllRegistrations(): Promise<ApiResponse<Registration[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/registrations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch registrations');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Get a single registration by ID
export async function getRegistrationById(id: string): Promise<ApiResponse<Registration>> {
  try {
    const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch registration');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Delete a registration
export async function deleteRegistration(id: string): Promise<ApiResponse<null>> {
  try {
    const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete registration');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Health check
export async function checkHealth(): Promise<{ status: string; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
}

// Razorpay Payment Integration

export interface RazorpayOrderData {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, any>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  registrationData: RegistrationData;
}

// Create Razorpay order
export async function createRazorpayOrder(orderData: RazorpayOrderData): Promise<ApiResponse<RazorpayOrderResponse>> {
  try {
    const response = await fetch(`${PAYMENT_API_URL}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Create Order Error:', error);
    throw error;
  }
}

// Verify Razorpay payment
export async function verifyRazorpayPayment(paymentData: PaymentVerificationData): Promise<ApiResponse<Registration>> {
  try {
    const response = await fetch(`${PAYMENT_API_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment verification failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Payment Verification Error:', error);
    throw error;
  }
}
