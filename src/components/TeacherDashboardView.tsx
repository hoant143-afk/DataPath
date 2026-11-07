import React, { useState } from 'react';
import { StudentProfile, CodeSubmission, AuditLogEntry, StudentProfileId, TeacherUser, StudentReviewRequest } from '../types';
import { KNOWLEDGE_UNITS } from '../data/mockData';
import { computeMasteryMetrics, getUnitMasteryStatus } from '../utils/adaptiveEngine';
import { 
  ShieldCheck, CheckCircle2, History, PauseCircle, Layers, Info, AlertCircle, 
  Check, Edit3, XCircle, ArrowRightLeft, Sparkles, AlertTriangle, Bug, Code, UserCheck, RefreshCw, KeyRound
} from 'lucide-react';

interface TeacherDashboardViewProps {
  currentTeacher?: TeacherUser | null;
  profiles: Record<StudentProfileId, StudentProfile>;
  onUpdateStudentRecommendation: (
    studentId: StudentProfileId,
    status: 'Giáo viên đã duyệt' | 'Giáo viên đã sửa' | 'Tạm dừng',
    note?: string
  ) => void;
  onEditStudentPath: (
    studentId: StudentProfileId,
    editData: {
      level: 'Củng cố' | 'Luyện tập' | 'Vận dụng';
      path: string;
      targetUnits: string[];
      reason: string;
    }
  ) => void;
  submissions: CodeSubmission[];
  onModerateSubmission: (
    subId: string,
    action: 'approve' | 'edit' | 'reject',
    data: {
      status: 'Đã duyệt' | 'Đã chỉnh sửa' | 'Từ chối phản hồi';
      teacherComment?: string;
      editReason?: string;
      rejectionReason?: string;
      independentScore?: number;
      independentComments?: string;
      hasCriticalError?: boolean;
      criticalErrorDetails?: string;
      teacherVerificationLabel?: 'Đánh giá AI đúng' | 'Sai lệch đã xác minh' | 'Chưa đủ căn cứ';
      evidenceAccuracyVerified?: boolean;
      suggestionSuitabilityVerified?: boolean;
      editedFeedback?: {
        evidence: string;
        assessment: string;
        suggestion: string;
        socraticQuestion: string;
      };
    }
  ) => void;
  onApplyDA4Sync: (subId: string) => void;
  auditLogs: AuditLogEntry[];
  reviewRequests?: StudentReviewRequest[];
  onResolveReviewRequest?: (requestId: string, status: 'Đã chấp nhận' | 'Đã điều chỉnh' | 'Đã từ chối', responseText: string) => void;
  onApprovePendingProposal?: (studentId: StudentProfileId) => void;
  onResetData?: () => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  currentTeacher,
  profiles,
  onUpdateStudentRecommendation,
  onEditStudentPath,
  submissions,
  onModerateSubmission,
  onApplyDA4Sync,
  auditLogs,
  reviewRequests = [],
  onResolveReviewRequest,
  onApprovePendingProposal,
  onResetData,
}) => {
  const [selectedStudentKey, setSelectedStudentKey] = useState<StudentProfileId>('HS02');
  const [activeTab, setActiveTab] = useState<'students' | 'submissions' | 'audit' | 'reviews'>('submissions');
  const [teacherNoteInput, setTeacherNoteInput] = useState('');

  // Submissions moderation state
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  // Form states for selected submission being moderated
  const [editScoreInput, setEditScoreInput] = useState<number>(8);
  const [editTeacherComment, setEditTeacherComment] = useState('');
  const [editReasonInput, setEditReasonInput] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isCriticalErrorChecked, setIsCriticalErrorChecked] = useState(false);
  const [criticalErrorInput, setCriticalErrorInput] = useState('');
  const [editVerificationLabel, setEditVerificationLabel] = useState<'Đánh giá AI đúng' | 'Sai lệch đã xác minh' | 'Chưa đủ căn cứ'>('Đánh giá AI đúng');

  // Editable feedback fields
  const [editedAssessment, setEditedAssessment] = useState('');
  const [editedSuggestion, setEditedSuggestion] = useState('');
  const [editedSocratic, setEditedSocratic] = useState('');

  // Path edit modal state (Can thiệp & Sửa lộ trình thực chất)
  const [isEditPathModalOpen, setIsEditPathModalOpen] = useState(false);
  const [editLevel, setEditLevel] = useState<'Củng cố' | 'Luyện tập' | 'Vận dụng'>('Luyện tập');
  const [editPathText, setEditPathText] = useState('');
  const [editTargetUnits, setEditTargetUnits] = useState<string[]>([]);
  const [editPathReason, setEditPathReason] = useState('');

  // DA4 Sync confirmation modal state
  const [syncConfirmSub, setSyncConfirmSub] = useState<CodeSubmission | null>(null);

  const currentStudent = profiles[selectedStudentKey] || profiles['HS02'];
  const mastery = computeMasteryMetrics(currentStudent.diagnosticScores, KNOWLEDGE_UNITS);

  const handleOpenEditPathModal = () => {
    const student = profiles[selectedStudentKey] || profiles['HS02'];
    setEditLevel(student.currentRecommendation.level);
    setEditPathText(student.currentRecommendation.path);
    const units = Object.keys(student.diagnosticScores).filter(k => (student.diagnosticScores[k] ?? 0) < 80);
    setEditTargetUnits(units.length > 0 ? units.slice(0, 3) : ['K06', 'K07', 'K08']);
    setEditPathReason(student.currentRecommendation.teacherNote || '');
    setIsEditPathModalOpen(true);
  };

  const handleSaveEditedPath = () => {
    if (!editPathText.trim() || !editPathReason.trim()) return;
    onEditStudentPath(selectedStudentKey, {
      level: editLevel,
      path: editPathText.trim(),
      targetUnits: editTargetUnits,
      reason: editPathReason.trim()
    });
    setIsEditPathModalOpen(false);
  };

  const handleStartReview = (sub: CodeSubmission) => {
    setEditingSubId(sub.id);
    setEditScoreInput(sub.teacherReview.independentScore ?? sub.overallScore ?? 8);
    setEditTeacherComment(sub.teacherReview.teacherComment || sub.teacherReview.independentComments || '');
    setEditReasonInput(sub.teacherReview.editReason || '');
    setRejectionReasonInput(sub.teacherReview.rejectionReason || '');
    setIsCriticalErrorChecked(sub.teacherReview.hasCriticalError || false);
    setCriticalErrorInput(sub.teacherReview.criticalErrorDetails || '');
    setEditVerificationLabel(sub.teacherReview.teacherVerificationLabel || (sub.teacherReview.hasCriticalError ? 'Sai lệch đã xác minh' : 'Đánh giá AI đúng'));
    setEditedAssessment(sub.aiFeedback.assessment);
    setEditedSuggestion(sub.aiFeedback.suggestion);
    setEditedSocratic(sub.aiFeedback.socraticQuestion);
  };

  const filteredSubmissions = submissions.filter(s => {
    if (submissionFilter === 'pending') return s.teacherReview.status === 'Chờ duyệt';
    if (submissionFilter === 'reviewed') return s.teacherReview.status !== 'Chờ duyệt';
    return true;
  });

  const pendingCount = submissions.filter(s => s.teacherReview.status === 'Chờ duyệt').length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 sm:p-6 rounded-2xl shadow-xl border border-indigo-900/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4 shrink-0" /> TRUNG TÂM KIỂM DUYỆT GIÁO VIÊN (TEACHER MODERATION)
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">Thẩm định Lộ trình Thích ứng & Phản hồi AI</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Giáo viên có quyền lực tối cao (Human-in-the-loop): Thẩm định, chấm điểm độc lập (Ground-truth), chỉnh sửa phản hồi, từ chối khi AI có sai sót, và phê duyệt đồng bộ năng lực sang DA4.
          </p>
          {currentTeacher && (
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-indigo-300 font-medium">Phiên làm việc:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-800/80 border border-indigo-600/60 text-xs font-semibold text-white shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{currentTeacher.displayName}</span>
                <span className="text-[10px] text-indigo-300 font-mono">({currentTeacher.email})</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono uppercase">
                  {currentTeacher.role}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center bg-white/10 p-1 rounded-xl self-start md:self-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-3 py-1.5 min-h-[38px] text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 touch-manipulation flex-1 sm:flex-initial ${
              activeTab === 'submissions' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Kiểm duyệt ({submissions.length})</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-amber-500 text-slate-950 font-bold rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 min-h-[38px] text-xs font-semibold rounded-lg transition-all text-center touch-manipulation flex-1 sm:flex-initial ${
              activeTab === 'students' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Hồ sơ DA4
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 min-h-[38px] text-xs font-semibold rounded-lg transition-all text-center touch-manipulation flex-1 sm:flex-initial ${
              activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Audit Log ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-1.5 min-h-[38px] text-xs font-semibold rounded-lg transition-all text-center touch-manipulation flex-1 sm:flex-initial ${
              activeTab === 'reviews' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Yêu cầu xem xét ({reviewRequests.filter(r => r.status === 'Chờ xử lý').length})
          </button>
        </div>
      </div>

      {/* Cảnh báo rõ ràng giới hạn lưu trữ dữ liệu & bảo mật */}
      <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-start gap-2.5 text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 dark:text-slate-200">Giới hạn bảo mật & lưu trữ:</strong> Dữ liệu thẩm định và lộ trình hiện được lưu trong bộ nhớ cục bộ trình duyệt (LocalStorage) kết hợp xác thực phân quyền RBAC phía máy chủ. Dữ liệu chưa đồng bộ cơ sở dữ liệu Firebase Firestore đám mây. Các thao tác phê duyệt, sửa lộ trình và ghi đè phản hồi chỉ có hiệu lực trong phiên làm việc của giáo viên đã xác thực.
        </div>
      </div>

      {/* Tab: Submissions Moderation */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {/* Submissions Filter & Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">Lọc bài kiểm duyệt:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSubmissionFilter('all')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition touch-manipulation ${
                    submissionFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Tất cả ({submissions.length})
                </button>
                <button
                  onClick={() => setSubmissionFilter('pending')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition flex items-center gap-1 touch-manipulation ${
                    submissionFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>Chờ duyệt</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                    {pendingCount}
                  </span>
                </button>
                <button
                  onClick={() => setSubmissionFilter('reviewed')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition touch-manipulation ${
                    submissionFilter === 'reviewed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Đã duyệt ({submissions.length - pendingCount})
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Đã duyệt
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Đã sửa
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Từ chối
              </span>
            </div>
          </div>

          {/* Submissions List */}
          <div className="space-y-4">
            {filteredSubmissions.map(sub => {
              const isEditing = editingSubId === sub.id;
              const hasDA4Proposal = sub.da4SyncRecommendation && !sub.da4SyncRecommendation.isApplied;
              const isAppliedDA4 = sub.da4SyncRecommendation?.isApplied;

              return (
                <div
                  key={sub.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isEditing
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {/* Top Bar of Card */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {sub.id}
                      </span>
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">{sub.studentName}</span>
                      <span className="text-slate-400 text-xs">· {sub.taskTitle}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">
                        Điểm AI: <strong className="text-indigo-600">{sub.overallScore ?? '--'}đ</strong>
                      </span>
                      {sub.teacherReview.independentScore !== undefined && (
                        <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 font-mono text-emerald-700 dark:text-emerald-300">
                          Điểm GV: <strong>{sub.teacherReview.independentScore}đ</strong>
                        </span>
                      )}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        sub.teacherReview.status === 'Đã duyệt' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                        sub.teacherReview.status === 'Đã chỉnh sửa' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                        sub.teacherReview.status === 'Từ chối phản hồi' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' :
                        'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {sub.teacherReview.status}
                      </span>
                      {sub.teacherReview.teacherVerificationLabel && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          sub.teacherReview.teacherVerificationLabel === 'Đánh giá AI đúng' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                          sub.teacherReview.teacherVerificationLabel === 'Sai lệch đã xác minh' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                          'bg-amber-50 text-amber-700 border-amber-300'
                        }`}>
                          {sub.teacherReview.teacherVerificationLabel}
                        </span>
                      )}
                      {sub.teacherReview.historicalAuditNote && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300">
                          Minh chứng kiểm toán
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Historical Audit Banner if applicable */}
                  {sub.teacherReview.historicalAuditNote && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/60 text-xs space-y-1.5 text-purple-950 dark:text-purple-200">
                      <div className="font-bold flex items-center gap-1.5 text-purple-900 dark:text-purple-300">
                        <AlertTriangle className="w-4 h-4 text-purple-600" />
                        <span>Hồ sơ Kiểm toán Lịch sử (SUB-7157 / SUB-2130 / SUB-4673):</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {sub.teacherReview.historicalAuditNote}
                      </p>
                      {sub.teacherReview.reEvaluation && (
                        <div className="mt-1 pt-1.5 border-t border-purple-200/70 dark:border-purple-800/70 text-[11px] space-y-0.5">
                          <div>
                            <strong>Bản Đánh giá lại liên kết:</strong> Phiên bản <span className="font-mono font-semibold">{sub.teacherReview.reEvaluation.version}</span> lúc {sub.teacherReview.reEvaluation.reEvaluatedAt}.
                          </div>
                          <div>
                            <strong>Điểm sau chuẩn hóa:</strong>{' '}
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{sub.teacherReview.reEvaluation.newScore}/10đ</span> — {sub.teacherReview.reEvaluation.rationale}
                          </div>
                          <div className="text-[10px] text-slate-500 italic">
                            * Điểm lịch sử gốc ({sub.overallScore}/10đ) được bảo toàn nguyên trạng làm bằng chứng kiểm toán độc lập, không tự động ghi đè.
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Code & AI Feedback Side-by-Side */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs pt-2">
                    {/* Student Code (5 cols) */}
                    <div className="lg:col-span-5 p-3 bg-slate-950 rounded-xl space-y-1.5 border border-slate-800">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1 font-semibold text-slate-300">
                          <Code className="w-3.5 h-3.5 text-indigo-400" /> Mã nguồn nộp:
                        </span>
                        <span className="font-mono text-[10px]">Tĩnh: an toàn</span>
                      </div>
                      <pre className="font-mono text-[11px] text-emerald-400 overflow-x-auto p-1 leading-relaxed">
                        {sub.code}
                      </pre>
                      {sub.detectedIssues && sub.detectedIssues.length > 0 && (
                        <div className="pt-1 border-t border-slate-800 space-y-1">
                          {sub.detectedIssues.map((iss, i) => (
                            <div key={i} className="text-[10px] text-amber-300 flex items-center gap-1">
                              <Bug className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>{iss.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* AI Feedback & Rubric (7 cols) */}
                    <div className="lg:col-span-7 space-y-2 p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-600" /> Đề xuất từ Phân hệ AI Feedback
                        </span>
                        {sub.teacherReview.hasCriticalError && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900">
                            Có lỗi nghiêm trọng từ AI
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                        <div><strong>Bằng chứng:</strong> {sub.aiFeedback.evidence}</div>
                        <div><strong>Nhận định:</strong> {sub.aiFeedback.assessment}</div>
                        <div><strong>Gợi ý:</strong> {sub.aiFeedback.suggestion}</div>
                        <div className="text-indigo-700 dark:text-indigo-300">
                          <strong>Câu hỏi Socratic:</strong> &quot;{sub.aiFeedback.socraticQuestion}&quot;
                        </div>
                      </div>

                      {/* Criteria Scores summary */}
                      <div className="grid grid-cols-5 gap-1 pt-1 border-t dark:border-indigo-900/60 text-[10px]">
                        {sub.criteriaScores.map(c => (
                          <div key={c.criteriaId} className="p-1 rounded bg-white/70 dark:bg-slate-900/60 text-center">
                            <span className="block text-slate-400">TC{c.criteriaId}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {c.score !== null ? `${c.score}đ` : 'Chưa đủ DL'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bản giáo viên đã chỉnh sửa & Nhật ký kiểm duyệt (Dành riêng cho giáo viên) */}
                  {sub.teacherReview.editedFeedback && (
                    <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between border-b border-blue-200/60 dark:border-blue-900/60 pb-2">
                        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold uppercase tracking-wider text-[11px]">
                          <Edit3 className="w-4 h-4 text-blue-600" /> Bản giáo viên đã chỉnh sửa (Phản hồi chính thức gửi học sinh)
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                          {sub.teacherReview.status}
                        </span>
                      </div>

                      {/* 4 thành phần phản hồi chính thức */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-800 dark:text-slate-200">
                        <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg">
                          <strong className="text-blue-700 dark:text-blue-400">1. Bằng chứng:</strong> {sub.teacherReview.editedFeedback.evidence}
                        </div>
                        <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg">
                          <strong className="text-blue-700 dark:text-blue-400">2. Nhận định:</strong> {sub.teacherReview.editedFeedback.assessment}
                        </div>
                        <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg">
                          <strong className="text-blue-700 dark:text-blue-400">3. Gợi ý:</strong> {sub.teacherReview.editedFeedback.suggestion}
                        </div>
                        <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg">
                          <strong className="text-blue-700 dark:text-blue-400">4. Câu hỏi Socratic:</strong> &quot;{sub.teacherReview.editedFeedback.socraticQuestion}&quot;
                        </div>
                      </div>

                      {/* Nhật ký kiểm duyệt và lý do chỉnh sửa */}
                      <div className="p-2.5 bg-blue-100/60 dark:bg-blue-900/40 rounded-lg border border-blue-200/80 dark:border-blue-800/60 text-[11px] space-y-1 text-blue-950 dark:text-blue-200">
                        <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
                          <span>📋 Nhật ký kiểm duyệt & Đối chiếu nghiên cứu:</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            Thời gian sửa: {sub.teacherReview.reviewedAt || 'N/A'} {sub.teacherReview.reviewedBy ? `bởi ${sub.teacherReview.reviewedBy}` : ''}
                          </span>
                        </div>
                        {sub.teacherReview.editReason && (
                          <div>
                            <strong>Lý do chỉnh sửa (editReason):</strong> {sub.teacherReview.editReason}
                          </div>
                        )}
                        {sub.teacherReview.teacherComment && (
                          <div>
                            <strong>Nhận xét giáo viên:</strong> {sub.teacherReview.teacherComment}
                          </div>
                        )}
                        {sub.teacherReview.independentScore !== undefined && (
                          <div>
                            <strong>Điểm độc lập (Ground-truth):</strong> {sub.teacherReview.independentScore}/10đ
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DA4 Sync Proposal Banner if available */}
                  {hasDA4Proposal && (
                    <div className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      (sub.teacherReview.status === 'Đã duyệt' || sub.teacherReview.status === 'Đã chỉnh sửa')
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60 text-purple-950 dark:text-purple-200'
                        : sub.teacherReview.status === 'Từ chối phản hồi'
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200'
                        : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-purple-600 shrink-0" />
                        <div>
                          <strong>Đề xuất đồng bộ sang DA4 (Học tập thích ứng):</strong> Đề xuất cập nhật điểm cho các đơn vị {sub.da4SyncRecommendation?.relatedUnits.join(', ')} (+5%).
                          {sub.teacherReview.status === 'Chờ duyệt' && (
                            <span className="block text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                              🔒 Đồng bộ bị khóa: Bài nộp phải được giáo viên thẩm định và phê duyệt trước khi đồng bộ sang DA4.
                            </span>
                          )}
                          {sub.teacherReview.status === 'Từ chối phản hồi' && (
                            <span className="block text-[11px] text-rose-700 dark:text-rose-400 font-semibold mt-0.5">
                              ✕ Không thể đồng bộ: Phản hồi bài nộp này đã bị từ chối phê duyệt.
                            </span>
                          )}
                        </div>
                      </div>

                      {(sub.teacherReview.status === 'Đã duyệt' || sub.teacherReview.status === 'Đã chỉnh sửa') && (
                        <button
                          onClick={() => setSyncConfirmSub(sub)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs transition shadow-sm shrink-0 flex items-center gap-1 self-start sm:self-auto"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Đồng bộ năng lực sang DA4
                        </button>
                      )}
                    </div>
                  )}

                  {isAppliedDA4 && (
                    <div className="p-2 bg-purple-100/50 dark:bg-purple-950/30 rounded-lg text-[11px] text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-purple-600" />
                      <span>Đã đồng bộ kết quả bài nộp này sang hồ sơ năng lực thích ứng DA4 lúc {sub.da4SyncRecommendation?.appliedAt}.</span>
                    </div>
                  )}

                  {/* Teacher Moderation Panel / Actions */}
                  {isEditing ? (
                    <div className="p-4 bg-white dark:bg-slate-800/90 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-4 pt-3 mt-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-indigo-600" /> Bảng Thẩm định & Quyết định của Giáo viên
                        </h5>
                        <button
                          onClick={() => setEditingSubId(null)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          ✕ Thu gọn
                        </button>
                      </div>

                      {/* Independent Grading */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 dark:text-slate-300">
                            Điểm độc lập của Giáo viên (Ground-truth 0-10):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            value={editScoreInput}
                            onChange={(e) => setEditScoreInput(parseFloat(e.target.value) || 0)}
                            className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-bold text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 dark:text-slate-300">
                            Nhận xét độc lập của Giáo viên:
                          </label>
                          <input
                            type="text"
                            value={editTeacherComment}
                            onChange={(e) => setEditTeacherComment(e.target.value)}
                            placeholder="Nhận xét riêng của giáo viên..."
                            className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs"
                          />
                        </div>
                      </div>

                      {/* Editable Feedback Fields */}
                      <div className="space-y-2 text-xs">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                          Chỉnh sửa nội dung nhận định AI (nếu chọn Sửa):
                        </label>
                        <textarea
                          value={editedAssessment}
                          onChange={(e) => setEditedAssessment(e.target.value)}
                          rows={2}
                          className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs"
                          placeholder="Nội dung nhận định..."
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editedSuggestion}
                            onChange={(e) => setEditedSuggestion(e.target.value)}
                            placeholder="Gợi ý cải thiện..."
                            className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs"
                          />
                          <input
                            type="text"
                            value={editedSocratic}
                            onChange={(e) => setEditedSocratic(e.target.value)}
                            placeholder="Câu hỏi Socratic..."
                            className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs"
                          />
                        </div>
                      </div>

                      {/* Edit Reason or Rejection Reason */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 dark:text-slate-300">Lý do chỉnh sửa (nếu có):</label>
                          <input
                            type="text"
                            value={editReasonInput}
                            onChange={(e) => setEditReasonInput(e.target.value)}
                            placeholder="Ví dụ: AI diễn giải chưa sát với trình độ THCS..."
                            className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 dark:text-slate-300">Lý do từ chối (nếu từ chối):</label>
                          <input
                            type="text"
                            value={rejectionReasonInput}
                            onChange={(e) => setRejectionReasonInput(e.target.value)}
                            placeholder="Ví dụ: AI gợi ý thư viện ngoài phạm vi chương trình..."
                            className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs"
                          />
                        </div>
                      </div>

                      {/* Critical Error Flag */}
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 space-y-2 text-xs">
                        <label className="flex items-center gap-2 font-semibold text-rose-900 dark:text-rose-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isCriticalErrorChecked}
                            onChange={(e) => setIsCriticalErrorChecked(e.target.checked)}
                            className="rounded text-rose-600 focus:ring-rose-500"
                          />
                          <span>Đánh dấu: AI phát sinh Lỗi Nghiêm Trọng (Critical Error)</span>
                        </label>
                        {isCriticalErrorChecked && (
                          <input
                            type="text"
                            value={criticalErrorInput}
                            onChange={(e) => setCriticalErrorInput(e.target.value)}
                            placeholder="Chi tiết lỗi nghiêm trọng (vd: AI hướng dẫn dùng numpy cho học sinh THCS, hoặc ảo giác tiêu chí 5)..."
                            className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-rose-300 text-xs text-rose-950 dark:text-rose-200"
                          />
                        )}
                      </div>

                      {/* Teacher Verification Label Selector */}
                      <div className="space-y-1.5 text-xs p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span>Nhãn kiểm chứng tính đúng đắn của phản hồi AI:</span>
                        </label>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {(['Đánh giá AI đúng', 'Sai lệch đã xác minh', 'Chưa đủ căn cứ'] as const).map(lbl => (
                            <button
                              key={lbl}
                              type="button"
                              onClick={() => setEditVerificationLabel(lbl)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                editVerificationLabel === lbl
                                  ? lbl === 'Đánh giá AI đúng' ? 'bg-emerald-600 text-white shadow-sm' :
                                    lbl === 'Sai lệch đã xác minh' ? 'bg-rose-600 text-white shadow-sm' : 'bg-amber-600 text-white shadow-sm'
                                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {lbl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t dark:border-slate-700">
                        {/* 1. Approve */}
                        <button
                          onClick={() => {
                            onModerateSubmission(sub.id, 'approve', {
                              status: 'Đã duyệt',
                              teacherComment: editTeacherComment || 'Đã kiểm tra và phê duyệt phản hồi AI.',
                              independentScore: editScoreInput,
                              independentComments: editTeacherComment,
                              hasCriticalError: isCriticalErrorChecked,
                              criticalErrorDetails: criticalErrorInput,
                              teacherVerificationLabel: 'Đánh giá AI đúng',
                              evidenceAccuracyVerified: true,
                              suggestionSuitabilityVerified: true
                            });
                            setEditingSubId(null);
                          }}
                          className="w-full sm:w-auto min-h-[42px] px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition shadow flex items-center justify-center gap-1.5 touch-manipulation"
                        >
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>1. Chấp nhận phản hồi AI</span>
                        </button>

                        {/* 2. Edit */}
                        <button
                          onClick={() => {
                            onModerateSubmission(sub.id, 'edit', {
                              status: 'Đã chỉnh sửa',
                              teacherComment: editTeacherComment || 'Giáo viên đã hiệu chỉnh phản hồi.',
                              editReason: editReasonInput || 'Hiệu chỉnh để phù hợp hơn với đối tượng học sinh.',
                              independentScore: editScoreInput,
                              independentComments: editTeacherComment,
                              hasCriticalError: isCriticalErrorChecked,
                              criticalErrorDetails: criticalErrorInput,
                              teacherVerificationLabel: editVerificationLabel,
                              evidenceAccuracyVerified: !isCriticalErrorChecked,
                              suggestionSuitabilityVerified: true,
                              editedFeedback: {
                                evidence: sub.aiFeedback.evidence,
                                assessment: editedAssessment,
                                suggestion: editedSuggestion,
                                socraticQuestion: editedSocratic
                              }
                            });
                            setEditingSubId(null);
                          }}
                          className="w-full sm:w-auto min-h-[42px] px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow flex items-center justify-center gap-1.5 touch-manipulation"
                        >
                          <Edit3 className="w-4 h-4 shrink-0" />
                          <span>2. Chỉnh sửa & Gửi phản hồi</span>
                        </button>

                        {/* 3. Reject */}
                        <button
                          onClick={() => {
                            onModerateSubmission(sub.id, 'reject', {
                              status: 'Từ chối phản hồi',
                              teacherComment: editTeacherComment || 'Từ chối phản hồi AI do không phù hợp.',
                              rejectionReason: rejectionReasonInput || 'Phản hồi AI không đạt chuẩn sư phạm hoặc có lỗi.',
                              independentScore: editScoreInput,
                              independentComments: editTeacherComment,
                              hasCriticalError: true,
                              criticalErrorDetails: criticalErrorInput || rejectionReasonInput,
                              teacherVerificationLabel: 'Sai lệch đã xác minh',
                              evidenceAccuracyVerified: false,
                              suggestionSuitabilityVerified: false
                            });
                            setEditingSubId(null);
                          }}
                          className="w-full sm:w-auto min-h-[42px] px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition shadow flex items-center justify-center gap-1.5 touch-manipulation"
                        >
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span>3. Từ chối phản hồi AI</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t dark:border-slate-800">
                      <div className="text-[11px] text-slate-500">
                        {sub.teacherReview.reviewedBy ? (
                          <span>Đã thẩm định bởi <strong>{sub.teacherReview.reviewedBy}</strong> ({sub.teacherReview.reviewedAt})</span>
                        ) : (
                          <span className="text-amber-600 font-semibold">⚠️ Chưa kiểm duyệt – Học sinh chưa nhận được phản hồi chính thức</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleStartReview(sub)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Thẩm định & Chấm điểm độc lập
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Student Profiles & Adaptive DA4 */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Student Selector Bar */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {Object.values(profiles).map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedStudentKey(p.id as StudentProfileId)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all shrink-0 ${
                  selectedStudentKey === p.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-xl object-cover" />
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {p.isDiagnosticCompleted ? '✓ Đã chẩn đoán' : 'Chưa chẩn đoán'} · {p.masteredUnits.length}/12 làm chủ
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Student Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <img src={currentStudent.avatar} alt={currentStudent.name} className="w-14 h-14 rounded-2xl object-cover border" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{currentStudent.name}</h3>
                    {currentStudent.isDiagnosticCompleted ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                        Đã hoàn thành chẩn đoán
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-700">
                        Dữ liệu mô phỏng – Chưa thực hiện chẩn đoán
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{currentStudent.description}</p>
                </div>
              </div>

              {/* Action Buttons for Recommendation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateStudentRecommendation(selectedStudentKey, 'Giáo viên đã duyệt', teacherNoteInput)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4" /> Duyệt đề xuất
                </button>
                <button
                  onClick={handleOpenEditPathModal}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-4 h-4" /> Sửa lộ trình
                </button>
                <button
                  onClick={() => onUpdateStudentRecommendation(selectedStudentKey, 'Tạm dừng', teacherNoteInput)}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition"
                >
                  <PauseCircle className="w-4 h-4" /> Tạm dừng
                </button>
              </div>
            </div>

            {/* Pending Proposal if exists */}
            {currentStudent.currentRecommendation.pendingProposal && (
              <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-3 text-xs">
                <div className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Có Đề xuất Lộ trình Mới từ Bài chẩn đoán Lại (Pending Proposal):
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl space-y-1">
                  <div><strong>Mức đề xuất mới:</strong> {currentStudent.currentRecommendation.pendingProposal.level}</div>
                  <div><strong>Lộ trình mới:</strong> {currentStudent.currentRecommendation.pendingProposal.path}</div>
                  <div><strong>Lý do:</strong> {currentStudent.currentRecommendation.pendingProposal.rationale}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Thời gian tạo: {currentStudent.currentRecommendation.pendingProposal.createdAt}</div>
                </div>
                {onApprovePendingProposal && (
                  <button
                    onClick={() => onApprovePendingProposal(selectedStudentKey)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-sm flex items-center gap-1.5 touch-manipulation"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Phê duyệt Đề xuất Mới (Cập nhật Lộ trình Chính thức)
                  </button>
                )}
              </div>
            )}

            {/* Path Edit History if available */}
            {currentStudent.pathEditHistory && currentStudent.pathEditHistory.length > 0 && (
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-2 text-xs">
                <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-600" /> Lịch sử Can thiệp & Điều chỉnh Lộ trình của Giáo viên ({currentStudent.pathEditHistory.length} lần):
                </div>
                <div className="space-y-1.5">
                  {currentStudent.pathEditHistory.map(rec => (
                    <div key={rec.id} className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-amber-100 dark:border-amber-900/30 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-700 dark:text-indigo-400">
                          {rec.previousLevel} ➔ {rec.updatedLevel}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">{rec.timestamp}</span>
                      </div>
                      <div className="text-slate-700 dark:text-slate-300">
                        <strong>Lộ trình điều chỉnh:</strong> {rec.updatedPath}
                      </div>
                      {rec.targetUnits && rec.targetUnits.length > 0 && (
                        <div className="text-slate-500 text-[10px]">
                          <strong>Đơn vị trọng tâm:</strong> {rec.targetUnits.join(', ')}
                        </div>
                      )}
                      <div className="text-amber-800 dark:text-amber-300">
                        <strong>Lý do sư phạm:</strong> &quot;{rec.reason}&quot; ({rec.teacherName})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Note input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ghi chú chỉ đạo của giáo viên:</label>
              <input
                type="text"
                value={teacherNoteInput}
                onChange={(e) => setTeacherNoteInput(e.target.value)}
                placeholder="Nhập ghi chú hoặc yêu cầu điều chỉnh lộ trình..."
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            {/* Mastery Grid */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Bảng điểm & Trạng thái 12 Đơn vị Kiến thức K01–K12 (DAG):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {Object.entries(currentStudent.diagnosticScores).map(([unitId, score]) => {
                  const status = getUnitMasteryStatus(unitId, currentStudent.diagnosticScores, mastery, currentStudent.isDiagnosticCompleted);
                  const isConfirmed = status === 'Đã xác nhận làm chủ';
                  return (
                    <div 
                      key={unitId} 
                      className={`p-2.5 rounded-xl border flex flex-col justify-between text-xs space-y-1 ${
                        isConfirmed 
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' 
                          : status === 'Đang luyện tập'
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                          : status === 'Chưa đủ bằng chứng'
                          ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800'
                          : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{unitId}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{score}%</span>
                      </div>
                      <div className="text-[10px] font-medium truncate text-slate-600 dark:text-slate-400" title={status}>
                        {status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b dark:border-slate-800 pb-3">
            <History className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Nhật ký Quyết định & Thao tác Sư phạm (Audit Log Minh chứng)
            </h3>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto">
            {auditLogs.map(log => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-600">{log.id}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{log.action}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px]">
                      {log.actor} ({log.role})
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{log.details}</p>
                </div>
                <span className="font-mono text-slate-400 shrink-0 text-[11px]">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Edit Student Learning Path (Sửa lộ trình học tập thích ứng) */}
      {isEditPathModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm min-w-0">
                <Edit3 className="w-4 h-4 shrink-0" />
                <span className="truncate">Can thiệp Sư phạm: Sửa Lộ trình Thích ứng</span>
              </div>
              <button 
                onClick={() => setIsEditPathModalOpen(false)} 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 shrink-0 touch-manipulation font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Học sinh: <span className="text-indigo-600 font-bold">{currentStudent.name}</span>
                </label>
                <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg leading-relaxed">
                  <strong>Hiện tại ({currentStudent.currentRecommendation.level}):</strong> {currentStudent.currentRecommendation.path}
                </div>
              </div>

              {/* Level selector */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  1. Mức phân tuyến mới do Giáo viên chỉ định:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Củng cố', 'Luyện tập', 'Vận dụng'] as const).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEditLevel(lvl)}
                      className={`py-2 px-2 sm:px-3 min-h-[40px] rounded-xl font-bold text-xs border text-center transition touch-manipulation ${
                        editLevel === lvl
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Units */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  2. Đơn vị kiến thức trọng tâm cần điều chỉnh (chọn 1 hoặc nhiều):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 max-h-28 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  {KNOWLEDGE_UNITS.map(u => {
                    const isChecked = editTargetUnits.includes(u.id);
                    return (
                      <label key={u.id} className="flex items-center gap-1.5 p-1 text-[11px] cursor-pointer hover:bg-white dark:hover:bg-slate-700 rounded touch-manipulation">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setEditTargetUnits(prev => [...prev, u.id]);
                            else setEditTargetUnits(prev => prev.filter(x => x !== u.id));
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span className="font-mono">{u.id}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Custom Path Text */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  3. Nội dung Lộ trình học tập mới (Path Description):
                </label>
                <textarea
                  value={editPathText}
                  onChange={(e) => setEditPathText(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Nhập nội dung lộ trình..."
                />
              </div>

              {/* Override Reason */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  4. Lý do Sư phạm can thiệp (Bắt buộc ghi nhận Audit Log):
                </label>
                <input
                  type="text"
                  value={editPathReason}
                  onChange={(e) => setEditPathReason(e.target.value)}
                  placeholder="Ví dụ: Học sinh thể hiện tiến bộ vượt bậc trong tiết thực hành, chuyển sang Luyện tập..."
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t dark:border-slate-800">
              <button
                onClick={() => setIsEditPathModalOpen(false)}
                className="w-full sm:w-auto min-h-[40px] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl touch-manipulation text-center"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveEditedPath}
                disabled={!editPathText.trim() || !editPathReason.trim()}
                className="w-full sm:w-auto min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-sm flex items-center justify-center gap-1.5 touch-manipulation"
              >
                <Check className="w-4 h-4" /> Lưu điều chỉnh lộ trình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Student Review Requests (Yêu cầu xem xét lại từ học sinh) */}
      {activeTab === 'reviews' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b dark:border-slate-800 pb-3">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Danh sách Yêu cầu Xem xét Lại từ Học sinh ({reviewRequests.length})
            </h3>
          </div>

          <div className="space-y-4">
            {reviewRequests.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Chưa có yêu cầu xem xét nào từ học sinh.</p>
            ) : (
              reviewRequests.map(req => (
                <div key={req.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-600">{req.id}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{req.studentName}</span>
                      <span className="text-slate-400 font-mono text-[11px]">({req.studentId})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        req.status === 'Đã chấp nhận' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'Đã điều chỉnh' ? 'bg-blue-100 text-blue-800' :
                        req.status === 'Đã từ chối' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{req.createdAt}</span>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong>Nội dung yêu cầu:</strong> {req.message}
                  </p>

                  {req.teacherResponse && (
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-950 dark:text-indigo-200 text-[11px]">
                      <strong>Phản hồi của giáo viên ({req.reviewedBy || 'Giáo viên'}):</strong> {req.teacherResponse}
                    </div>
                  )}

                  {onResolveReviewRequest && req.status === 'Chờ xử lý' && (
                    <ReviewRequestResolver req={req} onResolve={onResolveReviewRequest} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: DA4 Sync Confirmation (Xác nhận đồng bộ năng lực sang DA4) */}
      {syncConfirmSub && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
              <ArrowRightLeft className="w-5 h-5 shrink-0" /> Xác nhận Đồng bộ Năng lực sang DA4
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p>
                Hệ thống sẽ cập nhật điểm chẩn đoán và tính lại trạng thái làm chủ thích ứng cho học sinh:
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 font-mono text-[11px] leading-relaxed">
                <div><strong>Học sinh:</strong> {syncConfirmSub.studentName} ({syncConfirmSub.studentId})</div>
                <div><strong>Nhiệm vụ:</strong> {syncConfirmSub.taskTitle}</div>
                <div><strong>Đơn vị cập nhật:</strong> {syncConfirmSub.da4SyncRecommendation?.relatedUnits.join(', ')}</div>
                <div><strong>Mức tăng điểm:</strong> +5% cho mỗi đơn vị liên quan</div>
                <div><strong>Minh chứng:</strong> Bài nộp đã được giáo viên phê duyệt ({syncConfirmSub.teacherReview.status})</div>
              </div>
              <p className="text-[11px] text-slate-500 italic leading-relaxed">
                * Lưu ý: Thao tác này sẽ cập nhật điểm thích ứng DA4 nhưng bảo toàn nguồn dữ liệu gốc của học sinh.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t dark:border-slate-800">
              <button
                onClick={() => setSyncConfirmSub(null)}
                className="w-full sm:w-auto min-h-[40px] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl touch-manipulation text-center"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onApplyDA4Sync(syncConfirmSub.id);
                  setSyncConfirmSub(null);
                }}
                className="w-full sm:w-auto min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-sm flex items-center justify-center gap-1.5 touch-manipulation"
              >
                <Check className="w-4 h-4" /> Xác nhận đồng bộ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function ReviewRequestResolver({ req, onResolve }: { req: StudentReviewRequest; onResolve: (id: string, status: 'Đã chấp nhận' | 'Đã điều chỉnh' | 'Đã từ chối', resp: string) => void }) {
  const [respText, setRespText] = useState('');
  return (
    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
      <input
        type="text"
        value={respText}
        onChange={(e) => setRespText(e.target.value)}
        placeholder="Nhập nội dung phản hồi / giải quyết cho học sinh..."
        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs text-slate-900 dark:text-white"
      />
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onResolve(req.id, 'Đã chấp nhận', respText || 'Đã kiểm tra và chấp nhận yêu cầu của em.')}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold touch-manipulation"
        >
          ✓ Chấp nhận
        </button>
        <button
          onClick={() => onResolve(req.id, 'Đã điều chỉnh', respText || 'Đã kiểm tra và điều chỉnh theo yêu cầu.')}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold touch-manipulation"
        >
          ✎ Điều chỉnh
        </button>
        <button
          onClick={() => onResolve(req.id, 'Đã từ chối', respText || 'Đã xem xét nhưng kết quả hiện tại là chính xác.')}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold touch-manipulation"
        >
          ✕ Từ chối
        </button>
      </div>
    </div>
  );
}

