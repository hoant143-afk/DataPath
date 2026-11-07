import React, { useState, useEffect, useMemo } from 'react';
import { LearningTask, StudentProfileId, StudentProfile } from '../types';
import { LEARNING_TASKS, KNOWLEDGE_UNITS } from '../data/mockData';
import {
  Code,
  Play,
  Sparkles,
  RotateCcw,
  Filter,
  Target,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  FileCode,
  BookOpen
} from 'lucide-react';

interface TaskHubViewProps {
  activeStudentId: StudentProfileId;
  profiles?: Record<StudentProfileId, StudentProfile>;
  onSubmitCodeForEvaluation: (task: LearningTask, code: string, studentId: StudentProfileId) => void;
}

export const TaskHubView: React.FC<TaskHubViewProps> = ({
  activeStudentId,
  profiles,
  onSubmitCodeForEvaluation,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<LearningTask>(LEARNING_TASKS[0]);
  const [codeEditorText, setCodeEditorText] = useState<string>(LEARNING_TASKS[0].starterCode);
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [isRunningCode, setIsRunningCode] = useState(false);

  // Lấy thông tin hồ sơ học sinh hiện tại và đề xuất lộ trình DA4
  const currentStudent = profiles?.[activeStudentId];

  // Trích xuất các đơn vị kiến thức trọng tâm từ lộ trình thích ứng
  const studentFocusUnits = useMemo(() => {
    if (!currentStudent) return [];
    // 1. Kiểm tra lịch sử giáo viên sửa lộ trình gần nhất
    const latestEdit = currentStudent.pathEditHistory?.[0];
    if (latestEdit?.targetUnits && latestEdit.targetUnits.length > 0) {
      return latestEdit.targetUnits;
    }
    // 2. Trích xuất mã Kxx từ chuỗi lộ trình (path)
    const pathStr = currentStudent.currentRecommendation?.path || '';
    const matches = pathStr.match(/K\d{2}/g);
    if (matches && matches.length > 0) {
      return Array.from(new Set(matches));
    }
    // 3. Mặc định fallback theo các đơn vị dưới 50% hoặc đang cần củng cố
    const lowUnits = Object.entries(currentStudent.diagnosticScores || {})
      .filter(([_, score]) => score < 50)
      .map(([u]) => u);
    return lowUnits.length > 0 ? lowUnits : ['K01'];
  }, [currentStudent]);

  // Xác định mức độ bài tập tương ứng với mức lộ trình thích ứng DA4
  const recommendedTaskLevel = useMemo<'Cơ bản' | 'Trung bình' | 'Vận dụng'>(() => {
    const recLevel = currentStudent?.currentRecommendation?.level;
    if (recLevel === 'Củng cố') return 'Cơ bản';
    if (recLevel === 'Vận dụng') return 'Vận dụng';
    return 'Trung bình'; // Mặc định hoặc mức Luyện tập
  }, [currentStudent]);

  // Bộ lọc nhiệm vụ
  const filteredTasks = useMemo(() => {
    return LEARNING_TASKS.filter(t => {
      if (selectedUnitId !== 'all' && t.unitId !== selectedUnitId) return false;
      if (selectedLevel !== 'all' && t.level !== selectedLevel) return false;
      return true;
    });
  }, [selectedUnitId, selectedLevel]);

  // ĐỒNG BỘ BỘ LỌC VÀ NHIỆM VỤ ĐANG MỞ:
  // Nếu nhiệm vụ hiện tại không còn thuộc danh sách đã lọc, tự động chọn bài đầu tiên trong danh sách mới
  useEffect(() => {
    if (filteredTasks.length > 0) {
      const isStillInFiltered = filteredTasks.some(t => t.id === selectedTask.id);
      if (!isStillInFiltered) {
        const nextTask = filteredTasks[0];
        setSelectedTask(nextTask);
        setCodeEditorText(nextTask.starterCode);
        setConsoleOutput('');
      }
    }
  }, [filteredTasks, selectedTask.id]);

  const handleSelectTask = (task: LearningTask) => {
    setSelectedTask(task);
    setCodeEditorText(task.starterCode);
    setConsoleOutput('');
  };

  const handleResetStarterCode = () => {
    setCodeEditorText(selectedTask.starterCode);
    setConsoleOutput('Đã khôi phục mã nguồn ban đầu của nhiệm vụ.');
  };

  // Nút lọc nhanh theo lộ trình DA4 của học sinh
  const handleApplyStudentDA4Filter = () => {
    setSelectedLevel(recommendedTaskLevel);
    if (studentFocusUnits.length > 0) {
      setSelectedUnitId(studentFocusUnits[0]);
    } else {
      setSelectedUnitId('all');
    }
  };

  const handleClearFilter = () => {
    setSelectedUnitId('all');
    setSelectedLevel('all');
  };

  const handleRunSimulation = () => {
    setIsRunningCode(true);
    setConsoleOutput('Đang tổng hợp dữ liệu kiểm thử và kết quả đặc tả chuẩn...');
    setTimeout(() => {
      setIsRunningCode(false);
      const testCasesFormatted = selectedTask.testCases && selectedTask.testCases.length > 0
        ? selectedTask.testCases.map((tc, idx) => `[Test case #${idx + 1}]
- Đầu vào: ${tc.input}
- Đầu ra chuẩn: ${tc.output}`).join('\n')
        : `- Đầu vào: ${selectedTask.inputData}
- Đầu ra chuẩn: ${selectedTask.expectedOutput}`;

      setConsoleOutput(`[THAM CHIẾU ĐẶC TẢ & KẾT QUẢ KỲ VỌNG - MÔI TRƯỜNG AN TOÀN]
Nhiệm vụ: ${selectedTask.title} (Mã: ${selectedTask.id} | Đơn vị: ${selectedTask.unitId} | Mức: ${selectedTask.level})
Mục tiêu kiến thức: ${selectedTask.objective}

${testCasesFormatted}

--------------------------------------------------
ℹ️ Ghi chú phương pháp luận: Môi trường này cung cấp dữ liệu tham chiếu đặc tả để học sinh tự kiểm chứng logic. Để đánh giá sâu toàn diện theo rubric 5 tiêu chí và nhận phản hồi sư phạm Socratic từ AI, vui lòng bấm "Nộp bài & Nhận phản hồi AI".`);
    }, 350);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-xl border border-indigo-900/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
            <Code className="w-4 h-4 shrink-0" /> Ngân hàng Nhiệm vụ Lập trình DA4 & DA6
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">Thực hành & Luyện tập Lập trình Python List</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Hệ thống 36 nhiệm vụ chuẩn hóa phân bố đều qua 12 đơn vị kiến thức (K01–K12) với 3 mức độ (Cơ bản, Trung bình, Vận dụng), liên kết trực tiếp với lộ trình học tập thích ứng cá nhân.
          </p>
        </div>

        {/* Task Bank Stats Badge */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 w-full md:w-auto">
          <BookOpen className="w-6 h-6 text-indigo-300 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-white">Tổng: 36 nhiệm vụ</div>
            <div className="text-indigo-200">12 Cơ bản • 12 Trung bình • 12 Vận dụng</div>
          </div>
        </div>
      </div>

      {/* DA4 Adaptive Pathway Link Banner */}
      {currentStudent && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                {currentStudent.id}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{currentStudent.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                    Lộ trình: {currentStudent.currentRecommendation?.level || 'Luyện tập'}
                  </span>
                  {currentStudent.currentRecommendation?.status === 'Giáo viên đã sửa' && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> Giáo viên đã điều chỉnh
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  <strong>Trọng tâm DA4:</strong> {currentStudent.currentRecommendation?.path || 'Theo lộ trình'}
                  {studentFocusUnits.length > 0 && ` (Đơn vị: ${studentFocusUnits.join(', ')})`}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
              <button
                onClick={handleApplyStudentDA4Filter}
                className="w-full sm:w-auto min-h-[42px] px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 touch-manipulation"
                title="Lọc nhanh các bài tập đúng mức độ và đơn vị trọng tâm của học sinh"
              >
                <Target className="w-3.5 h-3.5 shrink-0" />
                <span>Lọc theo lộ trình DA4 ({recommendedTaskLevel})</span>
              </button>
              {(selectedUnitId !== 'all' || selectedLevel !== 'all') && (
                <button
                  onClick={handleClearFilter}
                  className="w-full sm:w-auto min-h-[42px] px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl transition-all text-center touch-manipulation"
                >
                  Xem tất cả
                </button>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="leading-relaxed">
              <strong>Bảo toàn dữ liệu & Quyền sư phạm:</strong> Mọi nhiệm vụ đều có đủ 3 mức để hỗ trợ củng cố hoặc phát triển năng lực. Quyết định điều chỉnh lộ trình của giáo viên được ưu tiên tuyệt đối mà không làm thay đổi điểm số chẩn đoán gốc.
            </span>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Đơn vị kiến thức:</span>
            </div>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="w-full sm:w-auto bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[38px] sm:min-h-0"
            >
              <option value="all">Tất cả đơn vị (K01 - K12)</option>
              {KNOWLEDGE_UNITS.map(u => (
                <option key={u.id} value={u.id}>
                  {u.code}: {u.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Mức độ:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full sm:w-auto bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[38px] sm:min-h-0"
            >
              <option value="all">Tất cả mức độ (36 bài)</option>
              <option value="Cơ bản">Cơ bản (12 bài)</option>
              <option value="Trung bình">Trung bình (12 bài)</option>
              <option value="Vận dụng">Vận dụng (12 bài)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
          Hiển thị: <strong className="text-indigo-600 dark:text-indigo-400">{filteredTasks.length}</strong> / 36 nhiệm vụ
        </div>
      </div>

      {/* Mobile Task Quick Selector (Visible only on < lg) */}
      <div className="lg:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Chọn nhiệm vụ thực hành nhanh:
          </span>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">
            {selectedTask.id} • {selectedTask.level}
          </span>
        </div>
        <select
          value={selectedTask.id}
          onChange={(e) => {
            const found = LEARNING_TASKS.find(t => t.id === e.target.value);
            if (found) handleSelectTask(found);
          }}
          className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
        >
          {filteredTasks.map(t => (
            <option key={t.id} value={t.id}>
              [{t.unitId}] {t.id} - {t.title} ({t.level})
            </option>
          ))}
        </select>
      </div>

      {/* Main Grid: Task List & Code Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: Task List (4 cols) */}
        <div className="lg:col-span-4 space-y-3 max-h-[720px] overflow-y-auto pr-1">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
              Không có nhiệm vụ nào thỏa mãn bộ lọc hiện tại. Vui lòng chọn lại bộ lọc.
            </div>
          ) : (
            filteredTasks.map(task => {
              const isSelected = selectedTask.id === task.id;
              const isRecommendedForStudent =
                studentFocusUnits.includes(task.unitId) && task.level === recommendedTaskLevel;
              const isFocusUnit = studentFocusUnits.includes(task.unitId);

              return (
                <div
                  key={task.id}
                  onClick={() => handleSelectTask(task)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {task.unitId}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-medium">
                        {task.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isRecommendedForStudent && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center gap-0.5">
                          ⭐ Đề xuất DA4
                        </span>
                      )}
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        task.level === 'Cơ bản' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' :
                        task.level === 'Trung bình' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' :
                        'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
                      }`}>
                        {task.level}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{task.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{task.objective}</p>

                  {isFocusUnit && !isRecommendedForStudent && (
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 pt-1">
                      <Target className="w-3 h-3" /> Thuộc đơn vị trọng tâm {task.unitId}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right: Code Workspace & Rubric Evaluator (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {selectedTask.id}
                </span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {selectedTask.unitId}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  selectedTask.level === 'Cơ bản' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' :
                  selectedTask.level === 'Trung bình' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' :
                  'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
                }`}>
                  Mức: {selectedTask.level}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5">{selectedTask.title}</h3>
            </div>

            <button
              onClick={handleResetStarterCode}
              className="self-start sm:self-auto text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors touch-manipulation min-h-[38px] sm:min-h-0"
              title="Đặt lại đoạn mã nguồn mẫu ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Khôi phục mã ban đầu
            </button>
          </div>

          {/* Task Requirements & Specifications */}
          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div>
              <strong className="text-slate-900 dark:text-white">Mục tiêu bài học:</strong> {selectedTask.objective}
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white">Yêu cầu cụ thể:</strong> {selectedTask.requirement}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 overflow-x-auto">
                <strong className="text-slate-900 dark:text-white block mb-1">Dữ liệu đầu vào:</strong>
                <code className="text-slate-800 dark:text-slate-200 font-mono text-[11px] whitespace-pre-wrap break-all">{selectedTask.inputData}</code>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 overflow-x-auto">
                <strong className="text-slate-900 dark:text-white block mb-1">Đầu ra mong đợi:</strong>
                <code className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px] whitespace-pre-wrap break-all">{selectedTask.expectedOutput}</code>
              </div>
            </div>

            {selectedTask.testCases && selectedTask.testCases.length > 1 && (
              <div className="text-[11px] text-slate-500 pt-1">
                Kèm <strong>{selectedTask.testCases.length} bộ test case</strong> tự động kiểm tra biên và tính đúng đắn.
              </div>
            )}
          </div>

          {/* Python Code Editor Simulator */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-indigo-500 shrink-0" /> Trình soạn thảo mã Python của học sinh
              </span>
              <span className="text-[11px] text-slate-400">
                Học sinh chỉnh sửa mã trước khi nộp để nhận phản hồi AI
              </span>
            </div>
            <textarea
              value={codeEditorText}
              onChange={(e) => setCodeEditorText(e.target.value)}
              rows={9}
              className="w-full font-mono text-xs sm:text-sm p-3.5 sm:p-4 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed shadow-inner min-w-0 overflow-x-auto whitespace-pre"
              placeholder="# Viết mã Python tại đây..."
            />
          </div>

          {/* Action Toolbar & Console Output */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
            <button
              onClick={handleRunSimulation}
              disabled={isRunningCode}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 touch-manipulation"
            >
              <Play className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isRunningCode ? 'Đang phân tích dữ liệu...' : 'Xem trước đặc tả & test cases mẫu'}</span>
            </button>

            <button
              onClick={() => onSubmitCodeForEvaluation(selectedTask, codeEditorText, activeStudentId)}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group touch-manipulation"
            >
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Nộp bài & Nhận phản hồi AI (DA6)</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>

          {consoleOutput && (
            <div className="p-3.5 sm:p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5 overflow-hidden">
              <div className="text-slate-500 font-semibold flex items-center justify-between">
                <span>Khung thông tin tham chiếu đặc tả:</span>
                <span className="text-[10px] text-slate-600">Phục vụ tự học</span>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed overflow-x-auto break-words text-[11px] sm:text-xs text-slate-300">{consoleOutput}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
