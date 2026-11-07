import { KnowledgeUnit, StudentProfile, UnitMasteryStatus } from '../types';

export interface MasteryMetrics {
  rawScoreUnits: string[]; // score >= 80%
  confirmedMasteredUnits: string[]; // score >= 80% AND all prerequisites confirmed
  unconfirmedDueToPrereq: { unitId: string; missingPrereqs: string[] }[];
  rawScoreCount: number;
  confirmedMasteredCount: number;
}

/**
 * Tính toán số đơn vị đạt chuẩn làm chủ (ngưỡng >= 80%)
 * Phân biệt rõ ràng:
 * 1. Đạt ngưỡng điểm thành phần (Raw Score >= 80%)
 * 2. Xác nhận làm chủ năng lực (Validated Mastery: điểm >= 80% VÀ toàn bộ kiến thức tiên quyết đã được xác nhận làm chủ)
 */
export function computeMasteryMetrics(
  scores: Record<string, number>,
  units: KnowledgeUnit[]
): MasteryMetrics {
  const unitMap = new Map(units.map(u => [u.id, u]));
  const rawScoreUnits = units.filter(u => (scores[u.id] ?? 0) >= 80).map(u => u.id);

  // Thuật toán kiểm tra điều kiện tiên quyết dạng đồ thị có hướng (DAG)
  const confirmedSet = new Set<string>();
  let added = true;
  while (added) {
    added = false;
    for (const u of units) {
      if (!confirmedSet.has(u.id) && (scores[u.id] ?? 0) >= 80) {
        const prereqsMet = u.prerequisites.every(p => confirmedSet.has(p));
        if (prereqsMet) {
          confirmedSet.add(u.id);
          added = true;
        }
      }
    }
  }

  const confirmedMasteredUnits = Array.from(confirmedSet);
  const unconfirmedDueToPrereq: { unitId: string; missingPrereqs: string[] }[] = [];

  for (const uid of rawScoreUnits) {
    if (!confirmedSet.has(uid)) {
      const u = unitMap.get(uid);
      const missing = u ? u.prerequisites.filter(p => !confirmedSet.has(p)) : [];
      unconfirmedDueToPrereq.push({ unitId: uid, missingPrereqs: missing });
    }
  }

  return {
    rawScoreUnits,
    confirmedMasteredUnits,
    unconfirmedDueToPrereq,
    rawScoreCount: rawScoreUnits.length,
    confirmedMasteredCount: confirmedMasteredUnits.length,
  };
}

/**
 * Xác định chính xác 1 trong 5 trạng thái năng lực sư phạm của từng đơn vị kiến thức:
 * 1. "Chưa được kiểm tra": Khi chưa có dữ liệu điểm.
 * 2. "Chưa đủ bằng chứng": Khi điểm đạt >= 80% nhưng bị chặn bởi điều kiện tiên quyết trong DAG.
 * 3. "Cần củng cố": Khi điểm < 50%.
 * 4. "Đang luyện tập": Khi điểm nằm trong khoảng 50% đến dưới 80%.
 * 5. "Đã xác nhận làm chủ": Khi điểm >= 80% và toàn bộ chuỗi tiên quyết đã được xác nhận làm chủ.
 */
export function getUnitMasteryStatus(
  unitId: string,
  scores: Record<string, number>,
  mastery: MasteryMetrics,
  isDiagnosticCompleted?: boolean
): UnitMasteryStatus {
  if (scores[unitId] === undefined) {
    return 'Chưa được kiểm tra';
  }

  const score = scores[unitId];

  if (mastery.confirmedMasteredUnits.includes(unitId)) {
    return 'Đã xác nhận làm chủ';
  }

  if (score >= 80) {
    // Đạt điểm nhưng chưa thỏa mãn tiên quyết DAG
    return 'Chưa đủ bằng chứng';
  }

  if (score >= 50) {
    return 'Đang luyện tập';
  }

  return 'Cần củng cố';
}

export interface RecommendationResult {
  path: string;
  level: 'Củng cố' | 'Luyện tập' | 'Vận dụng';
  rationale: string;
  status: 'Chờ kiểm duyệt' | 'Đã đề xuất';
}

/**
 * Thuật toán phân tuyến thích ứng DA4 theo mô hình đồ thị có hướng (DAG):
 * Phân tích vùng phát triển gần nhất (Zone of Proximal Development - ZPD) của học sinh:
 * - Nhóm Nền tảng (Foundational: K01–K04): Bắt buộc đạt chuẩn trước khi thao tác.
 * - Nhóm Biến đổi danh sách (Mutation: K06–K08: append, insert, remove, pop): Đánh giá trung bình K06–K08.
 * - Nhóm Duyệt danh sách (Iteration: K09–K10: for, range(len)): Khi K01–K08 đã làm chủ, vùng này là frontier tiếp nối.
 * - Nhóm Tìm kiếm & Xử lý (Synthesis: K11–K12): Phụ thuộc K09, K10.
 * - Ngưỡng Vận dụng: Toàn bộ 12 đơn vị đạt >= 80% và thỏa mãn mọi tiên quyết.
 */
export function generateAdaptiveRecommendation(
  scores: Record<string, number>,
  units: KnowledgeUnit[],
  isRealDiagnostic: boolean
): RecommendationResult {
  if (!scores || Object.keys(scores).length === 0) {
    return {
      level: 'Củng cố',
      path: 'Chưa đủ dữ liệu để phân tuyến',
      rationale: 'Học sinh chưa hoàn thành bài kiểm tra chẩn đoán 24 câu hỏi. Vui lòng hoàn thành bài chẩn đoán để hệ thống phân tích lộ trình học tập thích ứng chính xác.',
      status: 'Chờ kiểm duyệt'
    };
  }

  const mastery = computeMasteryMetrics(scores, units);

  const foundational = ['K01', 'K02', 'K03', 'K04'];
  const mutationOps = ['K06', 'K07', 'K08'];
  const iterationOps = ['K09', 'K10'];
  const synthesisOps = ['K11', 'K12'];

  const getAvg = (ids: string[]) => {
    const sum = ids.reduce((acc, id) => acc + (scores[id] ?? 0), 0);
    return Math.round((sum / ids.length) * 10) / 10;
  };

  const foundationalAvg = getAvg(foundational);
  const mutationAvg = getAvg(mutationOps);
  const iterationAvg = getAvg(iterationOps);
  const synthesisAvg = getAvg(synthesisOps);

  const weakFoundational = foundational.filter(id => (scores[id] ?? 0) < 50);

  // 1. Kiểm tra nhóm kiến thức nền tảng (K01–K04) - Điển hình: HS01
  if (weakFoundational.length > 0 || foundationalAvg < 50) {
    return {
      level: 'Củng cố',
      path: 'Củng cố toàn diện các đơn vị nền tảng K01 đến K04 (Khái niệm, Khởi tạo, Chỉ số, Hàm len).',
      rationale: `Các đơn vị nền tảng [${weakFoundational.join(', ')}] có điểm dưới 50% (ngưỡng Củng cố <50%, trung bình nhóm đạt ${foundationalAvg}%). Theo quy tắc tiên quyết, học sinh cần củng cố vững nền tảng trước khi chuyển sang các kỹ năng thao tác tiếp theo.`,
      status: 'Chờ kiểm duyệt'
    };
  }

  // 2. Kiểm tra nhóm thao tác biến đổi danh sách K06–K08 (thêm, chèn, xóa) - Điển hình: HS02
  const weakMutation = mutationOps.filter(id => (scores[id] ?? 0) < 50);
  if (mutationAvg < 50 || weakMutation.length >= 2) {
    return {
      level: 'Củng cố',
      path: 'Củng cố nhóm thao tác thêm/xóa phần tử append(), insert(), remove() và pop() (K06–K08).',
      rationale: `Điểm K06 (${scores['K06'] ?? 0}%) và K07 (${scores['K07'] ?? 0}%) dưới 50%. Điểm K08 đạt ${scores['K08'] ?? 0}% (ngưỡng tối thiểu Luyện tập). Điểm trung bình nhóm thao tác biến đổi K06–K08 là ${mutationAvg}% (<50%). Căn cứ quy tắc phân tuyến dưới 50% là Củng cố, hệ thống đề xuất mức Củng cố cho nhóm kỹ năng này.`,
      status: 'Chờ kiểm duyệt'
    };
  }

  if (mutationAvg >= 50 && mutationAvg < 80) {
    return {
      level: 'Luyện tập',
      path: 'Luyện tập chuyên sâu các phương thức thao tác danh sách (K06–K08: append, insert, remove, pop).',
      rationale: `Điểm nhóm thao tác biến đổi danh sách K06–K08 đạt trung bình ${mutationAvg}% (thuộc ngưỡng Luyện tập từ 50% đến dưới 80%). Cần thực hành thêm bài tập để nâng cao độ thành thạo trước khi chuyển sang kỹ thuật duyệt for.`,
      status: 'Chờ kiểm duyệt'
    };
  }

  // 3. Kiểm tra nhóm kỹ thuật duyệt danh sách K09–K10 - Điển hình: HS03
  // Học sinh đã làm chủ nền tảng K01–K04 và thao tác cơ bản K05–K08 (đều >= 80%)
  const weakIteration = iterationOps.filter(id => (scores[id] ?? 0) < 50);
  if (iterationAvg < 50 || weakIteration.length > 0) {
    return {
      level: 'Củng cố',
      path: 'Củng cố kỹ thuật duyệt danh sách bằng vòng lặp for (K09) và duyệt theo chỉ số (K10).',
      rationale: `Các đơn vị duyệt danh sách [${weakIteration.join(', ')}] có điểm dưới 50% (trung bình nhóm ${iterationAvg}%). Cần củng cố cách viết cú pháp vòng lặp for item in list và range(len(list)).`,
      status: 'Chờ kiểm duyệt'
    };
  }

  if (iterationAvg >= 50 && iterationAvg < 80) {
    return {
      level: 'Luyện tập',
      path: 'Luyện tập chuyên sâu kỹ thuật duyệt danh sách K09–K10 và tìm kiếm K11 (Điểm trong khoảng 50%–79%).',
      rationale: `Thao tác danh sách cơ bản (K01–K08) đã được xác nhận làm chủ (≥80%). Tại vùng kiến thức tiếp nối, các đơn vị duyệt danh sách K09 (${scores['K09'] ?? 0}%) và K10 (${scores['K10'] ?? 0}%) đều đạt từ 50% đến dưới 80% (trung bình nhóm đạt ${iterationAvg}%). Theo quy tắc thích ứng ZPD, học sinh được phân tuyến mức Luyện tập để hoàn thiện kỹ năng duyệt vòng lặp trước khi giải quyết các bài toán tổng hợp (K11, K12).`,
      status: 'Chờ kiểm duyệt'
    };
  }

  // 4. Kiểm tra nhóm tìm kiếm và tổng hợp xử lý dữ liệu K11–K12
  const weakSynthesis = synthesisOps.filter(id => (scores[id] ?? 0) < 50);
  if (synthesisAvg < 50 || weakSynthesis.length > 0) {
    return {
      level: 'Củng cố',
      path: 'Củng cố kỹ năng tìm kiếm in/count và hàm tổng hợp sum/max/min (K11–K12).',
      rationale: `Nhóm kiến thức tìm kiếm và tổng hợp xử lý dữ liệu K11–K12 có điểm dưới 50% (trung bình ${synthesisAvg}%). Cần bổ sung kiến thức về hàm thống kê và toán tử tìm kiếm.`,
      status: 'Chờ kiểm duyệt'
    };
  }

  if (synthesisAvg >= 50 && synthesisAvg < 80) {
    return {
      level: 'Luyện tập',
      path: 'Luyện tập các bài toán tìm kiếm và xử lý dữ liệu tổng hợp (K11–K12).',
      rationale: `Nhóm kỹ năng tìm kiếm và xử lý dữ liệu đạt trung bình ${synthesisAvg}% (ngưỡng Luyện tập từ 50% đến dưới 80%). Cần thực hành thêm bài toán xử lý danh sách thực tế.`,
      status: 'Chờ kiểm duyệt'
    };
  }

  // 5. Kiểm tra toàn bộ 12 đơn vị đạt >= 80% và thỏa mãn mọi tiên quyết DAG - Điển hình: HS04
  if (mastery.confirmedMasteredCount === 12) {
    return {
      level: 'Vận dụng',
      path: 'Thực hiện các nhiệm vụ Vận dụng cao (T09–T12) và dự án tổng hợp xử lý dữ liệu thực tế.',
      rationale: 'Toàn bộ 12 đơn vị kiến thức đạt điểm ≥80% (ngưỡng Vận dụng) và đã được xác nhận đáp ứng đầy đủ chuỗi kiến thức tiên quyết theo đồ thị DAG.',
      status: 'Chờ kiểm duyệt'
    };
  }

  // Mặc định luyện tập nếu chưa đủ điều kiện vận dụng hoàn toàn
  return {
    level: 'Luyện tập',
    path: 'Luyện tập củng cố các nội dung kiến thức nâng cao.',
    rationale: 'Học sinh đã hoàn thành các kỹ năng cơ bản, đang luyện tập hoàn thiện các đơn vị kiến thức chuyên sâu.',
    status: 'Chờ kiểm duyệt'
  };
}

/**
 * Đánh giá lại toàn bộ hồ sơ học sinh (topological mastery và recommendation).
 */
export function evaluateStudentProfile(
  profile: StudentProfile,
  units: KnowledgeUnit[] = []
): StudentProfile {
  const defaultUnits: KnowledgeUnit[] = [
    { id: 'K01', code: 'K01', title: 'Khái niệm danh sách', description: '', prerequisites: [], category: 'Cơ bản' },
    { id: 'K02', code: 'K02', title: 'Khởi tạo danh sách', description: '', prerequisites: ['K01'], category: 'Cơ bản' },
    { id: 'K03', code: 'K03', title: 'Chỉ số phần tử', description: '', prerequisites: ['K02'], category: 'Cơ bản' },
    { id: 'K04', code: 'K04', title: 'Hàm len()', description: '', prerequisites: ['K02'], category: 'Cơ bản' },
    { id: 'K05', code: 'K05', title: 'Truy cập và thay đổi phần tử', description: '', prerequisites: ['K03', 'K04'], category: 'Thao tác' },
    { id: 'K06', code: 'K06', title: 'Thêm phần tử append()', description: '', prerequisites: ['K02'], category: 'Thao tác' },
    { id: 'K07', code: 'K07', title: 'Chèn phần tử insert()', description: '', prerequisites: ['K03', 'K06'], category: 'Thao tác' },
    { id: 'K08', code: 'K08', title: 'Xóa phần tử remove(), pop()', description: '', prerequisites: ['K05', 'K06'], category: 'Thao tác' },
    { id: 'K09', code: 'K09', title: 'Duyệt danh sách bằng for', description: '', prerequisites: ['K02'], category: 'Duyệt & Tìm kiếm' },
    { id: 'K10', code: 'K10', title: 'Duyệt theo chỉ số', description: '', prerequisites: ['K03', 'K04', 'K09'], category: 'Duyệt & Tìm kiếm' },
    { id: 'K11', code: 'K11', title: 'Tìm kiếm trong danh sách', description: '', prerequisites: ['K09'], category: 'Duyệt & Tìm kiếm' },
    { id: 'K12', code: 'K12', title: 'Tổng hợp và xử lý dữ liệu', description: '', prerequisites: ['K08', 'K10', 'K11'], category: 'Tổng hợp' }
  ];

  const targetUnits = units.length > 0 ? units : defaultUnits;
  const mastery = computeMasteryMetrics(profile.diagnosticScores, targetUnits);
  const rec = generateAdaptiveRecommendation(profile.diagnosticScores, targetUnits, profile.isDiagnosticCompleted ?? false);

  return {
    ...profile,
    masteredUnits: mastery.confirmedMasteredUnits,
    rawScoreMasteredUnits: mastery.rawScoreUnits,
    currentRecommendation: {
      path: rec.path,
      level: rec.level,
      rationale: rec.rationale,
      status: profile.currentRecommendation.status === 'Giáo viên đã duyệt' ? 'Giáo viên đã duyệt' : 'Chờ kiểm duyệt',
      teacherNote: profile.currentRecommendation.teacherNote
    }
  };
}
