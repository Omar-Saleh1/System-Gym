export interface Member { _id: string; name: string; phone: string; email?: string; gender: 'male' | 'female'; shiftType?: 'GIRLS' | 'BOYS' | 'unassigned'; dateOfBirth?: string; address?: string; photo?: string; notes?: string; active: boolean; qrToken: string; isQrActive: boolean; createdAt: string; updatedAt: string; }
export interface SubscriptionPlan { _id: string; name: string; durationMonths: number; price: number; description?: string; active: boolean; }
export interface Subscription { _id: string; member: Member | string; plan: SubscriptionPlan | string; startDate: string; endDate: string; pricePaid: number; paymentMethod: string; notes?: string; status: 'active' | 'expired' | 'cancelled' | 'frozen'; freezeStartDate?: string; freezeEndDate?: string; createdBy?: Cashier | string; }
export interface Cashier { _id: string; name: string; username: string; role: 'admin' | 'cashier' | 'trainer'; shiftType?: 'GIRLS' | 'BOYS'; active?: boolean; }
export interface Attendance { _id: string; member: Member | string; checkIn: string; checkOut?: string; shiftType?: string; }

