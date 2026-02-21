// firebase/services/CompanyService.ts
import { db } from '@/firebase/config/firebaseConfig';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

export interface Company {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phoneNumber?: string;
  email?: string;
  logoURL?: string;
  settings?: {
    notifications?: {
      emailAlerts?: boolean;
      smsAlerts?: boolean;
    };
    billing?: {
      currency?: string;
      taxRate?: number;
    };
  };
  createdAt: any;
  updatedAt: any;
}

export class CompanyService {
  /**
   * Get company by ID
   */
  static async getCompany(companyId: string): Promise<Company> {
    const companyRef = doc(db, 'companies', companyId);
    const companySnap = await getDoc(companyRef);

    if (!companySnap.exists()) {
      throw new Error('Company not found');
    }

    return {
      id: companySnap.id,
      ...companySnap.data(),
    } as Company;
  }

  /**
   * Update company information
   */
  static async updateCompany(
    companyId: string,
    data: Partial<Omit<Company, 'id' | 'createdAt'>>
  ): Promise<void> {
    const companyRef = doc(db, 'companies', companyId);
    
    await updateDoc(companyRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Update company settings
   */
  static async updateCompanySettings(
    companyId: string,
    settings: Company['settings']
  ): Promise<void> {
    const companyRef = doc(db, 'companies', companyId);
    
    await updateDoc(companyRef, {
      settings,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Update company logo
   */
  static async updateCompanyLogo(companyId: string, logoURL: string): Promise<void> {
    const companyRef = doc(db, 'companies', companyId);
    
    await updateDoc(companyRef, {
      logoURL,
      updatedAt: serverTimestamp(),
    });
  }
}
