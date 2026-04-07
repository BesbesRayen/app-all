import { Platform } from "react-native";
import Constants from "expo-constants";

const getLanHostFromExpo = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as { manifest2?: { extra?: { expoClient?: { hostUri?: string } } } }).manifest2?.extra
      ?.expoClient?.hostUri ??
    (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(":")[0] ?? null;
};

const lanHost = getLanHostFromExpo();
const defaultBaseUrl =
  lanHost != null
    ? `http://${lanHost}:8082`
    : Platform.OS === "android"
      ? "http://10.0.2.2:8082"
      : "http://localhost:8082";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? defaultBaseUrl;

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  message: string;
}

export interface Merchant {
  id: number;
  name: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  active: boolean;
  createdAt: string;
}

export type InstallmentStatus = "PENDING" | "PAID" | "OVERDUE";

export interface Installment {
  id: number;
  creditRequestId: number;
  dueDate: string;
  amount: number;
  status: InstallmentStatus;
  paidDate?: string;
  penalty?: number;
}

export interface CreditScore {
  id: number;
  score: number;
  maxCreditAmount: number;
  decision: string;
  salary: number;
  employmentType: string;
  yearsOfExperience: number;
  monthlyExpenses: number;
}

export interface CreditSimulationPayload {
  totalAmount: number;
  downPayment: number;
  numberOfInstallments: number;
}

export interface CreditSimulationResult {
  totalAmount: number;
  downPayment: number;
  remainingAmount: number;
  numberOfInstallments: number;
  monthlyAmount: number;
}

export interface CreditRequestPayload {
  totalAmount: number;
  downPayment: number;
  numberOfInstallments: number;
  merchantId?: number;
}

export interface CreditRequestResult {
  id: number;
  userId: number;
  merchantId: number;
  merchantName: string;
  totalAmount: number;
  downPayment: number;
  numberOfInstallments: number;
  monthlyAmount: number;
  status: string;
  createdAt: string;
}

export interface Payment {
  id: number;
  userId: number;
  installmentId: number;
  amount: number;
  transactionReference: string;
  paymentMethod: string;
  paidAt: string;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  kycStatus: string;
  createdAt: string;
}

export interface KycStatusResult {
  id: number;
  userId: number;
  cinFrontUrl: string;
  cinBackUrl: string;
  selfieUrl: string;
  cinNumber: string;
  status: string;
  adminComment?: string;
  createdAt: string;
}

export interface SumsubInitResult {
  userId: number;
  kycDocumentId: number;
  applicantId: string;
  sdkToken: string;
  ttlInSecs: number;
}

const getErrorMessage = async (response: Response) => {
  try {
    const body = await response.json();

    if (typeof body?.message === "string") {
      return body.message;
    }

    if (typeof body?.error === "string") {
      return body.error;
    }

    if (body && typeof body === "object") {
      const firstValidationError = Object.values(body).find((value) => typeof value === "string");
      if (typeof firstValidationError === "string") {
        return firstValidationError;
      }
    }
  } catch {
    // Ignore JSON parsing error and fallback to status-based message.
  }

  return `Request failed with status ${response.status}`;
};

const withQuery = (path: string, query?: Record<string, string | number | boolean | undefined>) => {
  if (!query) {
    return path;
  }

  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  const qs = searchParams.toString();
  if (!qs) {
    return path;
  }

  return `${path}?${qs}`;
};

const requestJson = async <T>(
  path: string,
  options?: RequestInit,
  query?: Record<string, string | number | boolean | undefined>,
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${withQuery(path, query)}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<T>;
};

export const login = async (payload: AuthRequest): Promise<AuthResponse> => {
  return requestJson<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getMerchants = async () => requestJson<Merchant[]>("/api/merchants", { method: "GET" });

export const getMyCreditScore = async (userId: number) =>
  requestJson<CreditScore>("/api/score/my", { method: "GET" }, { userId });

export const getMyInstallments = async (userId: number) =>
  requestJson<Installment[]>("/api/credits/my-installments", { method: "GET" }, { userId });

export const getMyCreditRequests = async (userId: number) =>
  requestJson<CreditRequestResult[]>("/api/credits/my", { method: "GET" }, { userId });

export const simulateCredit = async (payload: CreditSimulationPayload) =>
  requestJson<CreditSimulationResult>("/api/credits/simulate", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const requestCredit = async (userId: number, payload: CreditRequestPayload) =>
  requestJson<CreditRequestResult>(
    "/api/credits/request",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    { userId },
  );

export const getMyPayments = async (userId: number) =>
  requestJson<Payment[]>("/api/payments/my-payments", { method: "GET" }, { userId });

export const payInstallment = async (userId: number, installmentId: number, amount: number) =>
  requestJson<Payment>(
    `/api/payments/installments/${installmentId}/pay`,
    {
      method: "POST",
      body: JSON.stringify({
        installmentId,
        amount,
        paymentMethod: "CARD",
      }),
    },
    { userId },
  );

export const getProfile = async (userId: number) =>
  requestJson<UserProfile>("/api/users/profile", { method: "GET" }, { userId });

export const getKycStatus = async (userId: number) => {
  try {
    return await requestJson<KycStatusResult>("/api/kyc/status", { method: "GET" }, { userId });
  } catch (error) {
    if (error instanceof Error && error.message.includes("status 404")) {
      return null;
    }
    throw error;
  }
};

export const initSumsubKyc = async (userId: number) =>
  requestJson<SumsubInitResult>("/api/kyc/sumsub/init", { method: "POST" }, { userId });

export const syncSumsubKycStatus = async (userId: number) =>
  requestJson<KycStatusResult>("/api/kyc/sumsub/sync", { method: "POST" }, { userId });

export const getUnreadNotificationCount = async (userId: number) =>
  requestJson<number>("/api/notifications/unread-count", { method: "GET" }, { userId });