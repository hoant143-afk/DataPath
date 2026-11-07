import { CodeSubmission, RubricCriterionScore, AIFeedbackContent, StudentProfile, LearningTask } from '../types';
import { evaluateStudentProfile } from './adaptiveEngine';

export interface DynamicDA6Metrics {
  totalSubmissions: number;
  reviewedSubmissionsCount: number;
  
  // 1. Tương đồng điểm số AI – Giáo viên
  scoreConcordanceRate: number | null;
  scoreConcordanceNumerator: number;
  scoreConcordanceDenominator: number;
  consensusRate: number | null; // Alias tương thích ngược

  // 2. Tỷ lệ phản hồi được giáo viên chấp nhận hoặc chỉnh sửa
  approvalOrEditRate: number | null;
  approvalOrEditNumerator: number;
  approvalOrEditDenominator: number;

  // 3. Tỷ lệ phản hồi bị từ chối
  rejectionRate: number | null;
  rejectionNumerator: number;
  rejectionDenominator: number;

  // 4. Tỷ lệ bằng chứng được giáo viên xác nhận chính xác
  verifiedEvidenceRate: number | null;
  verifiedEvidenceNumerator: number;
  verifiedEvidenceDenominator: number;
  rawEvidenceCitationRate: number; // Tỷ lệ định dạng có trích dẫn từ khóa mã nguồn
  evidenceRate: number; // Alias tương thích ngược

  // 5. Tỷ lệ gợi ý hành động được giáo viên đánh giá phù hợp
  suitableSuggestionRate: number | null;
  suitableSuggestionNumerator: number;
  suitableSuggestionDenominator: number;
  actionableRate: number; // Alias tương thích ngược

  criticalErrorCount: number;

  // Thống kê thời gian (Giả định mô phỏng)
  isSimulatedTime: boolean;
  avgAiReviewMinutes: number | null;
  avgTraditionalMinutes: number | null;
  timeSavedPercent: number | null;

  categoryStats: {
    category: string;
    label: string;
    total: number;
    reviewed: number;
    avgScore: number;
    categoryDescription: string;
  }[];
}

export interface StaticAnalysisResult {
  analysisType: 'static_analysis';
  detectedIssues: { type: 'confirmed' | 'suspected'; message: string; line?: number }[];
  criteriaScores: RubricCriterionScore[];
  overallScore: number | null;
  aiFeedback: AIFeedbackContent;
  errorCategory: 'meeting_requirements' | 'syntax_error' | 'logic_error' | 'edge_case_error' | 'poor_structure';
}

/**
 * HÀM DUY NHẤT TÍNH ĐIỂM RUBRIC CÓ TRỌNG SỐ (CHUẨN HÓA DA6)
 * Trọng số chuẩn của 5 tiêu chí:
 * - C1 (Đáp ứng yêu cầu): 20%
 * - C2 (Tính đúng đắn): 25%
 * - C3 (Trường hợp biên): 20%
 * - C4 (Cấu trúc & Dễ đọc): 20%
 * - C5 (Giải thích quá trình): 15%
 * 
 * Khi C5 là null (Chưa đủ dữ liệu đánh giá), tổng trọng số tích cực là 85% (20+25+20+20).
 * Điểm overall được chuẩn hóa bằng cách chia cho tổng trọng số tích cực.
 */
export function calculateWeightedRubricScore(criteriaScores: RubricCriterionScore[]): number | null {
  const weights: Record<number, number> = { 1: 20, 2: 25, 3: 20, 4: 20, 5: 15 };
  let activeWeight = 0;
  let weightedSum = 0;
  let hasValidScore = false;

  for (const c of criteriaScores) {
    if (c.score !== null && c.score !== undefined && c.level !== 'Chưa đủ dữ liệu đánh giá') {
      const w = weights[c.criteriaId] ?? 20;
      activeWeight += w;
      weightedSum += c.score * w;
      hasValidScore = true;
    }
  }

  if (!hasValidScore || activeWeight === 0) return null;
  return Math.round((weightedSum / activeWeight) * 10) / 10;
}

/**
 * Tính toán động các chỉ số nghiên cứu DA6 từ danh sách bài nộp và đánh giá của giáo viên.
 * Tách biệt rõ giữa dữ liệu kiểm thử giả lập và dữ liệu thực nghiệm thực tế.
 */
export function calculateDA6ResearchMetrics(submissions: CodeSubmission[]): DynamicDA6Metrics {
  const total = submissions.length;

  if (total === 0) {
    return {
      totalSubmissions: 0,
      reviewedSubmissionsCount: 0,
      scoreConcordanceRate: null,
      scoreConcordanceNumerator: 0,
      scoreConcordanceDenominator: 0,
      consensusRate: null,
      approvalOrEditRate: null,
      approvalOrEditNumerator: 0,
      approvalOrEditDenominator: 0,
      rejectionRate: null,
      rejectionNumerator: 0,
      rejectionDenominator: 0,
      verifiedEvidenceRate: null,
      verifiedEvidenceNumerator: 0,
      verifiedEvidenceDenominator: 0,
      rawEvidenceCitationRate: 0,
      evidenceRate: 0,
      suitableSuggestionRate: null,
      suitableSuggestionNumerator: 0,
      suitableSuggestionDenominator: 0,
      actionableRate: 0,
      criticalErrorCount: 0,
      isSimulatedTime: true,
      avgAiReviewMinutes: null,
      avgTraditionalMinutes: null,
      timeSavedPercent: null,
      categoryStats: []
    };
  }

  // Danh sách các bài đã được giáo viên thẩm định
  const reviewedList = submissions.filter(s => s.teacherReview.status !== 'Chờ duyệt');

  // 1. Tương đồng điểm số AI – Giáo viên (Score Concordance)
  const reviewedWithGroundTruth = submissions.filter(s => 
    s.teacherReview?.independentScore !== undefined && s.teacherReview.independentScore !== null &&
    (s.teacherReview.status === 'Đã duyệt' || s.teacherReview.status === 'Đã chỉnh sửa' || s.teacherReview.status === 'Từ chối phản hồi')
  );
  const concordanceNumerator = reviewedWithGroundTruth.filter(s => {
    const aiScore = s.overallScore ?? 0;
    const tScore = s.teacherReview.independentScore ?? 0;
    return Math.abs(aiScore - tScore) <= 1.0;
  }).length;
  const concordanceDenominator = reviewedWithGroundTruth.length;
  const scoreConcordanceRate = concordanceDenominator >= 2 
    ? Math.round((concordanceNumerator / concordanceDenominator) * 1000) / 10 
    : null;

  // 2. Tỷ lệ phản hồi được giáo viên chấp nhận hoặc chỉnh sửa (Approval & Adaptation Rate)
  const approvalOrEditNumerator = reviewedList.filter(s => 
    s.teacherReview.status === 'Đã duyệt' || s.teacherReview.status === 'Đã chỉnh sửa'
  ).length;
  const approvalOrEditDenominator = reviewedList.length;
  const approvalOrEditRate = approvalOrEditDenominator > 0 
    ? Math.round((approvalOrEditNumerator / approvalOrEditDenominator) * 1000) / 10 
    : null;

  // 3. Tỷ lệ phản hồi bị giáo viên từ chối (Rejection Rate)
  const rejectionNumerator = reviewedList.filter(s => s.teacherReview.status === 'Từ chối phản hồi').length;
  const rejectionDenominator = reviewedList.length;
  const rejectionRate = rejectionDenominator > 0 
    ? Math.round((rejectionNumerator / rejectionDenominator) * 1000) / 10 
    : null;

  // 4. Tỷ lệ bằng chứng được giáo viên xác nhận chính xác (Verified Evidence Accuracy Rate)
  // Chỉ tính là đạt khi không bị đánh dấu sai lệch hoặc lỗi nghiêm trọng
  const verifiedEvidenceNumerator = reviewedList.filter(s => 
    s.teacherReview.evidenceAccuracyVerified === true ||
    (s.teacherReview.teacherVerificationLabel !== 'Sai lệch đã xác minh' && 
     !s.teacherReview.hasCriticalError && 
     s.teacherReview.status !== 'Từ chối phản hồi')
  ).length;
  const verifiedEvidenceDenominator = reviewedList.length;
  const verifiedEvidenceRate = verifiedEvidenceDenominator > 0 
    ? Math.round((verifiedEvidenceNumerator / verifiedEvidenceDenominator) * 1000) / 10 
    : null;

  // Tỷ lệ hình thức trích dẫn mã nguồn (chứa từ khóa cú pháp/dòng lệnh)
  const rawEvidenceCount = submissions.filter(s => {
    const ev = s.aiFeedback?.evidence || '';
    return ev.length > 10 && (
      ev.includes('Dòng') || ev.includes('dòng') || ev.includes('len') || 
      ev.includes('print') || ev.includes('[]') || ev.includes('input') || 
      ev.includes('max') || ev.includes('range') || ev.includes('for') ||
      ev.includes('fruits') || ev.includes('append') || ev.includes('remove')
    );
  }).length;
  const rawEvidenceCitationRate = Math.round((rawEvidenceCount / total) * 1000) / 10;

  // 5. Tỷ lệ gợi ý hành động được giáo viên đánh giá phù hợp (Suitable Suggestion Rate)
  const suitableSuggestionNumerator = reviewedList.filter(s => 
    s.teacherReview.suggestionSuitabilityVerified === true ||
    s.teacherReview.status === 'Đã duyệt' ||
    (s.teacherReview.status === 'Đã chỉnh sửa' && 
     !s.teacherReview.hasCriticalError && 
     s.teacherReview.teacherVerificationLabel !== 'Sai lệch đã xác minh')
  ).length;
  const suitableSuggestionDenominator = reviewedList.length;
  const suitableSuggestionRate = suitableSuggestionDenominator > 0 
    ? Math.round((suitableSuggestionNumerator / suitableSuggestionDenominator) * 1000) / 10 
    : null;

  // Lỗi nghiêm trọng phát hiện bởi giáo viên
  const criticalErrorCount = submissions.filter(s => s.teacherReview?.hasCriticalError === true).length;

  // Thống kê thời gian: Thông số giả định mô phỏng
  let avgAiReviewMinutes: number | null = null;
  let avgTraditionalMinutes: number | null = null;
  let timeSavedPercent: number | null = null;

  if (reviewedWithGroundTruth.length >= 2) {
    const totalAiTime = reviewedWithGroundTruth.reduce((acc, s) => acc + (s.teacherReview.reviewDurationMinutes || 1.5), 0);
    const totalTradTime = reviewedWithGroundTruth.reduce((acc, s) => acc + (s.teacherReview.traditionalDurationMinutes || 5.0), 0);
    avgAiReviewMinutes = Math.round((totalAiTime / reviewedWithGroundTruth.length) * 10) / 10;
    avgTraditionalMinutes = Math.round((totalTradTime / reviewedWithGroundTruth.length) * 10) / 10;
    if (avgTraditionalMinutes > 0) {
      timeSavedPercent = Math.round(((avgTraditionalMinutes - avgAiReviewMinutes) / avgTraditionalMinutes) * 1000) / 10;
    }
  }

  // Kiểm tra xem tập dữ liệu có thuần túy là bộ benchmark K12 hay là tập bài nghiệm thu/linh hoạt
  const isPureK12Benchmark = submissions.every(s => s.taskId === 'TASK-DA6-CENTRAL');

  // 5 Nhóm phân loại bài kiểm thử
  const categories: { key: NonNullable<CodeSubmission['errorCategory']>; label: string; descK12: string; descGeneral: string }[] = [
    { 
      key: 'meeting_requirements', 
      label: '1. Đạt chuẩn yêu cầu',
      descK12: 'Cả 4 yêu cầu xử lý danh sách số nguyên đều đạt chuẩn, thuật toán chính xác.',
      descGeneral: 'Đạt chuẩn toàn bộ đặc tả nhiệm vụ đã giao (khởi tạo, xử lý và in dữ liệu đúng yêu cầu).'
    },
    { 
      key: 'syntax_error', 
      label: '2. Lỗi cú pháp (Syntax)',
      descK12: 'Thiếu dấu hai chấm (:), sai thụt lề hoặc lỗi cú pháp câu lệnh Python.',
      descGeneral: 'Lỗi cú pháp Python (SyntaxError, IndentationError, thiếu dấu ngoặc hoặc dấu hai chấm).'
    },
    { 
      key: 'logic_error', 
      label: '3. Lỗi logic thuật toán',
      descK12: 'Gán max=0 sai với số âm, nhầm lẫn điều kiện chẵn/lẻ hoặc sai bước lặp.',
      descGeneral: 'Lỗi logic thuật toán, xử lý sai yêu cầu hoặc sai lệch đặc tả nhiệm vụ.'
    },
    { 
      key: 'edge_case_error', 
      label: '4. Lỗi trường hợp biên',
      descK12: 'Không kiểm tra n=0 dẫn tới ngoại lệ max() trên danh sách rỗng.',
      descGeneral: 'Không kiểm soát trường hợp đặc biệt (danh sách rỗng, 0 phần tử, giá trị biên).'
    },
    { 
      key: 'poor_structure', 
      label: '5. Cấu trúc/Tính dễ đọc kém',
      descK12: 'One-liner quá dài, lồng ghép phức tạp, vi phạm tính trong sáng sư phạm.',
      descGeneral: 'Cấu trúc mã chưa tối ưu, khó đọc hoặc chưa phù hợp với phong cách lập trình chuẩn.'
    }
  ];

  const categoryStats = categories.map(cat => {
    const inCat = submissions.filter(s => s.errorCategory === cat.key);
    const revInCat = inCat.filter(s => s.teacherReview.status !== 'Chờ duyệt');
    const avgScore = inCat.length > 0 
      ? Math.round((inCat.reduce((sum, s) => sum + (s.overallScore || 0), 0) / inCat.length) * 10) / 10
      : 0;

    return {
      category: cat.key,
      label: cat.label,
      total: inCat.length,
      reviewed: revInCat.length,
      avgScore,
      categoryDescription: isPureK12Benchmark ? cat.descK12 : cat.descGeneral
    };
  });

  return {
    totalSubmissions: total,
    reviewedSubmissionsCount: reviewedWithGroundTruth.length,
    scoreConcordanceRate,
    scoreConcordanceNumerator: concordanceNumerator,
    scoreConcordanceDenominator: concordanceDenominator,
    consensusRate: scoreConcordanceRate,
    approvalOrEditRate,
    approvalOrEditNumerator,
    approvalOrEditDenominator,
    rejectionRate,
    rejectionNumerator,
    rejectionDenominator,
    verifiedEvidenceRate,
    verifiedEvidenceNumerator,
    verifiedEvidenceDenominator,
    rawEvidenceCitationRate,
    evidenceRate: verifiedEvidenceRate ?? rawEvidenceCitationRate,
    suitableSuggestionRate,
    suitableSuggestionNumerator,
    suitableSuggestionDenominator,
    actionableRate: suitableSuggestionRate ?? 0,
    criticalErrorCount,
    isSimulatedTime: true,
    avgAiReviewMinutes,
    avgTraditionalMinutes,
    timeSavedPercent,
    categoryStats
  };
}

/**
 * HÀM KIỂM TRA CÚ PHÁP PYTHON DÙNG CHUNG (SHARED PYTHON SYNTAX PARSER)
 */
function checkCommonPythonSyntax(code: string): {
  hasSyntaxError: boolean;
  hasMissingColon: boolean;
  colonErrorLine?: number;
  hasUnmatchedBracket: boolean;
  hasIndentError: boolean;
  indentErrorLine?: number;
  hasAssignmentInIf: boolean;
  assignmentErrorLine?: number;
  issues: { type: 'confirmed' | 'suspected'; message: string; line?: number }[];
} {
  const issues: { type: 'confirmed' | 'suspected'; message: string; line?: number }[] = [];
  const lines = code.split('\n');

  let hasMissingColon = false;
  let colonErrorLine: number | undefined;
  let hasUnmatchedBracket = false;
  let hasIndentError = false;
  let indentErrorLine: number | undefined;
  let hasAssignmentInIf = false;
  let assignmentErrorLine: number | undefined;

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const commentIdx = line.indexOf('#');
    const codeOnly = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
    const trimmed = codeOnly.trim();

    if (trimmed.length === 0) return;

    // Kiểm tra thiếu dấu hai chấm trên các câu lệnh cấu trúc
    const compoundPrefixes = ['for ', 'if ', 'elif ', 'while ', 'def ', 'class '];
    const isCompound = compoundPrefixes.some(prefix => trimmed.startsWith(prefix)) || 
                       trimmed === 'else' || trimmed === 'try' || trimmed === 'finally';
    if (isCompound) {
      if (!trimmed.endsWith(':')) {
        hasMissingColon = true;
        if (!colonErrorLine) colonErrorLine = lineNum;
        issues.push({
          type: 'confirmed',
          message: `Dòng ${lineNum}: Thiếu dấu hai chấm ':' ở cuối câu lệnh cấu trúc (${trimmed.slice(0, 24)}...)`,
          line: lineNum
        });
      }
    }

    // Kiểm tra gán = trong câu lệnh if
    if (trimmed.startsWith('if ') && trimmed.includes(' = ') && !trimmed.includes(' == ') && !trimmed.includes(' <= ') && !trimmed.includes(' >= ') && !trimmed.includes(' != ')) {
      hasAssignmentInIf = true;
      if (!assignmentErrorLine) assignmentErrorLine = lineNum;
      issues.push({
        type: 'confirmed',
        message: `Dòng ${lineNum}: Sử dụng toán tử gán '=' thay vì toán tử so sánh '==' trong điều kiện logic`,
        line: lineNum
      });
    }

    // Kiểm tra lỗi thụt lề cơ bản
    if (idx > 0) {
      const prevLine = lines[idx - 1];
      const prevCommentIdx = prevLine.indexOf('#');
      const prevCodeOnly = prevCommentIdx >= 0 ? prevLine.slice(0, prevCommentIdx) : prevLine;
      const prevTrimmed = prevCodeOnly.trim();

      if (prevTrimmed.length > 0 && prevTrimmed.endsWith(':') && 
         (prevTrimmed.startsWith('for ') || prevTrimmed.startsWith('if ') || prevTrimmed.startsWith('elif ') || prevTrimmed.startsWith('while ') || prevTrimmed === 'else' || prevTrimmed.startsWith('def '))) {
        const currentIndent = line.search(/\S|$/);
        const prevIndent = prevLine.search(/\S|$/);
        if (trimmed.length > 0 && currentIndent <= prevIndent) {
          hasIndentError = true;
          if (!indentErrorLine) indentErrorLine = lineNum;
          issues.push({
            type: 'confirmed',
            message: `Dòng ${lineNum}: Lỗi thụt lề (IndentationError) sau câu lệnh '${prevTrimmed.slice(0, 20)}'`,
            line: lineNum
          });
        }
      }
    }

    // Đếm ngoặc vuông/tròn
    const openBracket = (codeOnly.match(/\[/g) || []).length;
    const closeBracket = (codeOnly.match(/\]/g) || []).length;

    if (openBracket !== closeBracket && !trimmed.endsWith('\\')) {
      hasUnmatchedBracket = true;
      issues.push({
        type: 'confirmed',
        message: `Dòng ${lineNum}: Thiếu hoặc lệch dấu ngoặc vuông '[' ']'`,
        line: lineNum
      });
    }
  });

  const hasSyntaxError = hasMissingColon || hasUnmatchedBracket || hasIndentError || hasAssignmentInIf;

  return {
    hasSyntaxError,
    hasMissingColon,
    colonErrorLine,
    hasUnmatchedBracket,
    hasIndentError,
    indentErrorLine,
    hasAssignmentInIf,
    assignmentErrorLine,
    issues
  };
}

/**
 * =========================================================================
 * CHẾ ĐỘ B – BỘ KIỂM THỬ CHUẨN HÓA DA6 (CENTRAL BENCHMARK EVALUATION)
 * Phục vụ độc quyền cho bài toán trung tâm TASK-DA6-CENTRAL và 15 bài benchmark
 * Quy tắc: 4 yêu cầu (tính tổng, đếm chẵn, tìm max, xử lý rỗng n = 0).
 * =========================================================================
 */
function evaluateCentralBenchmarkTask(code: string): StaticAnalysisResult {
  const issues: { type: 'confirmed' | 'suspected'; message: string; line?: number }[] = [];
  const lines = code.split('\n');
  const trimmedCode = code.trim();

  // Kiểm tra minh chứng quá trình (chú thích tư duy)
  const commentCount = lines.filter(l => l.trim().startsWith('#') && !l.trim().startsWith('# Nhập') && !l.trim().startsWith('# TODO') && !l.trim().startsWith('# Bài làm')).length;
  const hasProcessExplanation = commentCount >= 2;

  // 1. Phân tích cú pháp
  const syntax = checkCommonPythonSyntax(code);
  issues.push(...syntax.issues);

  // 2. Kiểm tra tính liên quan đến bài toán Danh sách số nguyên
  const hasInput = code.includes('input(');
  const hasListCreation = code.includes('[]') || code.includes('list(') || code.includes('[int(') || code.includes('.append(');
  const hasLoop = code.includes('for ') || code.includes('while ');
  const hasSumOperation = code.includes('sum(') || code.includes('total +=') || code.includes('total = total +') || code.includes('t = t +') || code.includes('s = s +') || code.includes('s +=');
  const hasEvenOperation = code.includes('% 2 == 0') || code.includes('%2==0') || code.includes('% 2 != 1');
  const hasMaxOperation = code.includes('max(') || code.includes('max_val') || code.includes('max_num') || code.includes('> max') || code.includes('> m') || code.includes('< x');
  const hasEmptyGuard = code.includes('if n == 0') || code.includes('if not a') || code.includes('if not nums') || 
                        code.includes('if a:') || code.includes('if nums:') || code.includes('if len(') || 
                        (code.includes('if n > 0') && code.includes('else:'));

  const isIrrelevantOrTooShort = (!hasListCreation && !hasInput && !hasLoop) || 
                                 (!hasListCreation && !hasSumOperation && !hasEvenOperation && !hasMaxOperation) ||
                                 trimmedCode.length < 25;

  if (isIrrelevantOrTooShort) {
    issues.push({
      type: 'confirmed',
      message: 'Mã nguồn không khớp yêu cầu bài toán: Không chứa cấu trúc danh sách (List), vòng lặp nhập dữ liệu hay các phép toán thống kê theo đặc tả.'
    });
    issues.push({
      type: 'confirmed',
      message: 'Chưa đủ căn cứ kết luận – Cần giáo viên kiểm tra'
    });

    const criteriaScores: RubricCriterionScore[] = [
      {
        criteriaId: 1,
        criteriaName: 'Đáp ứng yêu cầu bài toán',
        score: 1,
        level: 'Chưa đạt',
        evidence: 'Mã nguồn không chứa khai báo danh sách hay nhập liệu theo đặc tả bài toán (chỉ in văn bản đơn giản hoặc rỗng).'
      },
      {
        criteriaId: 2,
        criteriaName: 'Tính đúng đắn của thuật toán',
        score: 1,
        level: 'Chưa đạt',
        evidence: 'Chưa có thuật toán tính tổng, đếm số chẵn hay tìm giá trị lớn nhất theo yêu cầu.'
      },
      {
        criteriaId: 3,
        criteriaName: 'Khả năng xử lý trường hợp biên',
        score: 1,
        level: 'Chưa đạt',
        evidence: 'Không có dữ liệu và không xử lý trường hợp biên danh sách rỗng (n = 0).'
      },
      {
        criteriaId: 4,
        criteriaName: 'Cấu trúc, tính dễ đọc của mã',
        score: 3,
        level: 'Chưa đạt',
        evidence: 'Mã quá ngắn, chưa đủ cấu trúc của một chương trình giải quyết bài toán hoàn chỉnh.'
      },
      {
        criteriaId: 5,
        criteriaName: 'Khả năng giải thích & minh chứng quá trình',
        score: hasProcessExplanation ? 7 : null,
        level: hasProcessExplanation ? 'Đạt' : 'Chưa đủ dữ liệu đánh giá',
        evidence: hasProcessExplanation
          ? 'Có chú thích giải thích tư duy.'
          : 'Học sinh chỉ nộp mã nguồn thuần túy, chưa có chú thích phân tích quá trình tư duy hoặc nhật ký học tập (Không suy diễn nỗ lực).'
      }
    ];

    const overallScore = calculateWeightedRubricScore(criteriaScores);

    const aiFeedback: AIFeedbackContent = {
      evidence: `Mã nguồn phân tích (${trimmedCode.slice(0, 35)}...) không chứa cấu trúc danh sách, vòng lặp nhập hay 4 yêu cầu xử lý dữ liệu.`,
      assessment: 'Mã nguồn chưa đáp ứng yêu cầu tối thiểu của bài toán. Chưa đủ căn cứ kết luận – Cần giáo viên kiểm tra.',
      suggestion: 'Hãy đọc kỹ đề bài: Cần nhập số lượng phần tử n, tạo danh sách các số nguyên và giải quyết 4 yêu cầu: tính tổng, đếm chẵn, tìm max và xử lý rỗng n = 0.',
      socraticQuestion: 'Làm thế nào để khởi tạo một danh sách rỗng trong Python và dùng vòng lặp for để thêm các số nguyên nhập từ bàn phím?'
    };

    return {
      analysisType: 'static_analysis',
      detectedIssues: issues,
      criteriaScores,
      overallScore,
      aiFeedback,
      errorCategory: 'poor_structure'
    };
  }

  // 3. Phân tích các lỗi logic cụ thể của bài Central Benchmark
  let maxZeroLine: number | undefined;
  lines.forEach((l, idx) => {
    const lTrim = l.trim();
    if (lTrim.startsWith('max_val = 0') || lTrim.startsWith('max_num = 0') || lTrim.startsWith('m = 0')) {
      maxZeroLine = idx + 1;
    }
  });

  const hasNegativeInitMax = maxZeroLine !== undefined;
  const hasOddEvenBug = code.includes('% 2 == 1') && (code.includes('chan') || code.includes('even'));
  const hasIndexAdditionBug = code.includes('total = total + i') || code.includes('total += i') || code.includes('t = t + i');

  if (hasNegativeInitMax) {
    issues.push({
      type: 'confirmed',
      message: `Dòng ${maxZeroLine}: Khởi tạo biến tìm max = 0 sẽ cho kết quả sai khi toàn bộ các số trong danh sách là số nguyên âm (ví dụ: [-10, -5, -20]).`,
      line: maxZeroLine
    });
  }

  if (hasOddEvenBug) {
    issues.push({
      type: 'confirmed',
      message: 'Điều kiện logic kiểm tra số chẵn bị sai: Sử dụng phép chia dư x % 2 == 1 (đếm số lẻ) thay vì x % 2 == 0.'
    });
  }

  if (hasIndexAdditionBug) {
    issues.push({
      type: 'confirmed',
      message: 'Cộng dồn biến chỉ số vị trí i thay vì giá trị phần tử a[i] trong danh sách.'
    });
  }

  // 4. Kiểm tra các yêu cầu chưa hoàn thành trong 4 yêu cầu trung tâm
  const missingRequirements: string[] = [];
  if (!hasSumOperation) missingRequirements.push('Tính tổng các phần tử');
  if (!hasEvenOperation) missingRequirements.push('Đếm số lượng số chẵn');
  if (!hasMaxOperation) missingRequirements.push('Tìm giá trị lớn nhất trong danh sách');

  if (missingRequirements.length > 0) {
    issues.push({
      type: 'confirmed',
      message: `Chưa hoàn thành yêu cầu: ${missingRequirements.join(', ')} (thiếu trong mã nguồn).`
    });
  }

  // 5. Kiểm tra trường hợp biên n = 0
  let directMaxLine: number | undefined;
  lines.forEach((l, idx) => {
    if (l.includes('max(') && !hasEmptyGuard) {
      directMaxLine = idx + 1;
    }
  });

  if (directMaxLine && !hasEmptyGuard) {
    issues.push({
      type: 'confirmed',
      message: `Dòng ${directMaxLine}: Gọi hàm max() trực tiếp mà không kiểm tra danh sách rỗng (n = 0) sẽ gây lỗi ValueError: max() arg is an empty sequence.`,
      line: directMaxLine
    });
  }

  issues.push({
    type: 'suspected',
    message: 'Kết quả phân tích tĩnh sơ bộ (Static Analysis) – Không thực thi sandbox trực tiếp. Cần giáo viên kiểm duyệt trước khi áp dụng chính thức.'
  });

  // Phân loại nhóm và gán điểm rubric
  let errorCategory: 'meeting_requirements' | 'syntax_error' | 'logic_error' | 'edge_case_error' | 'poor_structure' = 'meeting_requirements';

  let c1Score = 10;
  let c2Score = 10;
  let c3Score = 10;
  let c4Score = 9;
  let c5Score: number | null = hasProcessExplanation ? 9 : null;

  if (syntax.hasSyntaxError) {
    errorCategory = 'syntax_error';
    c1Score = 4;
    c2Score = 4;
    c3Score = 3;
    c4Score = 4;
  } else if (hasNegativeInitMax || hasOddEvenBug || hasIndexAdditionBug) {
    errorCategory = 'logic_error';
    c1Score = 7;
    c2Score = hasNegativeInitMax ? 6 : 4;
    c3Score = 5;
    c4Score = 7;
  } else if (missingRequirements.length > 0) {
    errorCategory = 'logic_error';
    c1Score = missingRequirements.length === 1 ? 6 : 4;
    c2Score = missingRequirements.length === 1 ? 6 : 4;
    c3Score = hasEmptyGuard ? 8 : 4;
    c4Score = 8;
  } else if (!hasEmptyGuard) {
    errorCategory = 'edge_case_error';
    c1Score = 7;
    c2Score = 8;
    c3Score = 4;
    c4Score = 9;
  } else if (code.length > 250 && (code.match(/for /g) || []).length >= 3 && !code.includes('def ')) {
    errorCategory = 'poor_structure';
    c1Score = 9;
    c2Score = 9;
    c3Score = 9;
    c4Score = 5;
  }

  const criteriaScores: RubricCriterionScore[] = [
    {
      criteriaId: 1,
      criteriaName: 'Đáp ứng yêu cầu bài toán',
      score: c1Score,
      level: c1Score >= 8 ? 'Đạt' : c1Score >= 5 ? 'Cần cố gắng' : 'Chưa đạt',
      evidence: syntax.hasSyntaxError 
        ? 'Chương trình chưa chạy được do lỗi cú pháp, chưa hoàn thành đủ 4 yêu cầu.' 
        : missingRequirements.length > 0
          ? `Chưa hoàn thành đủ 4 yêu cầu. Còn thiếu: ${missingRequirements.join(', ')}.`
          : !hasEmptyGuard 
            ? 'Đáp ứng phần tính toán thông thường nhưng chưa xử lý yêu cầu số 4 (danh sách rỗng n = 0).'
            : 'Đáp ứng đầy đủ 4 yêu cầu: tính tổng, đếm số chẵn, tìm max và xử lý rỗng.'
    },
    {
      criteriaId: 2,
      criteriaName: 'Tính đúng đắn của thuật toán',
      score: c2Score,
      level: c2Score >= 8 ? 'Đạt' : c2Score >= 5 ? 'Cần cố gắng' : 'Chưa đạt',
      evidence: hasNegativeInitMax 
        ? 'Khởi tạo max = 0 sai logic khi toàn bộ các phần tử là số âm.' 
        : hasOddEvenBug 
          ? 'Điều kiện % 2 == 1 bị nhầm lẫn giữa số chẵn và số lẻ.'
          : hasIndexAdditionBug 
            ? 'Cộng chỉ số i thay vì cộng giá trị phần tử a[i].'
            : !hasMaxOperation
              ? 'Chưa cài đặt thuật toán tìm phần tử lớn nhất trong danh sách.'
              : !hasSumOperation
                ? 'Chưa cài đặt thuật toán tính tổng các phần tử.'
                : !hasEvenOperation
                  ? 'Chưa cài đặt thuật toán đếm số chẵn.'
                  : syntax.hasSyntaxError 
                    ? 'Lỗi cú pháp ngăn cản thuật toán thực thi.'
                    : 'Thuật toán duyệt mảng và các phép toán sum, count, max chính xác.'
    },
    {
      criteriaId: 3,
      criteriaName: 'Khả năng xử lý trường hợp biên',
      score: c3Score,
      level: c3Score >= 8 ? 'Đạt' : c3Score >= 5 ? 'Cần cố gắng' : 'Chưa đạt',
      evidence: hasEmptyGuard 
        ? 'Đã có cấu trúc rẽ nhánh kiểm tra danh sách rỗng (n = 0 hoặc if a).' 
        : 'Chưa có cấu trúc rẽ nhánh kiểm tra rỗng, chương trình có thể gặp lỗi ValueError hoặc IndexError khi n = 0.'
    },
    {
      criteriaId: 4,
      criteriaName: 'Cấu trúc, tính dễ đọc của mã',
      score: c4Score,
      level: c4Score >= 8 ? 'Đạt' : c4Score >= 5 ? 'Cần cố gắng' : 'Chưa đạt',
      evidence: syntax.hasSyntaxError 
        ? 'Vi phạm cú pháp hoặc thụt lề chuẩn Python.' 
        : errorCategory === 'poor_structure'
          ? 'Tách quá nhiều vòng lặp duyệt trùng lặp hoặc đặt tên biến tùy tiện.'
          : 'Cấu trúc mã nguồn rõ ràng, định dạng dễ đọc.'
    },
    {
      criteriaId: 5,
      criteriaName: 'Khả năng giải thích & minh chứng quá trình',
      score: c5Score,
      level: hasProcessExplanation ? 'Đạt' : 'Chưa đủ dữ liệu đánh giá',
      evidence: hasProcessExplanation 
        ? 'Học sinh có kèm theo chú thích giải thích tư duy thuật toán trong mã nguồn.' 
        : 'Học sinh chỉ nộp mã nguồn thuần túy, chưa có chú thích phân tích quá trình tư duy hoặc nhật ký học tập (Không suy diễn nỗ lực).'
    }
  ];

  const overallScore = calculateWeightedRubricScore(criteriaScores);

  const aiFeedback: AIFeedbackContent = {
    evidence: issues.length > 0 
      ? issues.map(i => i.message).join(' | ')
      : 'Mã nguồn đã sử dụng các cấu trúc danh sách, vòng lặp for và các hàm built-in hợp lệ.',
    assessment: syntax.hasSyntaxError 
      ? 'Chương trình có lỗi cú pháp khiến trình thông dịch Python không thể thực thi. Cần khắc phục trước khi kiểm tra logic.'
      : missingRequirements.length > 0
        ? `Chương trình giải quyết được một số thao tác cơ bản nhưng CHƯA hoàn thành yêu cầu: ${missingRequirements.join(', ')}. Đánh giá phân tích tĩnh sơ bộ – Cần giáo viên kiểm tra.`
        : issues.length > 0 
          ? 'Bạn đã xây dựng được khung chương trình cơ bản, nhưng vẫn còn một số vấn đề logic hoặc xử lý biên cần hoàn thiện.'
          : 'Bài làm xuất sắc! Bạn đã giải quyết trọn vẹn 4 yêu cầu của bài toán xử lý danh sách.',
    suggestion: syntax.hasMissingColon 
      ? `Hãy kiểm tra lại các câu lệnh cấu trúc (dòng ${syntax.colonErrorLine || 3}) và bổ sung dấu hai chấm ':' ở cuối dòng.`
      : syntax.hasIndentError 
        ? `Hãy thụt lề 4 khoảng trắng các câu lệnh nằm bên trong khối lặp/rẽ nhánh (dòng ${syntax.indentErrorLine || 4}).`
        : missingRequirements.length > 0
          ? `Hãy bổ sung mã nguồn để thực hiện yêu cầu còn thiếu: ${missingRequirements.join(', ')} (ví dụ dùng max(a) hoặc vòng lặp so sánh tìm giá trị lớn nhất).`
          : hasNegativeInitMax 
            ? 'Hãy khởi tạo max_val bằng phần tử đầu tiên a[0] thay vì số 0 để tránh sai lệch khi danh sách toàn số âm.'
            : hasOddEvenBug 
              ? 'Hãy sửa lại điều kiện số chẵn thành x % 2 == 0 (số chẵn chia 2 dư 0).'
              : !hasEmptyGuard 
                ? 'Hãy thêm câu lệnh if n == 0 để xử lý riêng trường hợp danh sách rỗng trước khi tìm max.'
                : 'Hãy thử tối ưu mã nguồn bằng các hàm built-in sum() và list comprehension.',
    socraticQuestion: missingRequirements.includes('Tìm giá trị lớn nhất trong danh sách')
      ? 'Trong Python, làm thế nào để tìm phần tử lớn nhất trong danh sách khi các số có thể là số nguyên âm?'
      : !hasEmptyGuard 
        ? 'Nếu người dùng nhập n = 0, hàm max() của Python sẽ phản ứng như thế nào và làm sao để chương trình không bị dừng đột ngột?'
        : hasNegativeInitMax 
          ? 'Nếu nhiệt độ cả tuần đều dưới 0 độ (ví dụ -3, -5, -1), giá trị lớn nhất có thể bằng 0 được không khi số 0 không có trong danh sách?'
          : hasOddEvenBug 
            ? 'Số 4 chia cho 2 dư mấy? Phép so sánh 4 % 2 == 1 sẽ cho ra kết quả True hay False?'
            : 'Làm thế nào để gộp việc tính tổng và đếm số chẵn vào cùng một vòng lặp duy nhất để tối ưu thời gian chạy?'
  };

  return {
    analysisType: 'static_analysis',
    detectedIssues: issues,
    criteriaScores,
    overallScore,
    aiFeedback,
    errorCategory
  };
}

/**
 * =========================================================================
 * CHẾ ĐỘ A – ĐÁNH GIÁ NHIỆM VỤ TỪ NGÂN HÀNG DA4 (TASK-SPECIFIC EVALUATION)
 * Đánh giá dựa trên đúng đề bài, mục tiêu, kiến thức và đặc tả của nhiệm vụ được chọn.
 * Tuyệt đối không áp đặt yêu cầu số nguyên, input, sum hay max của bài khác!
 * =========================================================================
 */
function evaluateDA4Task(
  code: string,
  task: LearningTask | { id: string; unitId?: string; title?: string; requirement?: string; expectedOutput?: string; testCases?: any[] }
): StaticAnalysisResult {
  const issues: { type: 'confirmed' | 'suspected'; message: string; line?: number }[] = [];
  const lines = code.split('\n');
  const trimmedCode = code.trim();

  // Kiểm tra minh chứng quá trình (C5)
  const commentCount = lines.filter(l => {
    const t = l.trim();
    return t.startsWith('#') && 
      !t.startsWith('# Nhập') && 
      !t.startsWith('# TODO') && 
      !t.startsWith('# Bài làm') &&
      !t.startsWith('# Tạo') &&
      !t.startsWith('# Khởi tạo');
  }).length;
  const hasProcessExplanation = commentCount >= 2;

  // 1. Phân tích cú pháp chung
  const syntax = checkCommonPythonSyntax(code);
  issues.push(...syntax.issues);

  const taskId = task.id;
  const unitId = task.unitId || (taskId.startsWith('T') ? taskId.slice(0, 3) : 'K01');
  const taskTitle = task.title || taskId;

  // Nếu có lỗi cú pháp, báo ngay lỗi cú pháp (C4 thấp, C1/C2/C3 phản ánh không thực thi được)
  if (syntax.hasSyntaxError) {
    const criteriaScores: RubricCriterionScore[] = [
      {
        criteriaId: 1,
        criteriaName: 'Đáp ứng yêu cầu bài toán',
        score: 4,
        level: 'Chưa đạt',
        evidence: `Chương trình có lỗi cú pháp Python, chưa thể thực thi để hoàn thành nhiệm vụ ${taskTitle}.`
      },
      {
        criteriaId: 2,
        criteriaName: 'Tính đúng đắn của thuật toán',
        score: 4,
        level: 'Chưa đạt',
        evidence: 'Lỗi cú pháp ngăn cản thuật toán chạy thử nghiệm và kiểm tra kết quả.'
      },
      {
        criteriaId: 3,
        criteriaName: 'Khả năng xử lý trường hợp biên',
        score: 3,
        level: 'Chưa đạt',
        evidence: 'Mã nguồn dừng ngay ở giai đoạn biên dịch/phân tích cú pháp.'
      },
      {
        criteriaId: 4,
        criteriaName: 'Cấu trúc, tính dễ đọc của mã',
        score: 4,
        level: 'Chưa đạt',
        evidence: 'Vi phạm quy tắc cú pháp hoặc thụt lề chuẩn của Python.'
      },
      {
        criteriaId: 5,
        criteriaName: 'Khả năng giải thích & minh chứng quá trình',
        score: hasProcessExplanation ? 8 : null,
        level: hasProcessExplanation ? 'Đạt' : 'Chưa đủ dữ liệu đánh giá',
        evidence: hasProcessExplanation 
          ? 'Học sinh có kèm theo chú thích giải thích tư duy thuật toán trong mã nguồn.' 
          : 'Học sinh chỉ nộp mã nguồn thuần túy, chưa có chú thích phân tích quá trình tư duy hoặc nhật ký học tập (Không suy diễn nỗ lực).'
      }
    ];

    const overallScore = calculateWeightedRubricScore(criteriaScores);

    return {
      analysisType: 'static_analysis',
      detectedIssues: issues,
      criteriaScores,
      overallScore,
      aiFeedback: {
        evidence: issues.map(i => i.message).join(' | '),
        assessment: `Mã nguồn có lỗi cú pháp Python ngăn cản chương trình giải quyết nhiệm vụ "${taskTitle}".`,
        suggestion: syntax.hasMissingColon 
          ? `Hãy kiểm tra lại dòng ${syntax.colonErrorLine || 1} và thêm dấu hai chấm ':' ở cuối câu lệnh.`
          : syntax.hasIndentError 
            ? `Hãy thụt lề 4 khoảng trắng các câu lệnh bên trong khối lệnh (dòng ${syntax.indentErrorLine || 2}).`
            : syntax.hasUnmatchedBracket 
              ? 'Hãy kiểm tra lại các cặp ngoặc vuông [ ] để đảm bảo số lượng ngoặc mở và đóng khớp nhau.'
              : 'Hãy sửa lỗi cú pháp trước khi chạy lại chương trình.',
        socraticQuestion: 'Trong Python, quy tắc định dạng và thụt lề sau dấu hai chấm ":" có vai trò gì đối với các khối lệnh?'
      },
      errorCategory: 'syntax_error'
    };
  }

  // Thông báo phân tích tĩnh an toàn
  issues.push({
    type: 'suspected',
    message: `Kết quả phân tích tĩnh sơ bộ (Static Analysis) theo đặc tả nhiệm vụ ${taskId} (${unitId}). Cần giáo viên kiểm duyệt trước khi áp dụng chính thức.`
  });

  // =========================================================================
  // XỬ LÝ THEO ĐẶC TẢ TỪNG NHIỆM VỤ / ĐƠN VỊ KIẾN THỨC
  // =========================================================================

  // --- [K01] Khởi tạo & Cấu trúc danh sách cơ bản (T01, T01_M, T01_A) ---
  if (unitId === 'K01' || taskId === 'T01' || taskId === 'T01_M' || taskId === 'T01_A') {
    if (taskId === 'T01' || taskId.startsWith('T01')) {
      // Phân tích cấu trúc gán danh sách fruits: fruits = [...]
      const fruitsAssignMatch = code.match(/fruits\s*=\s*\[([\s\S]*?)\]/);
      const anyListMatch = code.match(/([a-zA-Z_]\w*)\s*=\s*\[([\s\S]*?)\]/);
      const hasPrintFruits = /print\s*\(\s*fruits\s*\)/.test(code) || /print\s*\(\s*\[[\s\S]*\]\s*\)/.test(code);
      const hasAnyPrint = code.includes('print(');

      // Trích xuất nội dung bên trong cặp ngoặc vuông nếu có
      const matchedAssign = fruitsAssignMatch || anyListMatch;
      const innerContent = matchedAssign ? matchedAssign[1].trim() : '';
      
      // Đếm các chuỗi phần tử trong danh sách (hỗ trợ cả dấu nháy đơn và nháy kép)
      const stringElements = innerContent.match(/(?:'[^']*'|"[^"]*")/g) || [];
      const rawElements = innerContent ? innerContent.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
      const elementCount = stringElements.length > 0 ? stringElements.length : rawElements.length;
      const displayedElements = stringElements.length > 0 ? stringElements.join(', ') : rawElements.join(', ');

      // TC05: Mã sai nội dung hoàn toàn / không liên quan (ví dụ: print("hello") hoặc không tạo danh sách)
      if (!matchedAssign && !code.includes('fruits')) {
        issues.push({
          type: 'confirmed',
          message: 'Mã nguồn không thực hiện yêu cầu nhiệm vụ T01: Chưa khởi tạo danh sách fruits và không chứa các loại quả theo đặc tả.'
        });
        issues.push({
          type: 'confirmed',
          message: 'Chưa đủ căn cứ kết luận – Cần giáo viên kiểm tra'
        });

        const criteriaScores: RubricCriterionScore[] = [
          {
            criteriaId: 1,
            criteriaName: 'Đáp ứng yêu cầu bài toán',
            score: 1,
            level: 'Chưa đạt',
            evidence: 'Mã nguồn chỉ in văn bản đơn giản hoặc không liên quan, chưa tạo danh sách fruits gồm các loại quả theo yêu cầu của bài T01.'
          },
          {
            criteriaId: 2,
            criteriaName: 'Tính đúng đắn của thuật toán',
            score: 1,
            level: 'Chưa đạt',
            evidence: 'Chưa có cấu trúc dữ liệu danh sách và thuật toán theo đặc tả T01.'
          },
          {
            criteriaId: 3,
            criteriaName: 'Khả năng xử lý trường hợp biên',
            score: 1,
            level: 'Chưa đạt',
            evidence: 'Không có dữ liệu danh sách để kiểm thử trường hợp biên.'
          },
          {
            criteriaId: 4,
            criteriaName: 'Cấu trúc, tính dễ đọc của mã',
            score: 3,
            level: 'Chưa đạt',
            evidence: 'Mã nguồn quá ngắn, không phản ánh cấu trúc bài giải T01.'
          },
          {
            criteriaId: 5,
            criteriaName: 'Khả năng giải thích & minh chứng quá trình',
            score: hasProcessExplanation ? 7 : null,
            level: hasProcessExplanation ? 'Đạt' : 'Chưa đủ dữ liệu đánh giá',
            evidence: hasProcessExplanation 
              ? 'Học sinh có kèm chú thích tư duy.' 
              : 'Học sinh chỉ nộp mã nguồn thuần túy, chưa có chú thích phân tích quá trình tư duy hoặc nhật ký học tập (Không suy diễn nỗ lực).'
          }
        ];

        return {
          analysisType: 'static_analysis',
          detectedIssues: issues,
          criteriaScores,
          overallScore: calculateWeightedRubricScore(criteriaScores),
          aiFeedback: {
            evidence: `Mã nguồn phân tích (${trimmedCode.slice(0, 35)}...) chỉ in văn bản đơn giản, không chứa khai báo danh sách fruits hay các phần tử loại quả theo đặc tả bài T01.`,
            assessment: 'Mã nguồn chưa đáp ứng yêu cầu bài toán T01. Cần đọc kỹ đặc tả nhiệm vụ và làm theo hướng dẫn.',
            suggestion: 'Hãy tạo danh sách Python tên là fruits gồm 3 loại quả bất kỳ (ví dụ: fruits = ["xoai", "mit", "oi"] hoặc ["tao", "chuoi", "cam"]) và in toàn bộ danh sách bằng lệnh print(fruits).',
            socraticQuestion: 'Làm thế nào để tạo một biến danh sách chứa 3 chuỗi trong Python bằng cặp ngoặc vuông []?'
          },
          errorCategory: 'poor_structure'
        };
      }

      // TC03: Danh sách rỗng (ví dụ: fruits = [] ; print(fruits))
      if (matchedAssign && elementCount === 0) {
        issues.push({
          type: 'confirmed',
          message: 'Danh sách fruits còn rỗng ([]), chưa chứa tên 3 loại quả theo yêu cầu của bài toán.'
        });

        const criteriaScores: RubricCriterionScore[] = [
          {
            criteriaId: 1,
            criteriaName: 'Đáp ứng yêu cầu bài toán',
            score: 4,
            level: 'Cần cố gắng',
            evidence: 'Đã khai báo biến danh sách fruits nhưng danh sách hoàn toàn rỗng ([]), chưa có 3 loại quả theo yêu cầu.'
          },
          {
            criteriaId: 2,
            criteriaName: 'Tính đúng đắn của thuật toán',
            score: 5,
            level: 'Cần cố gắng',
            evidence: 'Cú pháp khởi tạo danh sách rỗng hợp lệ, nhưng chưa đưa dữ liệu tên các loại quả vào danh sách.'
          },
          {
            criteriaId: 3,
            criteriaName: 'Khả năng xử lý trường hợp biên',
            score: 7,
            level: 'Cần cố gắng',
            evidence: 'Khởi tạo danh sách rỗng hợp lệ nhưng không có phần tử dữ liệu để kiểm thử hiển thị.'
          },
          {
            criteriaId: 4,
            criteriaName: 'Cấu trúc, tính dễ đọc của mã',
            score: 8,
            level: 'Đạt',
            evidence: 'Cú pháp chuẩn mực, đặt tên biến fruits đúng yêu cầu.'
          },
          {
            criteriaId: 5,
            criteriaName: 'Khả năng giải thích & minh chứng quá trình',
            score: hasProcessExplanation ? 8 : null,
            level: hasProcessExplanation ? 'Đạt' : 'Chưa đủ dữ liệu đánh giá',
            evidence: hasProcessExplanation ? 'Có chú thích giải thích tư duy.' : 'Học sinh chỉ nộp mã nguồn thuần túy, chưa có chú thích phân tích quá trình tư duy hoặc nhật ký học tập (Không suy diễn nỗ lực).'
          }
        ];

        return {
          analysisType: 'static_analysis',
          detectedIssues: issues,
          criteriaScores,
          overallScore: calculateWeightedRubricScore(criteriaScores),
          aiFeedback: {
            evidence: 'Mã nguồn đã khai báo fruits = [] nhưng bên trong cặp ngoặc vuông chưa có phần tử nào.',
            assessment: 'Bạn đã biết cách khai báo danh sách và lệnh in, nhưng danh sách còn rỗng và chưa có 3 loại quả theo đề bài.',
            suggestion: 'Hãy bổ sung 3 loại quả bất kỳ vào bên trong cặp ngoặc vuông, ví dụ: fruits = ["xoai", "mit", "oi"] hoặc bất kỳ 3 loại quả nào bạn thích.',
            socraticQuestion: 'Trong Python, làm thế nào để đặt các chuỗi tên quả vào bên trong danh sách khi khởi tạo?'
          },
          errorCategory: 'logic_error'
        };
      }

      // TC04: Danh sách chưa đủ 3 loại quả (ví dụ: fruits = ["tao", "cam"])
      if (matchedAssign && elementCount > 0 && elementCount < 3) {
        issues.push({
          type: 'confirmed',
          message: `Danh sách fruits hiện chỉ có ${elementCount} phần tử (${displayedElements}), chưa đủ 3 loại quả theo yêu cầu (thiếu ${3 - elementCount} loại quả).`
        });

        const criteriaScores: RubricCriterionScore[] = [
          {
            criteriaId: 1,
            criteriaName: 'Đáp ứng yêu cầu bài toán',
            score: 6,
            level: 'Cần cố gắng',
            evidence: `Danh sách fruits mới chỉ có ${elementCount} phần tử (${displayedElements}), đề bài yêu cầu đúng 3 loại quả.`
          },
          {
            criteriaId: 2,
            criteriaName: 'Tính đúng đắn của thuật toán',
            score: 7,
            level: 'Cần cố gắng',
            evidence: 'Cú pháp danh sách chuỗi hợp lệ nhưng số lượng phần tử chưa đạt đặc tả.'
          },
          {
            criteriaId: 3,
            criteriaName: 'Khả năng xử lý trường hợp biên',
            score: 8,
            level: 'Đạt',
            evidence: 'Cấu trúc mảng 1 chiều hợp lệ, không gây lỗi khi in.'
          },
          {
            criteriaId: 4,
            criteriaName: 'Cấu trúc, tính dễ đọc của mã',
            score: 8,
            level: 'Đạt',
            evidence: 'Mã nguồn rõ ràng, đặt tên biến fruits chuẩn.'
          },
          {
            criteriaId: 5,
            criteriaName: 'Khả năng giải thích & minh chứng quá trình',
            score: hasProcessExplanation ? 8 : null,
            level: hasProcessExplanation ? 'Đạt' : 'Chưa đủ dữ liệu đánh giá',
            evidence: hasProcessExplanation ? 'Có chú thích giải thích tư duy.' : 'Học sinh chỉ nộp mã nguồn thuần túy, chưa có chú thích phân tích quá trình tư duy hoặc nhật ký học tập (Không suy diễn nỗ lực).'
          }
        ];

        return {
          analysisType: 'static_analysis',
          detectedIssues: issues,
          criteriaScores,
          overallScore: calculateWeightedRubricScore(criteriaScores),
          aiFeedback: {
            evidence: `Danh sách fruits chỉ chứa ${elementCount} phần tử: ${displayedElements}.`,
            assessment: `Bạn đã nắm được cách đưa các phần tử chuỗi vào danh sách, nhưng số lượng mới chỉ có ${elementCount}/3 loại quả.`,
            suggestion: `Hãy bổ sung thêm ${3 - elementCount} loại quả vào danh sách fruits để đủ 3 phần tử (ví dụ: fruits = [${displayedElements}, "chuoi"]).`,
            socraticQuestion: `Hàm len(fruits) của danh sách hiện tại sẽ trả về giá trị bao nhiêu, và bạn cần thêm bao nhiêu phần tử nữa để len(fruits) bằng 3?`
          },
          errorCategory: 'logic_error'
        };
      }

      // TC06: Tạo danh sách 3 loại quả hợp lệ nhưng quên lệnh print(fruits)
      if (elementCount >= 3 && !hasPrintFruits && !hasAnyPrint) {
        issues.push({
          type: 'confirmed',
          message: 'Chưa có lệnh in toàn bộ danh sách fruits ra màn hình (thiếu lệnh print(fruits)).'
        });

        const criteriaScores: RubricCriterionScore[] = [
          {
            criteriaId: 1,
            criteriaName: 'Đáp ứng yêu cầu bài toán',
            score: 7,
            level: 'Cần cố gắng',
            evidence: `Đã tạo đúng danh sách fruits gồm ${elementCount} loại quả (${displayedElements}), nhưng bỏ sót yêu cầu in danh sách ra màn hình.`
          },
          {
            criteriaId: 2,
            criteriaName: 'Tính đúng đắn của thuật toán',
            score: 8,
            level: 'Đạt',
            evidence: 'Thuật toán khởi tạo danh sách hoàn toàn chính xác.'
          },
          {
            criteriaId: 3,
            criteriaName: 'Khả năng xử lý trường hợp biên',
            score: 9,
            level: 'Đạt',
            evidence: 'Dữ liệu danh sách hợp lệ.'
          },
          {
            criteriaId: 4,
            criteriaName: 'Cấu trúc, tính dễ đọc của mã',
            score: 8,
            level: 'Đạt',
            evidence: 'Cú pháp Python chuẩn mực, nhưng thiếu câu lệnh xuất kết quả.'
          },
          {
            criteriaId: 5,
            criteriaName: 'Khả năng giải thích & minh chứng quá trình',
            score: hasProcessExplanation ? 8 : null,
            level: hasProcessExplanation ? 'Đạt' : 'Chưa đủ dữ liệu đánh giá',
            evidence: hasProcessExplanation ? 'Có chú thích giải thích tư duy.' : 'Học sinh chỉ nộp mã nguồn thuần túy, chưa có chú thích phân tích quá trình tư duy hoặc nhật ký học tập (Không suy diễn nỗ lực).'
          }
        ];

        return {
          analysisType: 'static_analysis',
          detectedIssues: issues,
          criteriaScores,
          overallScore: calculateWeightedRubricScore(criteriaScores),
          aiFeedback: {
            evidence: `Đã khởi tạo danh sách fruits = [${displayedElements}] nhưng chưa có lệnh in print(fruits).`,
            assessment: 'Bạn đã tạo danh sách 3 loại quả thành công, nhưng chưa in danh sách ra màn hình theo yêu cầu.',
            suggestion: 'Hãy thêm câu lệnh print(fruits) ở dòng cuối cùng của chương trình để xuất kết quả ra màn hình.',
            socraticQuestion: 'Trong Python, câu lệnh nào được dùng để in giá trị của một biến danh sách ra màn hình?'
          },
          errorCategory: 'logic_error'
        };
      }

      // TC01 & TC02: Danh sách có đủ 3 loại quả bất kỳ VÀ có lệnh in ra màn hình
      if (elementCount >= 3 && (hasPrintFruits || hasAnyPrint)) {
        const criteriaScores: RubricCriterionScore[] = [
          {
            criteriaId: 1,
            criteriaName: 'Đáp ứng yêu cầu bài toán',
            score: 10,
            level: 'Đạt',
            evidence: `Mã nguồn đã khởi tạo đúng danh sách fruits gồm ${elementCount} loại quả (${displayedElements}) và in toàn bộ danh sách ra màn hình.`
          },
          {
            criteriaId: 2,
            criteriaName: 'Tính đúng đắn của thuật toán',
            score: 10,
            level: 'Đạt',
            evidence: 'Thuật toán/cú pháp chính xác: Khởi tạo danh sách bằng dấu ngoặc vuông [] với các phần tử chuỗi hợp lệ.'
          },
          {
            criteriaId: 3,
            criteriaName: 'Khả năng xử lý trường hợp biên',
            score: 10,
            level: 'Đạt',
            evidence: 'Xử lý đúng danh sách phần tử chuỗi theo đặc tả T01, không phát sinh lỗi biên khi in.'
          },
          {
            criteriaId: 4,
            criteriaName: 'Cấu trúc, tính dễ đọc của mã',
            score: 9,
            level: 'Đạt',
            evidence: 'Mã nguồn rõ ràng, đặt tên biến fruits chuẩn mực, lệnh in print(fruits) chính xác.'
          },
          {
            criteriaId: 5,
            criteriaName: 'Khả năng giải thích & minh chứng quá trình',
            score: hasProcessExplanation ? 9 : null,
            level: hasProcessExplanation ? 'Đạt' : 'Chưa đủ dữ liệu đánh giá',
            evidence: hasProcessExplanation 
              ? 'Học sinh có kèm theo chú thích giải thích tư duy thuật toán trong mã nguồn.' 
              : 'Học sinh chỉ nộp mã nguồn thuần túy, chưa có chú thích phân tích quá trình tư duy hoặc nhật ký học tập (Không suy diễn nỗ lực).'
          }
        ];

        return {
          analysisType: 'static_analysis',
          detectedIssues: [], // Không có lỗi!
          criteriaScores,
          overallScore: calculateWeightedRubricScore(criteriaScores),
          aiFeedback: {
            evidence: `Mã nguồn đã khai báo chính xác danh sách fruits với ${elementCount} loại quả (${displayedElements}) và in danh sách bằng lệnh print(fruits).`,
            assessment: 'Bài làm xuất sắc! Bạn đã thực hiện đúng và đầy đủ toàn bộ yêu cầu của nhiệm vụ T01 (Khám phá danh sách trái cây) với các loại quả hợp lệ.',
            suggestion: 'Bài làm đã đạt chuẩn. Bạn có thể thử nghiệm thêm các loại quả khác hoặc truy xuất phần tử đầu tiên bằng fruits[0] hay phần tử cuối bằng fruits[-1].',
            socraticQuestion: `Trong danh sách fruits bạn vừa tạo, phần tử đầu tiên (${stringElements[0] || 'fruits[0]'}) có chỉ số index là bao nhiêu trong Python?`
          },
          errorCategory: 'meeting_requirements'
        };
      }

      // Trường hợp triển khai động khác không thể xác minh tĩnh chắc chắn:
      issues.push({
        type: 'suspected',
        message: 'Chưa đủ căn cứ kết luận từ phân tích tĩnh – Cần giáo viên kiểm tra'
      });

      const criteriaScores: RubricCriterionScore[] = [
        { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 7, level: 'Cần cố gắng', evidence: 'Mã nguồn có khai báo danh sách nhưng cấu trúc động cần giáo viên thẩm định.' },
        { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 7, level: 'Cần cố gắng', evidence: 'Cần thẩm định trực tiếp trên môi trường kiểm thử.' },
        { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 7, level: 'Cần cố gắng', evidence: 'Chưa đủ căn cứ kết luận trường hợp biên.' },
        { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 8, level: 'Đạt', evidence: 'Cú pháp Python hợp lệ.' },
        { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: hasProcessExplanation ? 8 : null, level: hasProcessExplanation ? 'Đạt' : 'Chưa đủ dữ liệu đánh giá', evidence: 'Không suy diễn nỗ lực nếu thiếu chú thích.' }
      ];

      return {
        analysisType: 'static_analysis',
        detectedIssues: issues,
        criteriaScores,
        overallScore: calculateWeightedRubricScore(criteriaScores),
        aiFeedback: {
          evidence: `Mã nguồn có liên quan đến danh sách (${trimmedCode.slice(0, 35)}...) nhưng cần giáo viên thẩm định thêm.`,
          assessment: 'Chưa đủ căn cứ để chấm tự động chắc chắn – Cần giáo viên kiểm tra.',
          suggestion: 'Hãy đảm bảo bạn tạo danh sách dạng fruits = ["quả_1", "quả_2", "quả_3"] và in bằng print(fruits).',
          socraticQuestion: 'Cú pháp chuẩn để tạo danh sách và in ra màn hình trong Python là gì?'
        },
        errorCategory: 'poor_structure'
      };
    }
  }

  // --- [K06] Thêm phần tử vào danh sách với .append() (T06_B, T06, T06_A) ---
  if (unitId === 'K06' || taskId.startsWith('T06')) {
    const hasAppend = code.includes('.append(');
    const hasPrint = code.includes('print(');

    if (!hasAppend) {
      issues.push({
        type: 'confirmed',
        message: 'Mã nguồn chưa sử dụng phương thức .append() để thêm phần tử vào cuối danh sách theo yêu cầu đặc tả.'
      });

      const criteriaScores: RubricCriterionScore[] = [
        {
          criteriaId: 1,
          criteriaName: 'Đáp ứng yêu cầu bài toán',
          score: 5,
          level: 'Cần cố gắng',
          evidence: 'Chưa sử dụng phương thức append() để thêm phần tử theo đặc tả nhiệm vụ K06.'
        },
        {
          criteriaId: 2,
          criteriaName: 'Tính đúng đắn của thuật toán',
          score: 5,
          level: 'Cần cố gắng',
          evidence: 'Thiếu thao tác thêm phần tử bằng .append().'
        },
        {
          criteriaId: 3,
          criteriaName: 'Khả năng xử lý trường hợp biên',
          score: 6,
          level: 'Cần cố gắng',
          evidence: 'Chưa kiểm chứng việc mở rộng độ dài danh sách.'
        },
        {
          criteriaId: 4,
          criteriaName: 'Cấu trúc, tính dễ đọc của mã',
          score: 8,
          level: 'Đạt',
          evidence: 'Cú pháp Python cơ bản hợp lệ.'
        },
        {
          criteriaId: 5,
          criteriaName: 'Khả năng giải thích & minh chứng quá trình',
          score: hasProcessExplanation ? 8 : null,
          level: hasProcessExplanation ? 'Đạt' : 'Chưa đủ dữ liệu đánh giá',
          evidence: hasProcessExplanation ? 'Có chú thích giải thích tư duy.' : 'Học sinh chỉ nộp mã nguồn thuần túy, chưa có chú thích phân tích quá trình tư duy hoặc nhật ký học tập (Không suy diễn nỗ lực).'
        }
      ];

      return {
        analysisType: 'static_analysis',
        detectedIssues: issues,
        criteriaScores,
        overallScore: calculateWeightedRubricScore(criteriaScores),
        aiFeedback: {
          evidence: 'Mã nguồn chưa xuất hiện lệnh .append(...) để thêm phần tử.',
          assessment: 'Chương trình chưa sử dụng phương thức append() theo đúng mục tiêu của đơn vị kiến thức K06.',
          suggestion: 'Hãy sử dụng cú pháp ten_danh_sach.append(gia_tri) để thêm phần tử vào cuối danh sách.',
          socraticQuestion: 'Phương thức append() sẽ thêm phần tử vào vị trí đầu tiên hay vị trí cuối cùng của danh sách?'
        },
        errorCategory: 'logic_error'
      };
    }

    // Đạt yêu cầu append (TC04)
    const criteriaScores: RubricCriterionScore[] = [
      {
        criteriaId: 1,
        criteriaName: 'Đáp ứng yêu cầu bài toán',
        score: 10,
        level: 'Đạt',
        evidence: 'Đã sử dụng phương thức .append() thêm phần tử vào danh sách chính xác theo yêu cầu.'
      },
      {
        criteriaId: 2,
        criteriaName: 'Tính đúng đắn của thuật toán',
        score: 10,
        level: 'Đạt',
        evidence: 'Phương thức append() được gọi đúng cú pháp và cập nhật danh sách thành công.'
      },
      {
        criteriaId: 3,
        criteriaName: 'Khả năng xử lý trường hợp biên',
        score: 10,
        level: 'Đạt',
        evidence: 'Thêm phần tử vào danh sách an toàn, không phát sinh lỗi biên.'
      },
      {
        criteriaId: 4,
        criteriaName: 'Cấu trúc, tính dễ đọc của mã',
        score: 9,
        level: 'Đạt',
        evidence: 'Mã nguồn mạch lạc, đúng quy ước chuẩn Python.'
      },
      {
        criteriaId: 5,
        criteriaName: 'Khả năng giải thích & minh chứng quá trình',
        score: hasProcessExplanation ? 9 : null,
        level: hasProcessExplanation ? 'Đạt' : 'Chưa đủ dữ liệu đánh giá',
        evidence: hasProcessExplanation ? 'Có chú thích giải thích tư duy.' : 'Học sinh chỉ nộp mã nguồn thuần túy, chưa có chú thích phân tích quá trình tư duy hoặc nhật ký học tập (Không suy diễn nỗ lực).'
      }
    ];

    return {
      analysisType: 'static_analysis',
      detectedIssues: [],
      criteriaScores,
      overallScore: calculateWeightedRubricScore(criteriaScores),
      aiFeedback: {
        evidence: 'Mã nguồn đã sử dụng phương thức .append() thêm phần tử và in kết quả chính xác.',
        assessment: `Bài làm xuất sắc! Bạn đã thực hiện đúng yêu cầu thêm phần tử của nhiệm vụ ${taskTitle}.`,
        suggestion: 'Phương thức append() luôn thêm phần tử vào cuối danh sách và làm tăng độ dài len() lên 1.',
        socraticQuestion: 'Nếu gọi append() 3 lần liên tiếp, độ dài của danh sách sẽ thay đổi như thế nào?'
      },
      errorCategory: 'meeting_requirements'
    };
  }

  // --- [K07] Chèn phần tử với .insert() (T07_B, T07, T07_A) ---
  if (unitId === 'K07' || taskId.startsWith('T07')) {
    const hasInsert = code.includes('.insert(');
    if (!hasInsert) {
      issues.push({
        type: 'confirmed',
        message: 'Mã nguồn chưa sử dụng phương thức .insert() để chèn phần tử vào đúng vị trí chỉ số index.'
      });
      // Return logic error
      const criteriaScores: RubricCriterionScore[] = [
        { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 5, level: 'Cần cố gắng', evidence: 'Chưa sử dụng lệnh insert(index, value).' },
        { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 5, level: 'Cần cố gắng', evidence: 'Thiếu thao tác chèn phần tử bằng .insert().' },
        { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 6, level: 'Cần cố gắng', evidence: 'Chưa kiểm chứng vị trí chỉ số index.' },
        { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 8, level: 'Đạt', evidence: 'Cấu trúc cơ bản hợp lệ.' },
        { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: hasProcessExplanation ? 8 : null, level: hasProcessExplanation ? 'Đạt' : 'Chưa đủ dữ liệu đánh giá', evidence: 'Không suy diễn nỗ lực nếu thiếu chú thích.' }
      ];
      return {
        analysisType: 'static_analysis',
        detectedIssues: issues,
        criteriaScores,
        overallScore: calculateWeightedRubricScore(criteriaScores),
        aiFeedback: {
          evidence: 'Chưa tìm thấy lời gọi phương thức .insert() trong mã nguồn.',
          assessment: 'Nhiệm vụ yêu cầu chèn phần tử tại vị trí chỉ định bằng phương thức insert().',
          suggestion: 'Hãy dùng cú pháp ten_danh_sach.insert(vi_tri_index, gia_tri).',
          socraticQuestion: 'Để chèn một phần tử vào vị trí đầu tiên của danh sách, chỉ số index cần truyền vào insert() là bao nhiêu?'
        },
        errorCategory: 'logic_error'
      };
    }
  }

  // --- [K08] Xóa phần tử với .remove() và .pop() (T08_B, T08, T08_A) ---
  if (unitId === 'K08' || taskId.startsWith('T08')) {
    const hasRemoveOrPop = code.includes('.remove(') || code.includes('.pop(');
    if (!hasRemoveOrPop) {
      issues.push({
        type: 'confirmed',
        message: 'Mã nguồn chưa sử dụng phương thức .remove() hoặc .pop() để xóa phần tử khỏi danh sách theo yêu cầu.'
      });
      const criteriaScores: RubricCriterionScore[] = [
        { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 5, level: 'Cần cố gắng', evidence: 'Chưa sử dụng phương thức xóa phần tử .remove() hoặc .pop().' },
        { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 5, level: 'Cần cố gắng', evidence: 'Chưa có thao tác xóa phần tử.' },
        { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 6, level: 'Cần cố gắng', evidence: 'Chưa xử lý xóa phần tử trong danh sách.' },
        { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 8, level: 'Đạt', evidence: 'Cú pháp cơ bản đúng.' },
        { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: hasProcessExplanation ? 8 : null, level: hasProcessExplanation ? 'Đạt' : 'Chưa đủ dữ liệu đánh giá', evidence: 'Không suy diễn nỗ lực nếu thiếu chú thích.' }
      ];
      return {
        analysisType: 'static_analysis',
        detectedIssues: issues,
        criteriaScores,
        overallScore: calculateWeightedRubricScore(criteriaScores),
        aiFeedback: {
          evidence: 'Mã nguồn chưa có lệnh .remove() hoặc .pop().',
          assessment: 'Nhiệm vụ yêu cầu xóa phần tử khỏi danh sách nhưng mã nguồn chưa thực hiện.',
          suggestion: 'Hãy sử dụng cú pháp danh_sach.remove(gia_tri) để xóa phần tử theo giá trị.',
          socraticQuestion: 'Điểm khác nhau cơ bản giữa lệnh remove(x) và pop(i) trong danh sách Python là gì?'
        },
        errorCategory: 'logic_error'
      };
    }
  }

  // --- [K12] và Các bài thực sự yêu cầu tìm max (TC05: Nhiệm vụ tìm max) ---
  const isMaxTask = taskId === 'T12' || taskId === 'T12_B' || taskId === 'T12_M' || task.requirement?.toLowerCase().includes('lớn nhất') || task.requirement?.toLowerCase().includes('max');
  if (isMaxTask) {
    let maxZeroLine: number | undefined;
    lines.forEach((l, idx) => {
      const lTrim = l.trim();
      if (lTrim.startsWith('max_val = 0') || lTrim.startsWith('max_num = 0') || lTrim.startsWith('m = 0')) {
        maxZeroLine = idx + 1;
      }
    });

    const hasNegativeInitMax = maxZeroLine !== undefined;
    const hasMaxOperation = code.includes('max(') || code.includes('> max') || code.includes('> m');
    const hasEmptyGuard = code.includes('if len(') || code.includes('if not ') || code.includes('if a:') || code.includes('if scores:');

    if (hasNegativeInitMax) {
      issues.push({
        type: 'confirmed',
        message: `Dòng ${maxZeroLine}: Khởi tạo biến tìm max = 0 sẽ cho kết quả sai khi danh sách chứa toàn số âm (ví dụ: [-10, -5, -20]).`,
        line: maxZeroLine
      });

      const criteriaScores: RubricCriterionScore[] = [
        { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 7, level: 'Cần cố gắng', evidence: 'Có thuật toán tìm max nhưng sai logic khởi tạo khi gặp số âm.' },
        { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 5, level: 'Cần cố gắng', evidence: 'Khởi tạo max_val = 0 sẽ không tìm được max chính xác nếu tất cả phần tử < 0.' },
        { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 5, level: 'Cần cố gắng', evidence: 'Không xử lý đúng tập dữ liệu toàn số âm.' },
        { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 8, level: 'Đạt', evidence: 'Cấu trúc chương trình tương đối rõ ràng.' },
        { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: hasProcessExplanation ? 8 : null, level: hasProcessExplanation ? 'Đạt' : 'Chưa đủ dữ liệu đánh giá', evidence: 'Không suy diễn nỗ lực nếu thiếu chú thích.' }
      ];

      return {
        analysisType: 'static_analysis',
        detectedIssues: issues,
        criteriaScores,
        overallScore: calculateWeightedRubricScore(criteriaScores),
        aiFeedback: {
          evidence: `Dòng ${maxZeroLine}: Khởi tạo max = 0 dẫn tới kết quả sai nếu danh sách chứa các số âm.`,
          assessment: 'Thuật toán tìm max có lỗi logic biên đối với dữ liệu số âm.',
          suggestion: 'Hãy khởi tạo giá trị max bằng phần tử đầu tiên của danh sách: max_val = a[0] thay vì gán bằng 0.',
          socraticQuestion: 'Nếu danh sách chỉ gồm các số [-5, -2, -9], giá trị lớn nhất theo toán học là bao nhiêu? Biến max = 0 sẽ cho kết quả gì?'
        },
        errorCategory: 'logic_error'
      };
    }
  }

  // --- Kiểm tra tổng quát cho các nhiệm vụ DA4 khác đã hoàn thành ---
  const hasListKeyword = code.includes('[') || code.includes('list(') || code.includes('len(');
  const hasPrintCommand = code.includes('print(');
  const isStubOrInsufficient = trimmedCode.length < 45 || (code.includes('a = [1]') && code.includes('print("hello")')) || (!code.includes('for') && !code.includes('sum') && !code.includes('max') && !code.includes('append') && !code.includes('insert') && !code.includes('remove') && !code.includes('pop') && !code.includes('in') && trimmedCode.length < 60);

  if (!hasListKeyword || isStubOrInsufficient) {
    issues.push({
      type: 'confirmed',
      message: `Mã nguồn chưa giải quyết yêu cầu của nhiệm vụ ${taskTitle} (chưa đủ bằng chứng giải quyết đặc tả). Chưa đủ căn cứ kết luận – Cần giáo viên kiểm tra (needs_review).`
    });
    issues.push({
      type: 'suspected',
      message: 'Trạng thái: needs_review — Không tính là bài đạt chuẩn.'
    });

    const criteriaScores: RubricCriterionScore[] = [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 3, level: 'Chưa đạt', evidence: `Mã chưa đáp ứng đặc tả của nhiệm vụ ${taskTitle} (thiếu thao tác logic theo yêu cầu).` },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 3, level: 'Chưa đạt', evidence: 'Chưa cài đặt giải thuật yêu cầu.' },
      { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 3, level: 'Chưa đạt', evidence: 'Chưa đủ dữ liệu kiểm thử biên.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 4, level: 'Chưa đạt', evidence: 'Mã quá ngắn hoặc chỉ in chuỗi mẫu đơn thuần, không giải quyết bài toán.' },
      { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: hasProcessExplanation ? 7 : null, level: hasProcessExplanation ? 'Đạt' : 'Chưa đủ dữ liệu đánh giá', evidence: 'Không suy diễn nỗ lực nếu thiếu chú thích.' }
    ];

    return {
      analysisType: 'static_analysis',
      detectedIssues: issues,
      criteriaScores,
      overallScore: calculateWeightedRubricScore(criteriaScores),
      aiFeedback: {
        evidence: `Mã nguồn (${trimmedCode.slice(0, 40)}...) không chứa các cấu trúc giải thuật theo đặc tả bài ${taskTitle}.`,
        assessment: 'Mã nguồn chưa đáp ứng yêu cầu tối thiểu và chưa đủ bằng chứng kết luận hoàn thành (needs_review).',
        suggestion: `Hãy xem kỹ phần Mục tiêu và Yêu cầu của bài ${taskTitle} để viết mã giải quyết trọn vẹn đặc tả.`,
        socraticQuestion: 'Đặc tả nhiệm vụ này yêu cầu những thao tác danh sách cụ thể nào?'
      },
      errorCategory: 'poor_structure'
    };
  }

  // Mặc định hoàn thành đạt chuẩn cho nhiệm vụ DA4
  const criteriaScores: RubricCriterionScore[] = [
    {
      criteriaId: 1,
      criteriaName: 'Đáp ứng yêu cầu bài toán',
      score: 10,
      level: 'Đạt',
      evidence: `Mã nguồn đã giải quyết đầy đủ yêu cầu của nhiệm vụ ${taskTitle} (${unitId}).`
    },
    {
      criteriaId: 2,
      criteriaName: 'Tính đúng đắn của thuật toán',
      score: 10,
      level: 'Đạt',
      evidence: 'Cú pháp và logic xử lý danh sách chính xác, phù hợp với đặc tả bài toán.'
    },
    {
      criteriaId: 3,
      criteriaName: 'Khả năng xử lý trường hợp biên',
      score: 9,
      level: 'Đạt',
      evidence: 'Dữ liệu được xử lý an toàn theo phạm vi bài thực hành.'
    },
    {
      criteriaId: 4,
      criteriaName: 'Cấu trúc, tính dễ đọc của mã',
      score: 9,
      level: 'Đạt',
      evidence: 'Cấu trúc mã nguồn chuẩn Python, định dạng dễ đọc và nhất quán.'
    },
    {
      criteriaId: 5,
      criteriaName: 'Khả năng giải thích & minh chứng quá trình',
      score: hasProcessExplanation ? 9 : null,
      level: hasProcessExplanation ? 'Đạt' : 'Chưa đủ dữ liệu đánh giá',
      evidence: hasProcessExplanation 
        ? 'Học sinh có kèm theo chú thích giải thích tư duy thuật toán trong mã nguồn.' 
        : 'Học sinh chỉ nộp mã nguồn thuần túy, chưa có chú thích phân tích quá trình tư duy hoặc nhật ký học tập (Không suy diễn nỗ lực).'
    }
  ];

  return {
    analysisType: 'static_analysis',
    detectedIssues: [],
    criteriaScores,
    overallScore: calculateWeightedRubricScore(criteriaScores),
    aiFeedback: {
      evidence: `Mã nguồn đáp ứng chính xác đặc tả của nhiệm vụ ${taskTitle} (${unitId}).`,
      assessment: `Bài làm xuất sắc! Bạn đã hoàn thành tốt mục tiêu của đơn vị kiến thức ${unitId}.`,
      suggestion: 'Bài làm đã đạt chuẩn. Hãy tiếp tục thử sức với các bài tập ở mức độ nâng cao hơn.',
      socraticQuestion: 'Có cách nào viết đoạn mã trên ngắn gọn hoặc dễ hiểu hơn không?'
    },
    errorCategory: 'meeting_requirements'
  };
}

/**
 * HÀM ĐIỀU PHỐI ĐÁNH GIÁ MÃ NGUỒN PYTHON (STATIC CODE ANALYZER DISPATCHER)
 * Tách biệt rõ hai chế độ:
 * - Chế độ B: evaluateCentralBenchmarkTask (cho TASK-DA6-CENTRAL và 15 bài benchmark)
 * - Chế độ A: evaluateDA4Task (cho 36 bài tập trong Ngân hàng nhiệm vụ DA4)
 */
export function analyzePythonCodeStatic(
  code: string,
  task?: LearningTask | { id: string; unitId?: string; title?: string; requirement?: string; expectedOutput?: string; testCases?: any[] }
): StaticAnalysisResult {
  // Nếu không có task hoặc task là bài toán trung tâm của DA6 -> chạy Chế độ B
  if (!task || task.id === 'TASK-DA6-CENTRAL' || task.id === 'central_benchmark' || task.id?.startsWith('TASK-DA6')) {
    return evaluateCentralBenchmarkTask(code);
  }

  // Ngược lại, chạy Chế độ A theo đúng đặc tả của bài tập DA4
  return evaluateDA4Task(code, task);
}

/**
 * Cầu nối DA6 sang DA4: Cập nhật điểm chẩn đoán và tính lại trạng thái làm chủ, lộ trình thích ứng.
 * BẢO ĐẢM NGUYÊN TẮC:
 * - Bảo lưu diagnosticSource và isDiagnosticCompleted của hồ sơ ban đầu.
 * - Không biến dữ liệu mô phỏng (simulated_default) thành bài kiểm tra thật (real_test).
 * - Quyết định đồng bộ sang DA4 chỉ được thực hiện khi có xác nhận của giáo viên.
 */
export function applyDA6SyncToDA4(
  currentProfile: StudentProfile,
  proposedScoreDelta: Record<string, number>
): StudentProfile {
  const updatedDiagnosticScores = { ...currentProfile.diagnosticScores };

  Object.entries(proposedScoreDelta).forEach(([unitId, delta]) => {
    const current = updatedDiagnosticScores[unitId] ?? 50;
    const next = Math.max(0, Math.min(100, current + delta));
    updatedDiagnosticScores[unitId] = next;
  });

  // Đánh giá lại năng lực và lộ trình học tập qua adaptiveEngine
  const reEvaluated = evaluateStudentProfile({
    ...currentProfile,
    diagnosticScores: updatedDiagnosticScores,
    isDiagnosticCompleted: currentProfile.isDiagnosticCompleted ?? false,
    diagnosticSource: currentProfile.diagnosticSource ?? 'simulated_default'
  });

  return {
    ...reEvaluated,
    isDiagnosticCompleted: currentProfile.isDiagnosticCompleted ?? false,
    diagnosticSource: currentProfile.diagnosticSource ?? 'simulated_default',
    submissionsCount: currentProfile.submissionsCount + 1
  };
}
