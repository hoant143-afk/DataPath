import React, { useState } from 'react';
import { CodeSubmission, StudentProfile, AuditLogEntry } from '../types';
import { SAMPLE_SUBMISSIONS, AUDIT_LOGS, DEMO_STUDENT_PROFILES, CENTRAL_BENCHMARK_TASK, DA6_RUBRIC_SPECIFICATION } from '../data/mockData';
import { calculateDA6ResearchMetrics } from '../utils/da6Engine';
import { 
  BarChart3, Download, Award, Sparkles, CheckCircle2, AlertCircle, 
  Cpu, TrendingUp, Clock, AlertTriangle, Layers, FileJson, ShieldCheck, Check,
  UserCheck, Database, FlaskConical, HelpCircle, XCircle, Info, ShieldAlert
} from 'lucide-react';

interface ResearchDashboardViewProps {
  submissions?: CodeSubmission[];
  profiles?: Record<string, StudentProfile>;
  auditLogs?: AuditLogEntry[];
}

export const ResearchDashboardView: React.FC<ResearchDashboardViewProps> = ({
  submissions = SAMPLE_SUBMISSIONS,
  profiles = DEMO_STUDENT_PROFILES,
  auditLogs = AUDIT_LOGS
}) => {
  const [dataViewMode, setDataViewMode] = useState<'acceptance_testing' | 'benchmark'>('benchmark');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Nhóm 1: Chỉ số Học tập Thích ứng (DA4)
  const profileList = Object.values(profiles);
  const totalStudents = profileList.length;

  const studentAvgs = profileList.map(p => {
    const scores = Object.values(p.diagnosticScores);
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  });

  // Tỷ lệ tuân thủ quy tắc thuật toán lý thuyết
  let ruleConsistentCount = 0;
  profileList.forEach((p, idx) => {
    const avg = studentAvgs[idx];
    const recLevel = p.currentRecommendation.level;
    if (avg < 50 && recLevel === 'Củng cố') ruleConsistentCount++;
    else if (avg >= 50 && avg < 80 && recLevel === 'Luyện tập') ruleConsistentCount++;
    else if (avg >= 80 && recLevel === 'Vận dụng') ruleConsistentCount++;
  });
  const ruleConsistencyRate = totalStudents > 0 ? Math.round((ruleConsistentCount / totalStudents) * 1000) / 10 : 0;

  // Đo lường độ tương thích chuyên gia độc lập: Chỉ tính trên các hồ sơ đã có nhãn/phán quyết từ giáo viên
  const reviewedProfiles = profileList.filter(p => 
    p.currentRecommendation.status === 'Giáo viên đã duyệt' || 
    p.currentRecommendation.status === 'Giáo viên đã sửa'
  );
  const alignedWithExpertCount = reviewedProfiles.filter(p => p.currentRecommendation.status === 'Giáo viên đã duyệt').length;
  const expertAlignmentRate = reviewedProfiles.length > 0 
    ? Math.round((alignedWithExpertCount / reviewedProfiles.length) * 1000) / 10 
    : null;

  const diagnosedCount = profileList.filter(p => p.diagnosticSource === 'real_test' && p.isDiagnosticCompleted).length;

  // Phân biệt rõ số lần can thiệp lộ trình (DA4) và số lượt kiểm duyệt phản hồi (DA6)
  const da4PathInterventions = auditLogs.filter(l => 
    l.action.includes('lộ trình') || l.action.includes('Can thiệp')
  ).length;

  const da6ModerationReviews = auditLogs.filter(l => 
    l.action.includes('Kiểm duyệt') || l.action.includes('Từ chối phản hồi') || 
    l.action.includes('Phê duyệt phản hồi') || l.action.includes('Chỉnh sửa phản hồi')
  ).length;

  const maxAvg = studentAvgs.length > 0 ? Math.max(...studentAvgs) : 0;
  const minAvg = studentAvgs.length > 0 ? Math.min(...studentAvgs) : 0;
  // Độ phân tán đầu vào tính bằng hiệu điểm trung bình, đơn vị: điểm phần trăm (% điểm)
  const profileDisparityIndex = Math.round((maxAvg - minAvg) * 10) / 10;

  // Nhóm 2: Phân loại dữ liệu DA6 theo 3 nguồn chuẩn mực
  const benchmarkSubmissions = submissions.filter(s => s.isSyntheticResearchSample || s.isSimulatedData || s.datasetOrigin === 'benchmark_standard');
  const acceptanceSubmissions = submissions.filter(s => !s.isSyntheticResearchSample && !s.isSimulatedData);

  const benchmarkMetrics = calculateDA6ResearchMetrics(benchmarkSubmissions);
  const acceptanceMetrics = calculateDA6ResearchMetrics(acceptanceSubmissions);

  const currentMetrics = dataViewMode === 'acceptance_testing' ? acceptanceMetrics : benchmarkMetrics;

  const handleExportEvidence = () => {
    setIsExporting(true);
    setExportSuccessMessage(null);

    const fullDataset = {
      researchTitle: 'DataPath AI - Báo cáo Dữ liệu Kiểm toán & Đối chiếu Nghiên cứu Giáo dục (DA4 & DA6)',
      exportedAt: new Date().toISOString(),
      datasetClassification: dataViewMode === 'acceptance_testing' 
        ? 'BÀI NỘP PHÁT SINH TRONG QUÁ TRÌNH NGHIỆM THU (KIỂM THỬ HỒ SƠ DEMO HS01-HS04 - KHÔNG PHẢI DỮ LIỆU HỌC SINH THẬT)' 
        : 'BỘ MẪU BENCHMARK CHUẨN HÓA (15 BÀI ĐÁNH GIÁ THUẬT TOÁN K12)',
      scientificIntegrityNotice: 'Các lượt nộp từ hồ sơ demo chỉ dùng để kiểm thử ứng dụng, tuyệt đối không được coi là bằng chứng về hiệu quả trên học sinh thật khi chưa có nghiên cứu người học thực tế được phê duyệt.',
      centralBenchmarkTask: CENTRAL_BENCHMARK_TASK,
      rubricSpecification: DA6_RUBRIC_SPECIFICATION,
      metricsCalculated: currentMetrics,
      da4Calculations: {
        expertAlignmentRate: expertAlignmentRate !== null ? `${expertAlignmentRate}%` : 'Chưa đủ căn cứ xác lập ground-truth độc lập',
        profileDisparityIndex: `${profileDisparityIndex} điểm phần trăm`,
        maxStudentAverage: Math.round(maxAvg * 10) / 10,
        minStudentAverage: Math.round(minAvg * 10) / 10,
        diagnosedRealCount: diagnosedCount,
        da4PathInterventionsCount: da4PathInterventions,
        da6ModerationReviewsCount: da6ModerationReviews
      },
      submissionsSample: dataViewMode === 'acceptance_testing' ? acceptanceSubmissions : benchmarkSubmissions,
      studentProfiles: profiles,
      auditLogs: auditLogs
    };

    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullDataset, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `DataPathAI_${dataViewMode}_AuditEvidence_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setExportSuccessMessage(`Đã xuất khẩu tệp dữ liệu minh chứng kiểm toán JSON thành công!`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportSuccessMessage(null), 5000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-xl border border-indigo-900/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
            <BarChart3 className="w-4 h-4 shrink-0" /> DASHBOARD KIỂM TOÁN VÀ MINH CHỨNG NGHIÊN CỨU SƯ PHẠM (DA4 & DA6)
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">Chỉ số Khoa học Giáo dục & Đối chiếu Thẩm định AI</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Hệ thống phân tách rõ ràng giữa ba nguồn dữ liệu: Bộ benchmark chuẩn hóa, bài nộp phát sinh trong nghiệm thu và nghiên cứu người học thực tế. Đo lường độc lập tính hội tụ điểm số, tỷ lệ xác nhận bằng chứng và thời gian mô phỏng.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={handleExportEvidence}
            disabled={isExporting}
            className="w-full sm:w-auto min-h-[42px] px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all touch-manipulation"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{isExporting ? 'Đang đóng gói...' : 'Xuất minh chứng JSON'}</span>
          </button>
        </div>
      </div>

      {/* Cảnh báo rõ ràng giới hạn lưu trữ dữ liệu & bảo mật */}
      <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-start gap-2.5 text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 dark:text-slate-200">Giới hạn bảo mật lưu trữ:</strong> Dữ liệu hiện được lưu trữ trong bộ nhớ cục bộ trình duyệt (LocalStorage) kết hợp phân quyền RBAC và kiểm tra máy chủ nội bộ. Dữ liệu chưa đồng bộ cơ sở dữ liệu Firebase Firestore đám mây. Quyền truy cập các chức năng quản lý và xuất dữ liệu được bảo vệ bởi phiên làm việc giáo viên/quản trị viên đã xác thực.
        </div>
      </div>

      {exportSuccessMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportSuccessMessage}</span>
        </div>
      )}

      {/* Chuẩn hóa phân loại 3 nguồn dữ liệu nghiên cứu */}
      <div className="p-3.5 sm:p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/60 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" /> Chuẩn mực Phân loại Dữ liệu & Đạo đức Nghiên cứu:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/60 dark:border-amber-800/40 space-y-1">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> 1. Benchmark chuẩn hóa
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              15 bài mẫu đại diện 5 nhóm lỗi kiểm thử thuật toán xử lý mảng K12. Đã kiểm duyệt và gắn ground-truth.
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/60 dark:border-amber-800/40 space-y-1">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 2. Dữ liệu kiểm thử nghiệm thu
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Bài nộp phát sinh trong quá trình kiểm thử với hồ sơ demo (SUB-4673, SUB-7157, SUB-2130, T01–T02). <em>Không coi là bằng chứng trên học sinh thật.</em>
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/60 dark:border-amber-800/40 space-y-1">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 3. Nghiên cứu người học thực tế
            </div>
            <p className="text-[11px] text-slate-500 italic leading-relaxed">
              <strong>Chưa có dữ liệu:</strong> Cần xác nhận nguồn thu thập, quy trình nghiên cứu có đối chứng (IRB) trên người học thật trước khi công bố hiệu quả.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Selection Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-3.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Database className="w-4 h-4 text-indigo-600 shrink-0" /> Nguồn dữ liệu hiển thị phân tích:
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setDataViewMode('benchmark')}
            className={`px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 touch-manipulation ${
              dataViewMode === 'benchmark'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 shrink-0" /> Bộ mẫu benchmark (15 bài DA6)
          </button>
          <button
            onClick={() => setDataViewMode('acceptance_testing')}
            className={`px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 touch-manipulation ${
              dataViewMode === 'acceptance_testing'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 shrink-0" /> Bài nộp nghiệm thu ({acceptanceSubmissions.length} bài)
          </button>
        </div>
      </div>

      {/* Two Metric Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Group 1: Adaptive Learning Metrics (DA4) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Nhóm 1: Chỉ số Học tập Thích ứng (DA4)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">4 Hồ sơ HS01–HS04</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Độ tương thích chuyên gia / giáo viên */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Độ tương thích chuyên gia độc lập (DA4)</span>
              {expertAlignmentRate !== null ? (
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {expertAlignmentRate}%
                </div>
              ) : (
                <div className="text-xs font-bold text-amber-600 py-1">
                  Chưa đủ căn cứ xác lập ground-truth độc lập
                </div>
              )}
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {reviewedProfiles.length > 0 
                  ? `Đã thẩm định: ${reviewedProfiles.length}/${totalStudents} hồ sơ. Tỷ lệ khớp quy tắc hệ thống: ${ruleConsistencyRate}%.`
                  : `Tỷ lệ khớp quy tắc thuật toán: ${ruleConsistencyRate}%. Cần giáo viên độc lập duyệt hoặc sửa lộ trình để xác lập ground-truth.`}
              </p>
            </div>

            {/* 2. Hồ sơ hoàn thành chẩn đoán */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Học sinh hoàn thành chẩn đoán thực tế</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {diagnosedCount} / {totalStudents} HS
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Phân biệt bài làm thật với dữ liệu mô phỏng mặc định
              </p>
            </div>

            {/* 3. Tách bạch số lần can thiệp lộ trình và kiểm duyệt phản hồi */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Giáo viên can thiệp lộ trình DA4</span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {da4PathInterventions} lần
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Sửa/đổi mức lộ trình (Tách biệt với {da6ModerationReviews} lượt kiểm duyệt phản hồi DA6)
              </p>
            </div>

            {/* 4. Khoảng phân tán điểm đầu vào theo điểm phần trăm */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Độ phân tán điểm đầu vào (Score Gap)</span>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {profileDisparityIndex} điểm phần trăm
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Hiệu số TB: Max {Math.round(maxAvg * 10) / 10}% - Min {Math.round(minAvg * 10) / 10}% = {profileDisparityIndex} điểm phần trăm (% điểm).
              </p>
            </div>
          </div>
        </div>

        {/* Group 2: Dynamic AI Feedback Metrics (DA6) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Nhóm 2: Chỉ số Phản hồi Thông minh AI (DA6)
              </h3>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
              dataViewMode === 'benchmark'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300'
                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
            }`}>
              {dataViewMode === 'benchmark' ? '[BỘ MẪU BENCHMARK 15 BÀI]' : '[BÀI NỘP PHÁT SINH NGHIỆM THU]'}
            </span>
          </div>

          <div className="space-y-4">
            {/* 5 Chuẩn chỉ số DA6 được tách bạch minh bạch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Tương đồng điểm số AI – Giáo viên */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    1. Tương đồng điểm số AI – GV:
                  </span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {currentMetrics.scoreConcordanceRate !== null ? `${currentMetrics.scoreConcordanceRate}%` : 'Chưa đủ DL'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Tử số: {currentMetrics.scoreConcordanceNumerator} bài (|Δ điểm| ≤ 1.0) / Mẫu số: {currentMetrics.scoreConcordanceDenominator} bài có Ground-truth
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  * Giới hạn: Hai điểm tổng bằng nhau không đồng nghĩa với đồng thuận về chất lượng phản hồi định tính.
                </p>
              </div>

              {/* 2. Tỷ lệ phản hồi được GV chấp nhận hoặc chỉnh sửa */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    2. Tỷ lệ Chấp nhận / Chỉnh sửa:
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {currentMetrics.approvalOrEditRate !== null ? `${currentMetrics.approvalOrEditRate}%` : '--'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Tử số: {currentMetrics.approvalOrEditNumerator} bài (Duyệt + Sửa) / Mẫu số: {currentMetrics.approvalOrEditDenominator} bài đã thẩm định
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  * Phản ánh tỷ lệ đề xuất AI có giá trị sử dụng sư phạm (kể cả khi cần giáo viên tinh chỉnh).
                </p>
              </div>

              {/* 3. Tỷ lệ phản hồi bị từ chối */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    3. Tỷ lệ phản hồi bị từ chối:
                  </span>
                  <span className={`text-sm font-bold ${
                    (currentMetrics.rejectionRate || 0) > 0 ? 'text-rose-600' : 'text-slate-500'
                  }`}>
                    {currentMetrics.rejectionRate !== null ? `${currentMetrics.rejectionRate}%` : '--'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Tử số: {currentMetrics.rejectionNumerator} bài bị từ chối / Mẫu số: {currentMetrics.rejectionDenominator} bài đã thẩm định
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  * Tần suất phản hồi AI bị bác bỏ hoàn toàn do sai lệch nặng hoặc ngoài chương trình.
                </p>
              </div>

              {/* 4. Tỷ lệ bằng chứng được giáo viên xác nhận chính xác */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    4. Bằng chứng được xác nhận:
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {currentMetrics.verifiedEvidenceRate !== null ? `${currentMetrics.verifiedEvidenceRate}%` : '--'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Tử số: {currentMetrics.verifiedEvidenceNumerator} bài chuẩn xác / Mẫu số: {currentMetrics.verifiedEvidenceDenominator} bài đã thẩm định
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  * Trích dẫn từ khóa cú pháp đạt {currentMetrics.rawEvidenceCitationRate}%, nhưng tính đúng đắn phải do giáo viên thẩm định.
                </p>
              </div>

              {/* 5. Tỷ lệ gợi ý hành động được giáo viên đánh giá phù hợp */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    5. Gợi ý hành động được GV đánh giá phù hợp:
                  </span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {currentMetrics.suitableSuggestionRate !== null ? `${currentMetrics.suitableSuggestionRate}%` : '--'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Tử số: {currentMetrics.suitableSuggestionNumerator} bài phù hợp / Mẫu số: {currentMetrics.suitableSuggestionDenominator} bài đã thẩm định
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  * Đo lường tính khả thi của các bước sửa lỗi và câu hỏi Socratic khơi gợi do AI đề xuất.
                </p>
              </div>
            </div>

            {/* Chuẩn hóa thống kê thời gian: Thời gian giả định phục vụ mô phỏng */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200/50 dark:border-indigo-900/50 pb-2">
                <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" /> Thời gian giả định phục vụ mô phỏng (Simulation Timing):
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                  Thông số giả định mô phỏng sư phạm
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-700 dark:text-slate-300 text-[11px] pt-1">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-400 text-[10px]">Chấm thủ công (Giả định):</div>
                  <div className="font-bold text-base text-slate-800 dark:text-slate-200">
                    5,0 phút / bài
                  </div>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-400 text-[10px]">Kiểm duyệt có AI hỗ trợ (Giả định):</div>
                  <div className="font-bold text-base text-indigo-600 dark:text-indigo-400">
                    1,5 phút / bài (Tiết kiệm ~70%)
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
                ⚠️ <strong>Cảnh báo phương pháp luận:</strong> Giá trị 5,0 phút/bài và 1,5 phút/bài là thông số giả định phục vụ mô hình hóa kinh tế thời gian sư phạm, <em>KHÔNG CÔNG BỐ là kết quả nghiên cứu thực tế</em> khi chưa triển khai nhật ký bấm giờ từng phiên kiểm duyệt độc lập trên giáo viên thật.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Category Breakdown Table - Đồng bộ linh hoạt theo từng tập dữ liệu */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Phân tích Định lượng theo 5 Nhóm Bài kiểm thử ({dataViewMode === 'benchmark' ? 'Bộ mẫu 15 bài Benchmark K12' : 'Bài nộp Phát sinh trong Nghiệm thu'})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 self-start sm:self-auto">
            Tổng cộng: {currentMetrics.totalSubmissions} bài ({dataViewMode === 'benchmark' ? 'Benchmark' : 'Nghiệm thu'})
          </span>
        </div>

        <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
          <table className="w-full text-xs text-left min-w-[620px]">
            <thead>
              <tr className="border-b dark:border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Nhóm bài kiểm thử</th>
                <th className="py-2.5 px-3 font-semibold text-center">Số bài</th>
                <th className="py-2.5 px-3 font-semibold text-center">Đã thẩm định</th>
                <th className="py-2.5 px-3 font-semibold text-center">Điểm AI trung bình</th>
                <th className="py-2.5 px-3 font-semibold">Đặc trưng nhận diện ({dataViewMode === 'benchmark' ? 'Theo đặc tả K12' : 'Theo nhiệm vụ thực tế'})</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {currentMetrics.categoryStats.map(cat => (
                <tr key={cat.category} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">{cat.label}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{cat.total}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-indigo-600 font-bold">{cat.reviewed}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded ${
                      cat.avgScore >= 8 ? 'bg-emerald-50 text-emerald-600' :
                      cat.avgScore >= 5 ? 'bg-amber-50 text-amber-600' :
                      cat.total === 0 ? 'bg-slate-100 text-slate-400' :
                      'bg-rose-50 text-rose-600'
                    }`}>
                      {cat.total > 0 ? `${cat.avgScore} / 10đ` : '--'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {cat.categoryDescription}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
