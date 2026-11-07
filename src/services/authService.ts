import { TeacherUser } from '../types';

const STORAGE_KEY_TEACHER = 'datapath_teacher_session_v1';

export interface AuthConfig {
  googleClientId: string;
  isGoogleConfigured: boolean;
  environment: string;
}

/**
 * Lấy cấu hình xác thực từ máy chủ (an toàn, không chứa secret)
 */
export async function getAuthConfig(): Promise<AuthConfig> {
  try {
    const res = await fetch('/api/auth/config');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Failed to fetch auth config from server:", err);
  }
  return {
    googleClientId: '',
    isGoogleConfigured: false,
    environment: 'preview'
  };
}

/**
 * Kiểm tra phiên đăng nhập hiện tại từ HttpOnly Cookie phía máy chủ
 */
export async function checkServerSession(): Promise<{
  authenticated: boolean;
  user: TeacherUser | null;
}> {
  try {
    const res = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include', // Gửi cookie HttpOnly kèm theo request
      headers: {
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.authenticated && data.user) {
        setStoredTeacherSession(data.user);
        return { authenticated: true, user: data.user };
      }
    }
  } catch (err) {
    console.warn("Session check error:", err);
  }

  // Nếu cookie không còn hợp lệ, xóa cache client
  clearStoredTeacherSession();
  return { authenticated: false, user: null };
}

/**
 * Đăng nhập qua Google OAuth
 * Gửi credential (ID Token) hoặc email tới máy chủ để xác minh và thiết lập HttpOnly cookie
 */
export async function signInWithGoogleOAuth(credentialOrEmail: {
  credential?: string;
  email?: string;
}): Promise<{
  success: boolean;
  user?: TeacherUser;
  error?: string;
}> {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      credentials: 'include', // Thiết lập HttpOnly Cookie từ máy chủ
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(credentialOrEmail)
    });

    const data = await res.json();

    if (res.ok && data.authorized && data.user) {
      setStoredTeacherSession(data.user);
      return { success: true, user: data.user };
    }

    return {
      success: false,
      error: data.error || 'Tài khoản chưa được cấp quyền giáo viên hoặc xác thực không thành công.'
    };
  } catch (err: any) {
    console.error("signInWithGoogleOAuth error:", err);
    return {
      success: false,
      error: 'Không thể kết nối tới máy chủ xác thực. Vui lòng kiểm tra lại kết nối mạng.'
    };
  }
}

/**
 * Đăng xuất tài khoản giáo viên (Hủy HttpOnly Cookie trên máy chủ)
 */
export async function signOutTeacher(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.warn("Logout request error:", err);
  } finally {
    clearStoredTeacherSession();
  }
}

/**
 * Đọc phiên giáo viên đã lưu tạm thời ở client để render nhanh giao diện (sẽ được verify lại qua checkServerSession)
 */
export function getStoredTeacherSession(): TeacherUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEACHER);
    if (!raw) return null;
    const user = JSON.parse(raw) as TeacherUser;
    if (user && user.email && user.isAuthorizedTeacher) {
      return user;
    }
  } catch (e) {
    console.error("Error loading cached teacher session:", e);
  }
  return null;
}

export function setStoredTeacherSession(user: TeacherUser): void {
  try {
    localStorage.setItem(STORAGE_KEY_TEACHER, JSON.stringify(user));
  } catch (e) {
    console.error("Error caching teacher session:", e);
  }
}

export function clearStoredTeacherSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_TEACHER);
  } catch (e) {
    console.error("Error clearing teacher session cache:", e);
  }
}

/**
 * Nạp thư viện Google Identity Services (GIS) của Google
 */
export function loadGoogleIdentityClient(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);

    if ((window as any).google?.accounts?.id) {
      return resolve(true);
    }

    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn("Google Identity Services script failed to load (possibly blocked by iframe/adblock)");
      resolve(false);
    };
    document.head.appendChild(script);
  });
}
