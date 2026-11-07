import React, { useState } from 'react';
import { UserRole, StudentProfileId, TeacherUser } from '../types';
import { DEMO_STUDENT_PROFILES } from '../data/mockData';
import { 
  Cpu, Brain, Code, Sparkles, ShieldCheck, BarChart3, 
  Menu, X, User, ChevronRight, Check, Lock, LogOut, LogIn
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'adaptive' | 'tasks' | 'feedback' | 'teacher' | 'research';
  setActiveTab: (tab: 'adaptive' | 'tasks' | 'feedback' | 'teacher' | 'research') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeStudentId: StudentProfileId;
  setActiveStudentId: (id: StudentProfileId) => void;
  profiles?: Record<StudentProfileId, any>;
  authenticatedTeacher: TeacherUser | null;
  onLogoutTeacher: () => void;
  onOpenTeacherLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  activeStudentId,
  setActiveStudentId,
  profiles,
  authenticatedTeacher,
  onLogoutTeacher,
  onOpenTeacherLogin,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const studentList = Object.values(profiles || DEMO_STUDENT_PROFILES);
  const currentStudent = (profiles || DEMO_STUDENT_PROFILES)[activeStudentId] || studentList[0];

  const handleSelectTab = (tab: 'adaptive' | 'tasks' | 'feedback' | 'teacher' | 'research') => {
    if ((tab === 'teacher' || tab === 'research') && !authenticatedTeacher) {
      onOpenTeacherLogin();
    } else {
      setActiveTab(tab);
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'adaptive' as const, label: 'Phân hệ A: Thích ứng', icon: Brain, requiresAuth: false },
    { id: 'tasks' as const, label: 'Ngân hàng nhiệm vụ', icon: Code, requiresAuth: false },
    { id: 'feedback' as const, label: 'Phân hệ B: Phản hồi AI', icon: Sparkles, requiresAuth: false },
    { id: 'teacher' as const, label: 'Giao diện Giáo viên', icon: ShieldCheck, requiresAuth: true },
    { id: 'research' as const, label: 'Dashboard Nghiên cứu', icon: BarChart3, requiresAuth: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2.5 sm:py-3">
        {/* Zone 1: Brand title */}
        <div 
          onClick={() => handleSelectTab('adaptive')}
          className="flex items-center gap-2 sm:gap-3 whitespace-nowrap shrink-0 min-w-0 cursor-pointer"
        >
          <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-500/20 shrink-0">
            <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white block leading-tight truncate">
              DataPath AI
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden xs:block truncate">
              Học lập trình Python List
            </span>
          </div>
        </div>

        {/* Zone 2: Desktop Navigation links (hidden on < lg) */}
        <nav className="hidden lg:flex items-center gap-1 text-xs xl:text-sm font-medium text-slate-600 dark:text-slate-300">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isProtected = item.requiresAuth && !authenticatedTeacher;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`px-2.5 xl:px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
                {isProtected && (
                  <span className="p-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400" title="Yêu cầu xác thực tài khoản giáo viên">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Desktop Controls & Authentication Section */}
        <div className="hidden md:flex items-center gap-2 xl:gap-3 shrink-0">
          
          {/* If unauthenticated or in student mode: show demo student switcher */}
          {!authenticatedTeacher && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 text-[11px]">Học sinh:</span>
              <select
                value={activeStudentId}
                onChange={(e) => setActiveStudentId(e.target.value as StudentProfileId)}
                aria-label="Chọn hồ sơ học sinh"
                className="bg-transparent font-semibold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer max-w-[130px] truncate"
              >
                {studentList.map((p: any) => (
                  <option key={p.id} value={p.id} className="dark:bg-slate-900">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Teacher Authenticated Status Card & Logout */}
          {authenticatedTeacher ? (
            <div className="flex items-center gap-2 bg-indigo-50/80 dark:bg-indigo-950/60 pl-2 pr-1 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-xs">
              {authenticatedTeacher.photoURL ? (
                <img
                  src={authenticatedTeacher.photoURL}
                  alt={authenticatedTeacher.displayName}
                  className="w-6 h-6 rounded-full object-cover border border-indigo-300 shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {authenticatedTeacher.displayName.charAt(0)}
                </div>
              )}
              <div className="text-left min-w-0 pr-1">
                <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200 leading-tight max-w-[140px] truncate">
                  {authenticatedTeacher.displayName}
                </div>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>{authenticatedTeacher.role === 'admin' ? 'Quản trị viên' : 'Giáo viên'}</span>
                </div>
              </div>

              <button
                onClick={onLogoutTeacher}
                title="Đăng xuất giáo viên"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Unauthenticated Teacher: Show Login CTA Button */
            <button
              onClick={onOpenTeacherLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-slate-700/80 transition-all shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Đăng nhập Giáo viên</span>
            </button>
          )}

          {/* Quick role indicator */}
          <div className="flex items-center px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            {authenticatedTeacher ? (
              <span className="text-indigo-600 dark:text-indigo-400">Giáo viên</span>
            ) : userRole === 'researcher' ? (
              <span className="text-amber-600 dark:text-amber-400">Nghiên cứu</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">Học sinh</span>
            )}
          </div>
        </div>

        {/* Mobile / Tablet Right Actions: Quick Role Indicator + Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          {authenticatedTeacher ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-200/60 max-w-[120px] truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="truncate">{authenticatedTeacher.displayName.split(' ').slice(-1)[0]}</span>
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/50">
              <User className="w-3 h-3" />
              <span className="max-w-[80px] truncate">{currentStudent.name.split(' ').slice(-1)[0]}</span>
            </span>
          )}

          {/* Role badge */}
          <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {authenticatedTeacher ? 'Giáo viên' : 'Học sinh'}
          </span>

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 touch-manipulation"
            aria-label={isMobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-indigo-600" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Full Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto">
          
          {/* Section: Teacher Auth Status / Actions in Mobile */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Trạng thái xác thực:
            </span>
            {authenticatedTeacher ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={authenticatedTeacher.photoURL}
                    alt={authenticatedTeacher.displayName}
                    className="w-8 h-8 rounded-full object-cover border border-indigo-300 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      {authenticatedTeacher.displayName}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Giáo viên được cấp quyền</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogoutTeacher();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg flex items-center gap-1 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Đang dùng với vai trò <strong className="text-slate-900 dark:text-white">Học sinh</strong>
                </div>
                <button
                  onClick={() => {
                    onOpenTeacherLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 rounded-lg flex items-center gap-1.5 shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập Giáo viên</span>
                </button>
              </div>
            )}
          </div>

          {/* Section: Student Profile Switcher (When in student role) */}
          {!authenticatedTeacher && (
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Hồ sơ học sinh (HS01 - HS04):
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {studentList.map((p: any) => {
                  const isSelected = activeStudentId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActiveStudentId(p.id as StudentProfileId)}
                      className={`p-2 rounded-lg text-left text-xs transition-all flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-400 text-indigo-900 dark:text-indigo-200 font-bold'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <img src={p.avatar} alt={p.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <span className="block truncate text-xs">{p.name}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{p.id}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Main Navigation Modules */}
          <div className="space-y-1 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Các phân hệ hệ thống:
            </span>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isLocked = item.requiresAuth && !authenticatedTeacher;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-between min-h-[44px] ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/80 dark:border-indigo-800'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                      {isLocked && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Khóa
                        </span>
                      )}
                    </div>
                    {isActive ? (
                      <Check className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
