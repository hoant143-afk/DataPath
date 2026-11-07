import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, Lock, ArrowLeft, AlertTriangle, CheckCircle2, 
  HelpCircle, Settings, KeyRound, ExternalLink, ShieldCheck, Info
} from 'lucide-react';
import { TeacherUser } from '../types';
import { 
  signInWithGoogleOAuth, getAuthConfig, loadGoogleIdentityClient, AuthConfig 
} from '../services/authService';

interface TeacherLoginViewProps {
  onLoginSuccess: (user: TeacherUser) => void;
  onBackToStudent: () => void;
}

export const TeacherLoginView: React.FC<TeacherLoginViewProps> = ({
  onLoginSuccess,
  onBackToStudent,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authConfig, setAuthConfig] = useState<AuthConfig>({
    googleClientId: '',
    isGoogleConfigured: false,
    environment: 'preview'
  });
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Lấy cấu hình OAuth từ máy chủ và khởi tạo Google Identity Services
  useEffect(() => {
    let isMounted = true;

    async function initGoogleAuth() {
      const config = await getAuthConfig();
      if (!isMounted) return;
      setAuthConfig(config);

      if (config.googleClientId) {
        const loaded = await loadGoogleIdentityClient();
        if (loaded && isMounted && (window as any).google?.accounts?.id) {
          try {
            (window as any).google.accounts.id.initialize({
              client_id: config.googleClientId,
              callback: async (response: any) => {
                if (response?.credential) {
                  setIsLoading(true);
                  setErrorMessage(null);
                  const res = await signInWithGoogleOAuth({ credential: response.credential });
                  setIsLoading(false);
                  if (res.success && res.user) {
                    onLoginSuccess(res.user);
                  } else {
                    setErrorMessage(res.error || 'Tài khoản chưa được cấp quyền giáo viên.');
                  }
                }
              }
            });

            if (googleBtnContainerRef.current) {
              (window as any).google.accounts.id.renderButton(
                googleBtnContainerRef.current,
                { 
                  theme: 'outline', 
                  size: 'large', 
                  width: '100%',
                  text: 'continue_with',
                  shape: 'pill'
                }
              );
            }
          } catch (e) {
            console.warn("Google Identity Services render error:", e);
          }
        }
      }
    }

    initGoogleAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Xử lý khi nhấn nút "Tiếp tục với Google"
  const handleContinueWithGoogle = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    if (authConfig.googleClientId && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt();
        setIsLoading(false);
        return;
      } catch (promptErr) {
        console.warn("Google prompt error:", promptErr);
      }
    }

    setIsLoading(false);
    setErrorMessage('Chức năng Google OAuth yêu cầu cấu hình biến môi trường GOOGLE_CLIENT_ID trên Vercel. Vui lòng thiết lập GOOGLE_CLIENT_ID trong cài đặt dự án Vercel.');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 transition-all">
        
        {/* Header: Logo & Tiêu đề */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shadow-xs">
            <div className="relative">
              <Cpu className="w-8 h-8" />
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-xs">
                <Lock className="w-3 h-3" />
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Đăng nhập dành cho giáo viên
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Xác thực danh tính bằng Google OAuth để truy cập công cụ kiểm duyệt phản hồi DA6 và lộ trình thích ứng DA4.
            </p>
          </div>
        </div>

        {/* Thông báo lỗi khi tài khoản không có quyền hoặc thiếu cấu hình */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/70 text-rose-800 dark:text-rose-200 text-xs sm:text-sm space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-start gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>Thông báo xác thực</span>
            </div>
            <p className="text-xs leading-relaxed text-rose-700 dark:text-rose-300 pl-6">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Primary Action: Nút "Tiếp tục với Google" */}
        <div className="space-y-4">
          
          {/* Nút Google chuẩn (nếu đã nạp SDK) */}
          <div ref={googleBtnContainerRef} className="w-full flex justify-center"></div>

          {/* Nút bấm "Tiếp tục với Google" */}
          <button
            onClick={handleContinueWithGoogle}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-semibold text-sm shadow-xs hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Google SVG Official Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isLoading ? 'Đang xác thực Google...' : 'Tiếp tục với Google'}</span>
          </button>

          {/* Hướng dẫn cấu hình Vercel GOOGLE_CLIENT_ID */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Cấu hình triển khai Vercel:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Để kích hoạt nút Google OAuth chính thức, hãy thêm biến môi trường <code className="font-mono text-indigo-600 dark:text-indigo-400">GOOGLE_CLIENT_ID</code> trong cài đặt dự án trên Vercel. Phiên đăng nhập được bảo mật bằng Cookie HttpOnly mã hóa HMAC.
            </p>
          </div>
        </div>

        {/* Nút "Quay lại giao diện học sinh" */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onBackToStudent}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại giao diện học sinh</span>
          </button>
        </div>

      </div>
    </div>
  );
};
