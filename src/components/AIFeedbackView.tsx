import React, { useState, useEffect } from 'react';
import { CodeSubmission, LearningTask, RubricCriterionScore, StudentProfileId, StudentProfile } from '../types';
import { CENTRAL_BENCHMARK_TASK, REFERENCE_PYTHON_SOLUTION, DA6_RUBRIC_SPECIFICATION } from '../data/da6BenchmarkData';
import { analyzePythonCodeStatic } from '../utils/da6Engine';
import { generateId } from '../utils/uniqueId';
import { 
  Sparkles, CheckCircle2, AlertCircle, ShieldAlert, FileText, Send, 
  HelpCircle, Code, Eye, AlertTriangle, Layers, BookOpen, Bug, CheckCircle, Terminal, Edit3, XCircle
} from 'lucide-react';

interface AIFeedbackViewProps {
  submissions: CodeSubmission[];
  selectedSubmissionId?: string;
  onAddNewSubmission: (newSub: CodeSubmission) => void;
  activeStudentId: StudentProfileId;
  profiles: Record<StudentProfileId, StudentProfile>;
}

export const AIFeedbackView: React.FC<AIFeedbackViewProps> = ({
  submissions,
  selectedSubmissionId,
  onAddNewSubmission,
  activeStudentId,
  profiles,
}) => {
  const [selectedSubId, setSelectedSubId] = useState<string>(selectedSubmissionId || submissions[0]?.id || 'SUB-DA6-01');

  useEffect(() => {
    if (selectedSubmissionId && submissions.some(s => s.id === selectedSubmissionId)) {
      setSelectedSubId(selectedSubmissionId);
    }
  }, [selectedSubmissionId, submissions]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [showReferenceSolution, setShowReferenceSolution] = useState(false);
  const [showTaskSpecModal, setShowTaskSpecModal] = useState(false);

  // Live code submission state
  const [isSubmittingLive, setIsSubmittingLive] = useState(false);
  const [liveCode, setLiveCode] = useState(
`# Bài làm: Xử lý danh sách số nguyên
n = int(input())
if n == 0:
    print("Tong: 0")
    print("So phan tu chan: 0")
    print("Danh sach rong, khong co phan tu lon nhat")
else:
    a = []
    for _ in range(n):
        a.append(int(input()))
    print(f"Tong: {sum(a)}")
    print(f"So phan tu chan: {len([x for x in a if x % 2 == 0])}")
    print(f"Phan tu lon nhat: {max(a)}")`
  );

  const selectedSubmission = submissions.find(s => s.id === selectedSubId) || submissions[0];

  // Lọc bài nộp theo 5 nhóm
  const filteredSubmissions = submissions.filter(sub => {
    if (activeCategoryFilter === 'all') return true;
    return sub.errorCategory === activeCategoryFilter;
  });

  const categoryCounts = {
    all: submissions.length,
    meeting_requirements: submissions.filter(s => s.errorCategory === 'meeting_requirements').length,
    syntax_error: submissions.filter(s => s.errorCategory === 'syntax_error').length,
    logic_error: submissions.filter(s => s.errorCategory === 'logic_error').length,
    edge_case_error: submissions.filter(s => s.errorCategory === 'edge_case_error').length,
    poor_structure: submissions.filter(s => s.errorCategory === 'poor_structure').length
  };

  const handleEvaluateLiveCode = async () => {
    setIsSubmittingLive(true);
    try {
      // Thử gọi server AI endpoint
      let evaluated;
      try {
        const res = await fetch('/api/ai/evaluate-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: liveCode,
            taskTitle: CENTRAL_BENCHMARK_TASK.title,
            taskDescription: CENTRAL_BENCHMARK_TASK.requirement,
            expectedOutput: CENTRAL_BENCHMARK_TASK.expectedOutput
          })
        });
        if (res.ok) {
          evaluated = await res.json();
        }
      } catch (e) {
        console.warn("Server AI eval fallback to static analyzer", e);
      }

      // Phân tích tĩnh chuẩn quy tắc DA6
      const staticResult = analyzePythonCodeStatic(liveCode);
      const currentStudent = profiles[activeStudentId];

      const newSub: CodeSubmission = {
        id: generateId('SUB'),
        studentId: activeStudentId,
        studentName: currentStudent?.name || `Học sinh (${activeStudentId})`,
        taskId: CENTRAL_BENCHMARK_TASK.id,
        taskTitle: CENTRAL_BENCHMARK_TASK.title,
        taskType: 'central_benchmark',
        code: liveCode,
        submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        overallScore: evaluated?.overallScore ?? staticResult.overallScore,
        criteriaScores: evaluated?.criteriaScores ?? staticResult.criteriaScores,
        aiFeedback: evaluated?.aiFeedback ?? staticResult.aiFeedback,
        errorCategory: staticResult.errorCategory,
        errorDescription: 'Bài nộp trực tiếp của người dùng qua trình biên soạn.',
        analysisType: 'static_analysis',
        detectedIssues: staticResult.detectedIssues,
        teacherReview: {
          status: 'Chờ duyệt',
          independentScore: undefined,
          reviewDurationMinutes: 1.5,
          traditionalDurationMinutes: 5.0,
          hasCriticalError: false
        },
        da4SyncRecommendation: {
          relatedUnits: ['K09', 'K10', 'K12'],
          proposedScoreDelta: { K09: 5, K10: 5, K12: 5 },
          rationale: 'Học sinh hoàn thành bài lập trình xử lý danh sách trực tiếp.'
        },
        isSimulatedData: false
      };

      onAddNewSubmission(newSub);
      setSelectedSubId(newSub.id);
    } finally {
      setIsSubmittingLive(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-xl border border-indigo-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 shrink-0" /> PHÂN HỆ B – AI FEEDBACK (DỰ ÁN 6)
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Hệ thống Phản hồi Lập trình Thông minh theo Rubric</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Phân tích cấu trúc mã nguồn Python theo Rubric 5 tiêu chí sư phạm. Phân biệt rõ phân tích tĩnh an toàn với thực thi sandbox, bảo đảm tiêu chí minh chứng quá trình không bị suy diễn sai lệch, và mọi nhận xét đều phải qua giáo viên phê duyệt.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => setShowTaskSpecModal(true)}
              className="w-full sm:w-auto min-h-[42px] px-3.5 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm touch-manipulation"
            >
              <BookOpen className="w-4 h-4 shrink-0" /> Đặc tả Bài toán Trung tâm
            </button>
            <button
              onClick={() => setShowReferenceSolution(!showReferenceSolution)}
              className="w-full sm:w-auto min-h-[42px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-700 touch-manipulation"
            >
              <Code className="w-4 h-4 text-emerald-400 shrink-0" /> {showReferenceSolution ? 'Ẩn Lời giải chuẩn' : 'Xem Lời giải chuẩn'}
            </button>
          </div>
        </div>
      </div>

      {/* Reference Solution Modal / Collapsible */}
      {showReferenceSolution && (
        <div className="bg-slate-900 text-slate-200 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle className="w-4 h-4 shrink-0" /> LỜI GIẢI THAM CHIẾU CHUẨN (REFERENCE SOLUTION) - PYTHON LIST
            </div>
            <span className="text-[11px] text-slate-400">Đạt 10/10 tất cả 4 tiêu chí kỹ thuật</span>
          </div>
          <pre className="p-3 bg-slate-950 text-emerald-300 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800 min-w-0 whitespace-pre">
            {REFERENCE_PYTHON_SOLUTION}
          </pre>
        </div>
      )}

      {/* Task Specification Modal */}
      {showTaskSpecModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800 gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2 truncate">
                <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" /> Đặc tả Nhiệm vụ Trung tâm DA6
              </h3>
              <button
                onClick={() => setShowTaskSpecModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 shrink-0 touch-manipulation font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <p><strong>Tên bài toán:</strong> {CENTRAL_BENCHMARK_TASK.title}</p>
              <p><strong>Mục tiêu:</strong> {CENTRAL_BENCHMARK_TASK.objective}</p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <strong>4 Yêu cầu bắt buộc:</strong>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Tính tổng các phần tử trong danh sách (nếu rỗng thì Tổng = 0).</li>
                  <li>Đếm số lượng phần tử chẵn trong danh sách.</li>
                  <li>Xác định phần tử lớn nhất nếu danh sách không rỗng.</li>
                  <li>Xử lý đúng trường hợp danh sách rỗng (n = 0): in &quot;Danh sach rong, khong co phan tu lon nhat&quot;.</li>
                </ol>
              </div>
              <div>
                <strong>Bộ Test Cases đối chiếu chuẩn:</strong>
                <div className="space-y-2 mt-2 font-mono text-[11px]">
                  {CENTRAL_BENCHMARK_TASK.testCases.map((tc, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
                      <div className="text-slate-500 font-sans font-semibold">Test {idx + 1}:</div>
                      <div>Input: <span className="text-indigo-600 dark:text-indigo-400">{tc.input.replace(/\n/g, ' ')}</span></div>
                      <div>Output: <span className="text-emerald-600 dark:text-emerald-400">{tc.output.replace(/\n/g, ' | ')}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Submission & Direct Tester Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-600 shrink-0" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Khu vực Nộp bài & Đánh giá Trực tiếp (Thử nghiệm bài mới)
            </h3>
          </div>
          <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium self-start sm:self-auto">
            Nhiệm vụ: {CENTRAL_BENCHMARK_TASK.title}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
              <span>Mã nguồn Python của học sinh:</span>
              <span className="text-[11px] text-slate-400 font-normal">Hỗ trợ phân tích cú pháp tĩnh & rà soát lỗi logic</span>
            </label>
            <textarea
              value={liveCode}
              onChange={(e) => setLiveCode(e.target.value)}
              rows={6}
              className="w-full font-mono text-xs sm:text-sm p-3 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-0 overflow-x-auto whitespace-pre leading-relaxed shadow-inner"
              placeholder="# Nhập mã Python..."
            />
            <button
              onClick={handleEvaluateLiveCode}
              disabled={isSubmittingLive}
              className="w-full min-h-[44px] py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow flex items-center justify-center gap-2 disabled:opacity-50 touch-manipulation"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{isSubmittingLive ? 'AI đang phân tích tĩnh và chấm điểm...' : 'Phân tích & Chấm điểm Phản hồi AI theo Rubric'}</span>
            </button>
          </div>

          <div className="lg:col-span-4 p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" /> Cam kết an toàn & Sư phạm:
            </div>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              <li><strong>Phân tích tĩnh:</strong> Không thực thi mã chưa kiểm chứng trong môi trường thật.</li>
              <li><strong>Tiêu chí 5 trung thực:</strong> Không có chú thích giải thích sẽ trả lời &quot;Chưa đủ dữ liệu đánh giá&quot;.</li>
              <li><strong>Kiểm duyệt bắt buộc:</strong> Phản hồi chỉ ở trạng thái đề xuất cho tới khi giáo viên duyệt.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 5-Category Benchmark Filter Selector */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Danh sách bài nộp & Tập mẫu kiểm thử DA6 ({submissions.length} bài):
            </span>
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/60 self-start sm:self-auto">
            DỮ LIỆU ĐỐI CHIẾU & KIỂM THỬ NGHIỆM THU
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition touch-manipulation ${
              activeCategoryFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            Tất cả ({categoryCounts.all})
          </button>
          <button
            onClick={() => setActiveCategoryFilter('meeting_requirements')}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition touch-manipulation ${
              activeCategoryFilter === 'meeting_requirements'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            1. Đạt chuẩn ({categoryCounts.meeting_requirements})
          </button>
          <button
            onClick={() => setActiveCategoryFilter('syntax_error')}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition touch-manipulation ${
              activeCategoryFilter === 'syntax_error'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            2. Lỗi cú pháp ({categoryCounts.syntax_error})
          </button>
          <button
            onClick={() => setActiveCategoryFilter('logic_error')}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition touch-manipulation ${
              activeCategoryFilter === 'logic_error'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            3. Lỗi logic ({categoryCounts.logic_error})
          </button>
          <button
            onClick={() => setActiveCategoryFilter('edge_case_error')}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition touch-manipulation ${
              activeCategoryFilter === 'edge_case_error'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            4. Lỗi biên ({categoryCounts.edge_case_error})
          </button>
          <button
            onClick={() => setActiveCategoryFilter('poor_structure')}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition touch-manipulation ${
              activeCategoryFilter === 'poor_structure'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            5. Cấu trúc kém ({categoryCounts.poor_structure})
          </button>
        </div>
      </div>

      {/* Mobile Submission Quick Selector (Visible only on < lg) */}
      <div className="lg:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" /> Chọn bài nộp xem phân tích chi tiết:
          </span>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">
            {selectedSubmission?.id}
          </span>
        </div>
        <select
          value={selectedSubId}
          onChange={(e) => setSelectedSubId(e.target.value)}
          className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
        >
          {filteredSubmissions.map(s => (
            <option key={s.id} value={s.id}>
              [{s.id}] {s.studentName} - {s.taskTitle} ({s.overallScore !== null ? `${s.overallScore}đ` : 'Chưa điểm'})
            </option>
          ))}
        </select>
      </div>

      {/* Main Submissions & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left List of Submissions (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[850px] overflow-y-auto pr-1">
          {filteredSubmissions.map(sub => {
            const isSelected = selectedSubmission?.id === sub.id;
            return (
              <div
                key={sub.id}
                onClick={() => setSelectedSubId(sub.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-500 shadow-sm ring-1 ring-indigo-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {sub.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                      {sub.studentName}
                    </span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    (sub.overallScore ?? 0) >= 8 ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600' :
                    (sub.overallScore ?? 0) >= 5 ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600' :
                    'bg-rose-50 dark:bg-rose-950/50 text-rose-600'
                  }`}>
                    {sub.overallScore !== null ? `${sub.overallScore}đ` : 'Chưa điểm'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                  <strong>Phân loại:</strong> {sub.errorDescription || sub.taskTitle}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t dark:border-slate-800">
                  <span className="text-slate-400 font-mono text-[10px]">{sub.submittedAt.slice(0, 16)}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    sub.teacherReview.status === 'Đã duyệt' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                    sub.teacherReview.status === 'Đã chỉnh sửa' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                    sub.teacherReview.status === 'Từ chối phản hồi' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' :
                    'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}>
                    {sub.teacherReview.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Details View (7 cols) */}
        {selectedSubmission && (
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
            {/* Top Info & Verification Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {selectedSubmission.id}
                  </span>
                  <span className="text-xs text-slate-500">{selectedSubmission.studentName}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {selectedSubmission.taskTitle}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedSubmission.overallScore !== null ? `${selectedSubmission.overallScore}` : '--'}
                  <span className="text-sm font-normal text-slate-400"> / 10đ</span>
                </span>
                <span className="text-[11px] text-slate-400 block">Điểm đề xuất AI</span>
              </div>
            </div>

            {/* Proposal Warning Banner if not approved */}
            {selectedSubmission.teacherReview.status === 'Chờ duyệt' ? (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
                  <div className="font-bold">BẢN ĐỀ XUẤT AI – CHƯA ĐƯỢC GIÁO VIÊN PHÊ DUYỆT</div>
                  <div className="text-[11px] text-amber-800 dark:text-amber-300">
                    Phản hồi này do mô hình/thuật toán AI tạo tự động. Giáo viên cần vào tab <strong>&quot;Kiểm duyệt Phản hồi AI&quot;</strong> để thẩm định, chỉnh sửa hoặc phê duyệt trước khi học sinh nhận được kết quả chính thức.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-0.5">
                  <div className="font-bold">ĐÃ ĐƯỢC GIÁO VIÊN PHÊ DUYỆT: {selectedSubmission.teacherReview.status}</div>
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    {selectedSubmission.teacherReview.reviewedBy ? `Người duyệt: ${selectedSubmission.teacherReview.reviewedBy}` : 'Đã thẩm định'} 
                    {selectedSubmission.teacherReview.teacherComment && ` — Nhận xét: "${selectedSubmission.teacherReview.teacherComment}"`}
                  </div>
                </div>
              </div>
            )}

            {/* Historical Audit Notice if applicable */}
            {selectedSubmission.teacherReview.historicalAuditNote && (
              <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/60 text-xs space-y-1.5 text-purple-950 dark:text-purple-200">
                <div className="font-bold flex items-center gap-1.5 text-purple-900 dark:text-purple-300">
                  <AlertTriangle className="w-4 h-4 text-purple-600" />
                  <span>Hồ sơ Kiểm toán Lịch sử: {selectedSubmission.id} ({selectedSubmission.taskTitle})</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {selectedSubmission.teacherReview.historicalAuditNote}
                </p>
                {selectedSubmission.teacherReview.reEvaluation && (
                  <div className="mt-1 pt-1.5 border-t border-purple-200/70 dark:border-purple-800/70 text-[11px] space-y-0.5">
                    <div>
                      <strong>Bản Đánh giá lại liên kết:</strong> Phiên bản <span className="font-mono font-semibold">{selectedSubmission.teacherReview.reEvaluation.version}</span> lúc {selectedSubmission.teacherReview.reEvaluation.reEvaluatedAt}.
                    </div>
                    <div>
                      <strong>Điểm sau chuẩn hóa:</strong>{' '}
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedSubmission.teacherReview.reEvaluation.newScore}/10đ</span> — {selectedSubmission.teacherReview.reEvaluation.rationale}
                    </div>
                    <div className="text-[10px] text-slate-500 italic">
                      * Điểm lịch sử gốc ({selectedSubmission.overallScore}/10đ) được bảo toàn nguyên trạng làm bằng chứng kiểm toán độc lập, không tự động ghi đè.
                    </div>
                  </div>
                )}
              </div>
            )}
            {(selectedSubmission.taskDescription || selectedSubmission.knowledgeUnitId || selectedSubmission.learningObjectives) && (
              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/80 dark:border-indigo-800/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Đặc tả nhiệm vụ: {selectedSubmission.taskId} {selectedSubmission.knowledgeUnitId ? `(${selectedSubmission.knowledgeUnitId})` : ''}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                    Đánh giá theo đặc tả riêng
                  </span>
                </div>
                {selectedSubmission.learningObjectives && (
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong>Mục tiêu:</strong> {selectedSubmission.learningObjectives}
                  </p>
                )}
                {selectedSubmission.taskDescription && (
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong>Yêu cầu:</strong> {selectedSubmission.taskDescription}
                  </p>
                )}
                {selectedSubmission.expectedOutput && (
                  <div className="pt-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    <strong>Đầu ra mong đợi:</strong> <code className="text-indigo-600 dark:text-indigo-400">{selectedSubmission.expectedOutput}</code>
                  </div>
                )}
              </div>
            )}

            {/* Static Code Analysis & Detected Issues */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-indigo-500" /> Mã nguồn đã nộp:
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  Phương thức: Phân tích tĩnh (Static Analysis)
                </span>
              </div>
              <pre className="p-3.5 bg-slate-950 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
                {selectedSubmission.code}
              </pre>

              {/* Detected issues if any */}
              {selectedSubmission.detectedIssues && selectedSubmission.detectedIssues.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Phát hiện từ Phân tích Tĩnh (Static Issues):
                  </span>
                  <div className="space-y-1">
                    {selectedSubmission.detectedIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-2 rounded-lg flex items-center gap-2 ${
                          issue.type === 'confirmed'
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
                            : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50'
                        }`}
                      >
                        <Bug className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          <strong>[{issue.type === 'confirmed' ? 'Lỗi xác nhận' : 'Nghi vấn'}]:</strong> {issue.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rubric 5 Criteria Breakdown */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                Đánh giá theo Rubric 5 Tiêu chí:
              </span>
              <div className="space-y-2">
                {selectedSubmission.criteriaScores.map(crit => {
                  const isInsufficientData = crit.level === 'Chưa đủ dữ liệu đánh giá' || crit.score === null;
                  return (
                    <div
                      key={crit.criteriaId}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Tiêu chí {crit.criteriaId}: {crit.criteriaName}
                        </span>
                        {isInsufficientData ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 self-start sm:self-auto">
                            Chưa đủ dữ liệu đánh giá
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold self-start sm:self-auto ${
                            crit.level === 'Đạt' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                            crit.level === 'Cần cố gắng' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                            'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}>
                            {crit.score} / 10đ ({crit.level})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        <strong>Bằng chứng:</strong> {crit.evidence}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Teacher Rejection Alert if applicable */}
            {selectedSubmission.teacherReview.status === 'Từ chối phản hồi' && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs uppercase">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" /> PHẢN HỒI AI ĐÃ BỊ GIÁO VIÊN TỪ CHỐI
                </div>
                <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                  <strong>Lý do từ chối:</strong> {selectedSubmission.teacherReview.rejectionReason || 'Giáo viên đánh giá phản hồi AI không phù hợp hoặc ngoài phạm vi chương trình.'}
                </p>
              </div>
            )}

            {/* Teacher Edited Feedback if present - Official Feedback for Student */}
            {selectedSubmission.teacherReview.editedFeedback && (
              <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> PHẢN HỒI CHÍNH THỨC DÀNH CHO HỌC SINH
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 self-start sm:self-auto">
                    Giáo viên đã hiệu chỉnh & phê duyệt
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-800 dark:text-slate-200">
                  <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg">
                    <strong className="text-blue-700 dark:text-blue-400">1. Bằng chứng mã nguồn:</strong>{' '}
                    {selectedSubmission.teacherReview.editedFeedback.evidence}
                  </div>
                  <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg">
                    <strong className="text-blue-700 dark:text-blue-400">2. Nhận định sư phạm:</strong>{' '}
                    {selectedSubmission.teacherReview.editedFeedback.assessment}
                  </div>
                  <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg">
                    <strong className="text-blue-700 dark:text-blue-400">3. Gợi ý hành động:</strong>{' '}
                    {selectedSubmission.teacherReview.editedFeedback.suggestion}
                  </div>
                  <div className="p-2.5 bg-blue-100/60 dark:bg-blue-900/60 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-100">
                    <strong>4. Câu hỏi khơi gợi Socratic (Học sinh tự sửa):</strong>{' '}
                    <em>&quot;{selectedSubmission.teacherReview.editedFeedback.socraticQuestion}&quot;</em>
                  </div>
                </div>
              </div>
            )}

            {/* Structured 4-Component Pedagogical AI Feedback (Original Proposal) */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              selectedSubmission.teacherReview.editedFeedback 
                ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-90' 
                : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/60'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />{' '}
                  {selectedSubmission.teacherReview.editedFeedback 
                    ? 'Đề xuất Phản hồi Gốc của AI (Bản sơ bộ trước khi giáo viên biên tập)' 
                    : 'Cấu trúc Phản hồi AI Sư phạm (4 Thành phần)'}
                </div>
                {selectedSubmission.teacherReview.editedFeedback && (
                  <span className="text-[10px] text-slate-500 font-mono self-start sm:self-auto">Bản gốc AI đề xuất</span>
                )}
              </div>
              <div className="space-y-2 text-xs text-slate-800 dark:text-slate-200">
                <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg">
                  <strong className="text-indigo-700 dark:text-indigo-400">1. Bằng chứng mã nguồn:</strong>{' '}
                  {selectedSubmission.aiFeedback.evidence}
                </div>
                <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg">
                  <strong className="text-indigo-700 dark:text-indigo-400">2. Nhận định sư phạm:</strong>{' '}
                  {selectedSubmission.aiFeedback.assessment}
                </div>
                <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg">
                  <strong className="text-indigo-700 dark:text-indigo-400">3. Gợi ý hành động:</strong>{' '}
                  {selectedSubmission.aiFeedback.suggestion}
                </div>
                <div className="p-2.5 bg-indigo-100/60 dark:bg-indigo-900/60 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100">
                  <strong>4. Câu hỏi khơi gợi Socratic (Học sinh tự sửa):</strong>{' '}
                  <em>&quot;{selectedSubmission.aiFeedback.socraticQuestion}&quot;</em>
                </div>
              </div>
            </div>

            {/* DA4 Sync Bridge Proposal */}
            {selectedSubmission.da4SyncRecommendation && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-900/50 text-xs text-purple-950 dark:text-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <strong>Liên kết DA4 (Học tập thích ứng):</strong> Đề xuất cập nhật năng lực{' '}
                  {selectedSubmission.da4SyncRecommendation.relatedUnits.join(', ')} ({selectedSubmission.da4SyncRecommendation.rationale})
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 shrink-0">
                  Cần giáo viên duyệt tại Dashboard
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
