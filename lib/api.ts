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
  workshopSpot?: string;
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
  order_id?: string; // Backend order_id for verification
}

export interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  registrationData?: RegistrationData;
  order_id?: string; // Backend order_id
}

// Create Razorpay order
export async function createRazorpayOrder(orderData: RazorpayOrderData): Promise<ApiResponse<RazorpayOrderResponse>> {
  try {
    console.log('Sending order data to backend:', orderData);
    
    // Transform the data to match backend expectations
    const registrationPayload = {
      name: orderData.notes?.name || '',
      email: orderData.notes?.email || '',
      phone: orderData.notes?.phone || '',
      grade: orderData.notes?.grade || '',
      experience: orderData.notes?.experience || '',
      interests: Array.isArray(orderData.notes?.interests) 
        ? orderData.notes.interests 
        : (typeof orderData.notes?.interests === 'string' 
          ? orderData.notes.interests.split(', ') 
          : []),
      message: orderData.notes?.message || ''
    };
    
    console.log('Transformed payload for backend:', registrationPayload);
    const bodyString = JSON.stringify(registrationPayload);
    console.log('Stringified body:', bodyString);
    
    const response = await fetch(`${PAYMENT_API_URL}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyString,
    });

    const responseData = await response.json();
    console.log('Backend response:', responseData);

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to create order');
    }

    // Transform backend response to match expected format
    if (responseData.success && responseData.data) {
      return {
        success: true,
        message: responseData.message,
        data: {
          id: responseData.data.razorpay_order_id,
          entity: 'order',
          amount: responseData.data.amount,
          currency: responseData.data.currency,
          receipt: responseData.data.order_id,
          status: 'created',
          order_id: responseData.data.order_id // Store backend order_id for verification
        }
      };
    }

    return responseData;
  } catch (error) {
    console.error('Create Order Error:', error);
    throw error;
  }
}

// Verify Razorpay payment
export async function verifyRazorpayPayment(paymentData: PaymentVerificationData): Promise<ApiResponse<Registration>> {
  try {
    console.log('Verify payment - Original data:', paymentData);
    
    // Transform to match backend expectations
    const verificationPayload = {
      order_id: paymentData.order_id || paymentData.razorpay_order_id, // Use stored order_id
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature
    };
    
    const bodyString = JSON.stringify(verificationPayload);
    console.log('Verify payment - Stringified body:', bodyString);
    
    const response = await fetch(`${PAYMENT_API_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyString,
    });

    const responseData = await response.json();
    console.log('Verification response:', responseData);

    if (!response.ok) {
      throw new Error(responseData.message || 'Payment verification failed');
    }

    return responseData;
  } catch (error) {
    console.error('Payment Verification Error:', error);
    throw error;
  }
}
