import { KNOWLEDGE_UNITS } from '../data/mockData';
import { generateAdaptiveRecommendation, computeMasteryMetrics, evaluateStudentProfile } from '../utils/adaptiveEngine';
import { DEMO_STUDENT_PROFILES } from '../data/mockData';
import { StudentProfile } from '../types';

interface TestResult {
  id: string;
  name: string;
  input: any;
  expected: any;
  actual: any;
  status: 'PASS' | 'FAIL';
  notes?: string;
}

const results: TestResult[] = [];

console.log('=== BẮT ĐẦU CHẠY BỘ KIỂM THỬ HỒI QUY TỰ ĐỘNG (ADAPTIVE LEARNING DA4) ===\n');

// TC09: Không có dữ liệu chẩn đoán
{
  const input = {};
  const rec = generateAdaptiveRecommendation(input, KNOWLEDGE_UNITS, false);
  const expectedPath = 'Chưa đủ dữ liệu để phân tuyến';
  const actual = rec.path;
  const status = actual === expectedPath ? 'PASS' : 'FAIL';
  results.push({
    id: 'TC09',
    name: 'Không có dữ liệu chẩn đoán',
    input,
    expected: expectedPath,
    actual,
    status
  });
}

// TC10: Chỉ có điểm K01 = 100%, thiếu 11 đơn vị còn lại
{
  const input = { K01: 100 };
  const rec = generateAdaptiveRecommendation(input, KNOWLEDGE_UNITS, true);
  // K01=100, nhưng K02-K04 thiếu (được tính là undefined -> 0 trong avg/filter)
  const actual = rec.level;
  const status = actual === 'Củng cố' ? 'PASS' : 'FAIL';
  results.push({
    id: 'TC10',
    name: 'Chỉ có điểm K01 = 100%, thiếu các đơn vị khác',
    input,
    expected: 'Củng cố (do thiếu đơn vị nền tảng K02-K04)',
    actual: `${actual} (${rec.path})`,
    status
  });
}

// TC12: K05 = 0%, 11 đơn vị khác = 90%
{
  const input: Record<string, number> = {};
  KNOWLEDGE_UNITS.forEach(u => {
    input[u.id] = u.id === 'K05' ? 0 : 90;
  });
  const mastery = computeMasteryMetrics(input, KNOWLEDGE_UNITS);
  const isK05Mastered = mastery.confirmedMasteredUnits.includes('K05');
  const status = isK05Mastered === false ? 'PASS' : 'FAIL';
  results.push({
    id: 'TC12',
    name: 'K05 = 0%, 11 đơn vị khác = 90%',
    input: 'K05=0, K01-K04,K06-K12=90',
    expected: 'K05 không được xác nhận làm chủ (do điểm 0% và phụ thuộc K03, K04)',
    actual: `K05 mastered: ${isK05Mastered}`,
    status
  });
}

// TC13: K06 = 0%, K07 = 100%, K08 = 0%
{
  const input: Record<string, number> = {};
  KNOWLEDGE_UNITS.forEach(u => {
    input[u.id] = 85;
  });
  input['K06'] = 0;
  input['K07'] = 100;
  input['K08'] = 0;
  const rec = generateAdaptiveRecommendation(input, KNOWLEDGE_UNITS, true);
  const status = rec.level === 'Củng cố' ? 'PASS' : 'FAIL';
  results.push({
    id: 'TC13',
    name: 'K06 = 0%, K07 = 100%, K08 = 0%',
    input: 'K06=0, K07=100, K08=0, còn lại=85',
    expected: 'Mức Củng cố (do K06, K08 dưới 50% kéo trung bình nhóm mutation xuống)',
    actual: `${rec.level}: ${rec.path}`,
    status
  });
}

// Thêm kịch bản kiểm tra bảo vệ quyết định giáo viên (Pending Proposal)
{
  const profile: StudentProfile = {
    ...DEMO_STUDENT_PROFILES.HS02,
    currentRecommendation: {
      level: 'Củng cố',
      path: 'Lộ trình Củng cố do giáo viên chỉnh sửa',
      rationale: 'Giáo viên đã chỉ định',
      status: 'Giáo viên đã sửa'
    }
  };

  const newScores = { K01: 95, K02: 95, K03: 95, K04: 95, K05: 90, K06: 90, K07: 90, K08: 90, K09: 90, K10: 90, K11: 90, K12: 90 };
  const mastery = computeMasteryMetrics(newScores, KNOWLEDGE_UNITS);
  const newRec = generateAdaptiveRecommendation(newScores, KNOWLEDGE_UNITS, true);

  // Giả lập logic trong App.tsx khi có kết quả mới mà giáo viên đã duyệt/sửa
  const isTeacherApproved = profile.currentRecommendation.status === 'Giáo viên đã duyệt' || profile.currentRecommendation.status === 'Giáo viên đã sửa';
  
  const updatedProfile: StudentProfile = {
    ...profile,
    diagnosticScores: newScores,
    currentRecommendation: isTeacherApproved ? {
      ...profile.currentRecommendation,
      pendingProposal: {
        path: newRec.path,
        level: newRec.level,
        rationale: newRec.rationale,
        createdAt: new Date().toLocaleString()
      }
    } : {
      path: newRec.path,
      level: newRec.level,
      rationale: newRec.rationale,
      status: 'Chờ kiểm duyệt'
    }
  };

  const officialLevelMaintained = updatedProfile.currentRecommendation.level === 'Củng cố';
  const hasPendingProposal = !!updatedProfile.currentRecommendation.pendingProposal;
  const status = officialLevelMaintained && hasPendingProposal ? 'PASS' : 'FAIL';

  results.push({
    id: 'TC15_PROTECT_TEACHER',
    name: 'Giáo viên đã sửa lộ trình, học sinh nộp bài mới đề xuất Vận dụng',
    input: 'Profile HS02 (status: Giáo viên đã sửa) nhận kết quả Vận dụng mới',
    expected: 'Lộ trình chính thức vẫn giữ Củng cố, tạo pendingProposal Vận dụng',
    actual: `Official Level: ${updatedProfile.currentRecommendation.level}, Pending Level: ${updatedProfile.currentRecommendation.pendingProposal?.level}`,
    status
  });
}

// In kết quả kiểm thử
console.table(results.map(r => ({ ID: r.id, Test: r.name, Status: r.status })));
results.forEach(r => {
  console.log(`[${r.status}] ${r.id}: ${r.name}`);
  console.log(`  - Expected: ${JSON.stringify(r.expected)}`);
  console.log(`  - Actual:   ${JSON.stringify(r.actual)}`);
});

const total = results.length;
const passed = results.filter(r => r.status === 'PASS').length;
const failed = total - passed;
console.log(`\nTổng kết: ${passed}/${total} PASS, ${failed} FAIL.`);
