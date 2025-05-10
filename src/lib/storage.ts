
// Constants
const USER_PROFILE_KEY = 'billing-app-user-profile';
const INVOICES_KEY = 'billing-app-invoices';

// Types
export interface UserProfile {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  description?: string;
}

export interface Customer {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export type BillingType = 'hotel' | 'grocery' | 'custom';

export interface HotelBillingDetails {
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  services?: string[];
}

export interface GroceryBillingDetails {
  isWeightBased?: boolean;
}

export interface CustomBillingDetails {
  customFields: { key: string; value: string }[];
}

export type BillingDetails = HotelBillingDetails | GroceryBillingDetails | CustomBillingDetails;

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  taxAmount?: number;
  discount?: number;
  discountAmount?: number;
  total: number;
  billingType: BillingType;
  billingDetails?: BillingDetails;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  paid?: boolean;
}

// User Profile Functions
export const getUserProfile = (): UserProfile | null => {
  const profileData = localStorage.getItem(USER_PROFILE_KEY);
  return profileData ? JSON.parse(profileData) : null;
};

export const saveUserProfile = (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): UserProfile => {
  const existingProfile = getUserProfile();
  
  const updatedProfile: UserProfile = {
    ...(existingProfile || {}),
    ...profile,
    id: existingProfile?.id || crypto.randomUUID(),
    createdAt: existingProfile?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile));
  return updatedProfile;
};

export const deleteUserProfile = (): void => {
  localStorage.removeItem(USER_PROFILE_KEY);
};

// Invoice Functions
export const getInvoices = (): Invoice[] => {
  const invoicesData = localStorage.getItem(INVOICES_KEY);
  return invoicesData ? JSON.parse(invoicesData) : [];
};

export const saveInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice => {
  const invoices = getInvoices();
  
  const newInvoice: Invoice = {
    ...invoice,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  invoices.push(newInvoice);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  
  return newInvoice;
};

export const updateInvoice = (updatedInvoice: Invoice): Invoice => {
  const invoices = getInvoices();
  const index = invoices.findIndex(inv => inv.id === updatedInvoice.id);
  
  if (index === -1) {
    throw new Error('Invoice not found');
  }
  
  updatedInvoice.updatedAt = new Date().toISOString();
  invoices[index] = updatedInvoice;
  
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  return updatedInvoice;
};

export const deleteInvoice = (id: string): void => {
  let invoices = getInvoices();
  invoices = invoices.filter(inv => inv.id !== id);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
};

// Generate Invoice Number
export const generateInvoiceNumber = (): string => {
  const invoices = getInvoices();
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `INV-${year}${month}-`;
  
  let maxNumber = 0;
  invoices.forEach(invoice => {
    if (invoice.invoiceNumber.startsWith(prefix)) {
      const num = parseInt(invoice.invoiceNumber.replace(prefix, ''), 10);
      maxNumber = Math.max(maxNumber, num);
    }
  });
  
  const nextNumber = (maxNumber + 1).toString().padStart(4, '0');
  return `${prefix}${nextNumber}`;
};
