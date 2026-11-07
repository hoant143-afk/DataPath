import React, { useState } from 'react';
import { KnowledgeUnit, DiagnosticQuestion, StudentProfile, StudentProfileId, UnitMasteryStatus } from '../types';
import { KNOWLEDGE_UNITS, DIAGNOSTIC_QUESTIONS } from '../data/mockData';
import { computeMasteryMetrics, generateAdaptiveRecommendation, getUnitMasteryStatus } from '../utils/adaptiveEngine';
import { 
  CheckCircle2, AlertCircle, Compass, Brain, Layers, Award, Info, 
  Check, Sparkles, CheckCheck, AlertTriangle, HelpCircle, ArrowRight, ArrowLeft
} from 'lucide-react';

interface AdaptiveLearningViewProps {
  activeStudentId: StudentProfileId;
  setActiveStudentId: (id: StudentProfileId) => void;
  onRequestReview: (type: string, details: string) => void;
  profiles: Record<StudentProfileId, StudentProfile>;
  onCompleteDiagnostic: (
    studentId: StudentProfileId,
    scores: Record<string, number>,
    recommendation: any,
    confirmedMastered: string[],
    rawMastered: string[],
    diagnosticSource?: 'simulated_default' | 'preset_test' | 'real_test'
  ) => void;
}

export const AdaptiveLearningView: React.FC<AdaptiveLearningViewProps> = ({
  activeStudentId,
  setActiveStudentId,
  onRequestReview,
  profiles,
  onCompleteDiagnostic,
}) => {
  const currentProfile = profiles[activeStudentId];
  const [isDiagnosticMode, setIsDiagnosticMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [selectedUnit, setSelectedUnit] = useState<KnowledgeUnit | null>(null);

  // Tính toán mastery theo đồ thị DAG từ điểm số của học sinh
  const mastery = computeMasteryMetrics(currentProfile.diagnosticScores, KNOWLEDGE_UNITS);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleApplyPreset = (type: '49' | '50' | '79' | '80' | '100') => {
    let presetScores: Record<string, number> = {};

    if (type === '49') {
      // Dưới 50%: Củng cố toàn diện
      presetScores = {
        K01: 45, K02: 40, K03: 42, K04: 48,
        K05: 45, K06: 40, K07: 35, K08: 40,
        K09: 30, K10: 25, K11: 30, K12: 20
      };
    } else if (type === '50') {
      // 50% đến dưới 80%: Luyện tập (ngưỡng sàn 50%)
      presetScores = {
        K01: 85, K02: 85, K03: 80, K04: 80,
        K05: 75, K06: 50, K07: 50, K08: 50,
        K09: 60, K10: 55, K11: 65, K12: 50
      };
    } else if (type === '79') {
      // 79%: Cận trên Luyện tập (dưới 80%)
      presetScores = {
        K01: 90, K02: 90, K03: 85, K04: 85,
        K05: 80, K06: 80, K07: 80, K08: 80,
        K09: 79, K10: 79, K11: 75, K12: 70
      };
    } else if (type === '80') {
      // 80%: Ngưỡng Vận dụng khi thỏa mãn điều kiện tiên quyết
      presetScores = {
        K01: 80, K02: 80, K03: 80, K04: 80,
        K05: 80, K06: 80, K07: 80, K08: 80,
        K09: 80, K10: 80, K11: 80, K12: 80
      };
    } else {
      // 100%: Xuất sắc
      presetScores = {
        K01: 100, K02: 100, K03: 100, K04: 100,
        K05: 100, K06: 100, K07: 100, K08: 100,
        K09: 100, K10: 100, K11: 100, K12: 100
      };
    }

    const calculatedMastery = computeMasteryMetrics(presetScores, KNOWLEDGE_UNITS);
    const recommendation = generateAdaptiveRecommendation(presetScores, KNOWLEDGE_UNITS, true);

    // Preset kiểm thử nhanh: diagnosticSource = 'preset_test' (KHÔNG đánh dấu là chẩn đoán thực tế)
    onCompleteDiagnostic(
      activeStudentId,
      presetScores,
      recommendation,
      calculatedMastery.confirmedMasteredUnits,
      calculatedMastery.rawScoreUnits,
      'preset_test'
    );
    setIsDiagnosticMode(false);
  };

  const handleSubmitDiagnostic = () => {
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < DIAGNOSTIC_QUESTIONS.length) {
      alert(`Bạn chưa trả lời đủ ${DIAGNOSTIC_QUESTIONS.length} câu hỏi chẩn đoán (đã trả lời ${answeredCount}/24 câu còn thiếu ${DIAGNOSTIC_QUESTIONS.length - answeredCount} câu). Vui lòng hoàn thành tất cả các câu hỏi trước khi nộp bài.`);
      return;
    }

    // Tính điểm 12 đơn vị kiến thức từ 24 câu hỏi (mỗi đơn vị 2 câu xác nhận)
    let unitScores: Record<string, { correct: number; total: number }> = {};
    DIAGNOSTIC_QUESTIONS.forEach(q => {
      if (!unitScores[q.unitId]) unitScores[q.unitId] = { correct: 0, total: 0 };
      unitScores[q.unitId].total += 1;
      if (userAnswers[q.id] === q.correctAnswer) {
        unitScores[q.unitId].correct += 1;
      }
    });

    let calculatedScores: Record<string, number> = {};
    Object.keys(unitScores).forEach(uid => {
      const { correct, total } = unitScores[uid];
      calculatedScores[uid] = Math.round((correct / total) * 100);
    });

    const calculatedMastery = computeMasteryMetrics(calculatedScores, KNOWLEDGE_UNITS);
    const recommendation = generateAdaptiveRecommendation(calculatedScores, KNOWLEDGE_UNITS, true);

    // Nộp bài làm trắc nghiệm thật: diagnosticSource = 'real_test'
    onCompleteDiagnostic(
      activeStudentId,
      calculatedScores,
      recommendation,
      calculatedMastery.confirmedMasteredUnits,
      calculatedMastery.rawScoreUnits,
      'real_test'
    );
    setIsDiagnosticMode(false);
  };

  const answeredQuestionsCount = Object.keys(userAnswers).length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header & Student Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-6 rounded-2xl shadow-xl border border-indigo-900/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
            <Brain className="w-4 h-4 shrink-0" /> PHÂN HỆ A – HỌC TẬP THÍCH ỨNG (DA4)
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Lộ trình Thích ứng & Bản đồ Kiến thức Python List</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Chẩn đoán năng lực với 24 câu hỏi đa minh chứng (2 câu/đơn vị K), phân tích chuỗi tiên quyết theo đồ thị DAG và đề xuất lộ trình ZPD minh bạch không tuyến tính.
          </p>
        </div>

        {/* 4 Demo Profiles Selector */}
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 space-y-2 w-full md:w-auto">
          <span className="text-[11px] font-medium text-indigo-200 block">Chọn hồ sơ học sinh demo:</span>
          <div className="flex flex-wrap gap-2">
            {Object.values(profiles).map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveStudentId(p.id as StudentProfileId)}
                className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 touch-manipulation ${
                  activeStudentId === p.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
              >
                <img src={p.avatar} alt={p.name} className="w-4 h-4 rounded-full object-cover shrink-0" />
                <span>{p.id}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Student Info Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
          <img src={currentProfile.avatar} alt={currentProfile.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-md shrink-0" />
          <div className="space-y-1 w-full sm:w-auto min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">{currentProfile.name}</h2>
              {currentProfile.diagnosticSource === 'real_test' && currentProfile.isDiagnosticCompleted ? (
                <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Đã hoàn thành chẩn đoán thực tế
                </span>
              ) : currentProfile.diagnosticSource === 'preset_test' ? (
                <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" /> Dữ liệu nạp mẫu kiểm thử (Chưa chẩn đoán thực tế)
                </span>
              ) : (
                <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Dữ liệu mô phỏng có sẵn – Chưa thực hiện chẩn đoán
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{currentProfile.description}</p>
            {currentProfile.diagnosticCompletedAt && (
              <span className="text-[11px] text-slate-400 block font-mono">
                Thời gian nộp bài: {currentProfile.diagnosticCompletedAt}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={() => {
              setIsDiagnosticMode(true);
              setCurrentQuestionIndex(0);
              setUserAnswers({});
            }}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 touch-manipulation"
          >
            <Compass className="w-4 h-4 shrink-0" /> Làm bài chẩn đoán đầu vào (24 câu)
          </button>
          <button
            onClick={() => onRequestReview('adaptive', `Học sinh ${currentProfile.name} yêu cầu giáo viên xem xét lại đề xuất lộ trình thích ứng.`)}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all text-center touch-manipulation"
          >
            Yêu cầu GV xem xét
          </button>
        </div>
      </div>

      {/* Adaptive Recommendation & 5 Mastery States Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600 shrink-0" /> Đề xuất lộ trình học tập thích ứng (ZPD)
            </h3>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full self-start sm:self-auto ${
              currentProfile.currentRecommendation.level === 'Củng cố' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400' :
              currentProfile.currentRecommendation.level === 'Luyện tập' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' :
              'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
            }`}>
              Mức đề xuất: {currentProfile.currentRecommendation.level}
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
              {currentProfile.currentRecommendation.path}
            </p>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1">
              <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> Cơ sở toán học & Quy tắc sư phạm phân tuyến:
              </div>
              <p className="pl-5 leading-relaxed">{currentProfile.currentRecommendation.rationale}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 gap-1.5">
            <span>Trạng thái duyệt: <strong className="text-indigo-600">{currentProfile.currentRecommendation.status}</strong></span>
            <span className="text-[11px] sm:text-xs">Quy tắc: &lt;50% (Củng cố) | 50%–79% (Luyện tập) | &ge;80% (Vận dụng)</span>
          </div>
        </div>

        {/* Quick Diagnostic Summary Card: Phân biệt các trạng thái năng lực */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 shrink-0" /> Tiến độ & Ngưỡng làm chủ (DAG)
          </h3>

          <div className="space-y-3">
            {/* Chỉ số 1: Đạt ngưỡng điểm */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">1. Đạt ngưỡng điểm (&ge;80%):</span>
                <span className="font-bold text-slate-900 dark:text-white">{mastery.rawScoreCount} / 12 đơn vị</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(mastery.rawScoreCount / 12) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">Số đơn vị có điểm thành phần từ 80% trở lên.</p>
            </div>

            {/* Chỉ số 2: Xác nhận làm chủ năng lực */}
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-indigo-900 dark:text-indigo-200 font-semibold">2. Đã xác nhận làm chủ (Điểm + Tiên quyết):</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{mastery.confirmedMasteredCount} / 12 đơn vị</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(mastery.confirmedMasteredCount / 12) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Chỉ xác nhận khi vừa đạt &ge;80% vừa hoàn thành toàn bộ chuỗi tiên quyết DAG.
              </p>
            </div>

            {/* Cảnh báo nếu có đơn vị đạt 80% nhưng bị chặn tiên quyết */}
            {mastery.unconfirmedDueToPrereq.length > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <div className="font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Chưa đủ bằng chứng (Bị chặn tiên quyết):
                </div>
                <p className="text-[11px]">
                  {mastery.unconfirmedDueToPrereq.map(item => `${item.unitId} (chưa đạt tiên quyết: ${item.missingPrereqs.join(', ')})`).join('; ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5 Distinct Mastery Status Legend */}
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] w-full sm:w-auto">
          5 Trạng thái năng lực sư phạm:
        </span>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1 text-[11px] sm:text-xs">
            <CheckCheck className="w-3.5 h-3.5 shrink-0" /> Đã xác nhận làm chủ (&ge;80% + Tiên quyết)
          </span>
          <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold flex items-center gap-1 text-[11px] sm:text-xs">
            <Compass className="w-3.5 h-3.5 shrink-0" /> Đang luyện tập (50%–79%)
          </span>
          <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1 text-[11px] sm:text-xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Cần củng cố (&lt;50%)
          </span>
          <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-semibold flex items-center gap-1 text-[11px] sm:text-xs">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Chưa đủ bằng chứng (&ge;80% thiếu tiên quyết)
          </span>
          <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1 text-[11px] sm:text-xs">
            <HelpCircle className="w-3.5 h-3.5 shrink-0" /> Chưa được kiểm tra
          </span>
        </div>
      </div>

      {/* Knowledge Map (12 Units) */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Bản đồ 12 Đơn vị Kiến thức Python List (Phân nhánh không tuyến tính DAG)
          </h3>
          <span className="text-[11px] sm:text-xs text-slate-500">Nhấp vào một đơn vị để xem chi tiết và quan hệ tiên quyết</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {KNOWLEDGE_UNITS.map((unit) => {
            const score = currentProfile.diagnosticScores[unit.id];
            const status = getUnitMasteryStatus(unit.id, currentProfile.diagnosticScores, mastery, currentProfile.isDiagnosticCompleted);

            return (
              <div
                key={unit.id}
                onClick={() => setSelectedUnit(unit)}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4 ${
                  status === 'Đã xác nhận làm chủ' ? 'border-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-500/20' :
                  status === 'Chưa đủ bằng chứng' ? 'border-purple-300 dark:border-purple-800' :
                  status === 'Cần củng cố' ? 'border-amber-300 dark:border-amber-800' :
                  'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {unit.code}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      status === 'Đã xác nhận làm chủ' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' :
                      status === 'Đang luyện tập' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' :
                      status === 'Chưa đủ bằng chứng' ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400' :
                      status === 'Cần củng cố' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {score !== undefined ? `${score}%` : 'Chưa điểm'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{unit.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{unit.description}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Trạng thái:</span>
                    <span className={`font-semibold ${
                      status === 'Đã xác nhận làm chủ' ? 'text-emerald-600 dark:text-emerald-400' :
                      status === 'Đang luyện tập' ? 'text-blue-600 dark:text-blue-400' :
                      status === 'Chưa đủ bằng chứng' ? 'text-purple-600 dark:text-purple-400' :
                      status === 'Cần củng cố' ? 'text-amber-600 dark:text-amber-400' :
                      'text-slate-500'
                    }`}>
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Tiên quyết:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">
                      {unit.prerequisites.length > 0 ? unit.prerequisites.join(', ') : 'Không có'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diagnostic Assessment Modal with 24 Questions & Quick Palette */}
      {isDiagnosticMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl p-3.5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 max-h-[94vh] overflow-y-auto">
            <div className="flex items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
              <div className="min-w-0">
                <span className="text-[11px] sm:text-xs font-semibold text-indigo-600 uppercase tracking-wider block">
                  Bài chẩn đoán thực tế – 24 câu hỏi (2 câu / đơn vị K)
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  Câu {currentQuestionIndex + 1} / {DIAGNOSTIC_QUESTIONS.length}: Đơn vị {DIAGNOSTIC_QUESTIONS[currentQuestionIndex].unitId}
                </h3>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  {answeredQuestionsCount} / {DIAGNOSTIC_QUESTIONS.length}
                </span>
                <button
                  onClick={() => setIsDiagnosticMode(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold bg-slate-100 dark:bg-slate-800 touch-manipulation"
                  aria-label="Đóng chẩn đoán"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Testing Presets for edge case verification */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> Bộ kiểm thử nhanh các trường hợp ngưỡng (Preset Test):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('49')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 hover:bg-amber-200 transition font-medium touch-manipulation"
                >
                  Ngưỡng 49% (Củng cố)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('50')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 hover:bg-blue-200 transition font-medium touch-manipulation"
                >
                  Ngưỡng 50% (Luyện tập)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('79')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 hover:bg-blue-200 transition font-medium touch-manipulation"
                >
                  Ngưỡng 79% (Luyện tập)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('80')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 transition font-medium touch-manipulation"
                >
                  Ngưỡng 80% (Vận dụng)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('100')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 hover:bg-purple-200 transition font-medium touch-manipulation"
                >
                  100% Xuất sắc
                </button>
              </div>
            </div>

            {/* 24 Question Quick Jump Palette */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Bảng 24 câu hỏi:</span>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {DIAGNOSTIC_QUESTIONS.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIndex;
                  const isAnswered = userAnswers[q.id] !== undefined;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 text-xs font-mono font-bold rounded-lg transition touch-manipulation flex items-center justify-center ${
                        isCurrent
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                          : isAnswered
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Details */}
            <div className="space-y-3 sm:space-y-4 pt-2 border-t dark:border-slate-800">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                Nội dung kiểm tra: {DIAGNOSTIC_QUESTIONS[currentQuestionIndex].unitId}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {DIAGNOSTIC_QUESTIONS[currentQuestionIndex].question}
              </p>

              <div className="space-y-2">
                {DIAGNOSTIC_QUESTIONS[currentQuestionIndex].options.map((opt, idx) => {
                  const isSelected = userAnswers[DIAGNOSTIC_QUESTIONS[currentQuestionIndex].id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(DIAGNOSTIC_QUESTIONS[currentQuestionIndex].id, idx)}
                      className={`w-full text-left p-3 sm:p-3.5 min-h-[44px] rounded-xl text-xs font-medium transition-all border touch-manipulation ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500/30'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation & Submit Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="w-full sm:w-auto min-h-[42px] px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50 flex items-center justify-center gap-1 touch-manipulation"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Câu trước
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {currentQuestionIndex < DIAGNOSTIC_QUESTIONS.length - 1 && (
                  <button
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                    className="w-full sm:w-auto min-h-[42px] px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center justify-center gap-1 touch-manipulation"
                  >
                    <span>Câu tiếp theo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={handleSubmitDiagnostic}
                  className="w-full sm:w-auto min-h-[42px] px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center justify-center gap-1.5 touch-manipulation"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Nộp bài chẩn đoán ({answeredQuestionsCount}/24)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unit Detail Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 shrink-0">
                  {selectedUnit.code}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">{selectedUnit.title}</h3>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 shrink-0 touch-manipulation"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="text-xs sm:text-sm leading-relaxed">{selectedUnit.description}</p>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1.5 text-xs">
                <div><strong>Phân loại:</strong> {selectedUnit.category}</div>
                <div><strong>Kiến thức tiên quyết (DAG):</strong> {selectedUnit.prerequisites.join(', ') || 'Không có (Đơn vị gốc)'}</div>
                <div>
                  <strong>Điểm hiện tại:</strong>{' '}
                  <span className="font-bold text-indigo-600">
                    {currentProfile.diagnosticScores[selectedUnit.id] !== undefined
                      ? `${currentProfile.diagnosticScores[selectedUnit.id]}%`
                      : 'Chưa được kiểm tra'}
                  </span>
                </div>
                <div>
                  <strong>Trạng thái đánh giá:</strong>{' '}
                  <span className="font-bold text-emerald-600">
                    {getUnitMasteryStatus(selectedUnit.id, currentProfile.diagnosticScores, mastery, currentProfile.isDiagnosticCompleted)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUnit(null)}
                className="w-full sm:w-auto min-h-[42px] px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold touch-manipulation"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
