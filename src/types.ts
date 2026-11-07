export type UserRole = 'student' | 'teacher' | 'researcher';

export type StudentProfileId = 'HS01' | 'HS02' | 'HS03' | 'HS04';

export interface TeacherUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'teacher' | 'admin';
  isAuthorizedTeacher: boolean;
  authProvider: 'firebase' | 'google' | 'session';
  verifiedAt: string;
}

export type UnitMasteryStatus =
  | 'Chưa được kiểm tra'
  | 'Chưa đủ bằng chứng'
  | 'Cần củng cố'
  | 'Đang luyện tập'
  | 'Đã xác nhận làm chủ';

export interface KnowledgeUnit {
  id: string; // e.g. "K01"
  code: string;
  title: string;
  description: string;
  prerequisites: string[]; // e.g. ["K01"]
  category: 'Cơ bản' | 'Thao tác' | 'Duyệt & Tìm kiếm' | 'Tổng hợp';
}

export interface DiagnosticQuestion {
  id: number;
  unitId: string;
  question: string;
  options: string[];
  correctAnswer: number; // index 0-3
  explanation: string;
}

export interface LearningTask {
  id: string;
  unitId: string;
  title: string;
  level: 'Cơ bản' | 'Trung bình' | 'Vận dụng';
  objective: string;
  requirement: string;
  inputData: string;
  expectedOutput: string;
  starterCode: string;
  testCases: { input: string; output: string }[];
}

export interface PathEditRecord {
  id: string;
  previousPath: string;
  previousLevel: 'Củng cố' | 'Luyện tập' | 'Vận dụng';
  updatedPath: string;
  updatedLevel: 'Củng cố' | 'Luyện tập' | 'Vận dụng';
  targetUnits?: string[];
  reason: string;
  timestamp: string;
  teacherName: string;
}

export interface StudentProfile {
  id: StudentProfileId;
  name: string;
  avatar: string;
  description: string;
  diagnosticScores: Record<string, number>; // unitId -> score %
  masteredUnits: string[]; // validated confirmed mastered (>=80% and all prereqs met)
  rawScoreMasteredUnits?: string[]; // raw score >= 80%
  isDiagnosticCompleted?: boolean; // false = Dữ liệu mô phỏng, true = Đã hoàn thành chẩn đoán
  diagnosticSource?: 'simulated_default' | 'preset_test' | 'real_test';
  diagnosticCompletedAt?: string;
  currentRecommendation: {
    path: string;
    level: 'Củng cố' | 'Luyện tập' | 'Vận dụng';
    rationale: string;
    status: 'Đã đề xuất' | 'Giáo viên đã duyệt' | 'Giáo viên đã sửa' | 'Tạm dừng' | 'Chờ kiểm duyệt';
    teacherNote?: string;
    pendingProposal?: {
      path: string;
      level: 'Củng cố' | 'Luyện tập' | 'Vận dụng';
      rationale: string;
      createdAt: string;
    };
  };
  pathEditHistory?: PathEditRecord[];
  submissionsCount: number;
}

export interface RubricCriterionScore {
  criteriaId: number;
  criteriaName: string;
  score: number | null; // 0-10, null nếu Chưa đủ dữ liệu đánh giá
  level: 'Đạt' | 'Cần cố gắng' | 'Chưa đạt' | 'Chưa đủ dữ liệu đánh giá';
  evidence: string;
}

export interface AIFeedbackContent {
  evidence: string;
  assessment: string;
  suggestion: string;
  socraticQuestion: string;
}

export interface CodeSubmission {
  id: string; // submissionId
  submissionId?: string;
  studentId: StudentProfileId;
  studentName: string;
  taskId: string;
  knowledgeUnitId?: string; // e.g. "K01"
  taskTitle: string;
  taskType?: 'central_benchmark' | 'regular';
  taskDescription?: string; // e.g. task.requirement
  learningObjectives?: string; // e.g. task.objective
  inputSpecification?: string; // e.g. task.inputData
  expectedOutput?: string; // e.g. task.expectedOutput
  assessmentCriteria?: string; // e.g. rubric criteria description
  code: string; // studentCode
  studentCode?: string;
  submittedAt: string; // submissionTime
  submissionTime?: string;
  overallScore: number | null;
  criteriaScores: RubricCriterionScore[];
  aiFeedback: AIFeedbackContent;
  errorCategory?: 'meeting_requirements' | 'syntax_error' | 'logic_error' | 'edge_case_error' | 'poor_structure';
  errorDescription?: string;
  analysisType?: 'static_analysis' | 'sandbox_execution';
  detectedIssues?: { type: 'confirmed' | 'suspected'; message: string; line?: number }[];
  teacherReview: {
    status: 'Chờ duyệt' | 'Đã duyệt' | 'Đã chỉnh sửa' | 'Đã ghi đè' | 'Từ chối phản hồi';
    reviewedBy?: string;
    reviewedAt?: string;
    teacherComment?: string;
    editReason?: string;
    rejectionReason?: string;
    editedFeedback?: AIFeedbackContent;
    independentScore?: number;
    independentComments?: string;
    reviewDurationMinutes?: number;
    traditionalDurationMinutes?: number;
    hasCriticalError?: boolean;
    criticalErrorDetails?: string;
    teacherVerificationLabel?: 'Đánh giá AI đúng' | 'Sai lệch đã xác minh' | 'Chưa đủ căn cứ';
    historicalAuditNote?: string;
    reEvaluation?: {
      version: string;
      reEvaluatedAt: string;
      newScore: number;
      rationale: string;
      linkedOriginalSubmissionId: string;
    };
    evidenceAccuracyVerified?: boolean;
    suggestionSuitabilityVerified?: boolean;
    actualRecordedReviewSeconds?: number;
  };
  da4SyncRecommendation?: {
    relatedUnits: string[];
    proposedScoreDelta: Record<string, number>;
    rationale: string;
    isApplied?: boolean;
    appliedAt?: string;
  };
  isSimulatedData: boolean;
  isSyntheticResearchSample?: boolean;
  datasetOrigin?: 'benchmark_standard' | 'acceptance_testing' | 'real_learner_research';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: 'teacher' | 'system' | 'student';
  action: string;
  details: string;
}

export interface StudentReviewRequest {
  id: string;
  studentId: StudentProfileId;
  studentName: string;
  message: string;
  status: 'Chờ xử lý' | 'Đã chấp nhận' | 'Đã điều chỉnh' | 'Đã từ chối';
  teacherResponse?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ResearchMetrics {
  adaptive: {
    expertAlignmentRate: number; // %
    taskCompletionRate: number; // %
    teacherOverrideCount: number;
    sensitivityThreshold: number; // e.g. 50%
    profileDisparityIndex: number; // e.g. 18.4%
  };
  aiFeedback: {
    aiTeacherConsensusRate: number; // %
    evidenceBasedRate: number; // %
    actionableSuggestionRate: number; // %
    criticalErrorCount: number;
    averageReviewTimeMinutes: number;
  };
}
