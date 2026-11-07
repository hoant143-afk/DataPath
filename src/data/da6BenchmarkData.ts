import { LearningTask, CodeSubmission } from '../types';
import { calculateWeightedRubricScore } from '../utils/da6Engine';

/**
 * NHIỆM VỤ LẬP TRÌNH MẪU TRUNG TÂM (CENTRAL BENCHMARK TASK) - DỰ ÁN 6
 * Toàn bộ 15 bài kiểm thử và nghiên cứu đối chiếu DA6 sử dụng chung đặc tả này.
 */
export const CENTRAL_BENCHMARK_TASK: LearningTask = {
  id: 'TASK-DA6-CENTRAL',
  unitId: 'K12',
  title: 'Xử lý danh sách số nguyên trong Python',
  level: 'Vận dụng',
  objective: 'Vận dụng kiến thức danh sách (khởi tạo, duyệt for, điều kiện if, hàm len, sum, max) để giải quyết bài toán xử lý số liệu hoàn chỉnh.',
  requirement: `Học sinh nhập số nguyên không âm n (n >= 0). Sau đó nhập n số nguyên vào danh sách A.
Hãy lập trình giải quyết 4 yêu cầu:
1. Tính tổng các phần tử trong danh sách (nếu rỗng thì Tổng = 0).
2. Đếm số lượng phần tử chẵn trong danh sách.
3. Xác định phần tử lớn nhất nếu danh sách không rỗng.
4. Xử lý đúng trường hợp danh sách rỗng (n = 0): in "Danh sach rong, khong co phan tu lon nhat".`,
  inputData: `Dòng 1: Số nguyên n (n >= 0).
n dòng tiếp theo (nếu n > 0): mỗi dòng chứa một số nguyên.`,
  expectedOutput: `Tong: <tổng các phần tử>
So phan tu chan: <số lượng số chẵn>
Phan tu lon nhat: <giá trị lớn nhất> (hoặc thông báo rỗng nếu n = 0)`,
  starterCode: `# Nhập số lượng phần tử n
n = int(input())

# TODO: Nhập n phần tử vào danh sách và xử lý 4 yêu cầu
`,
  testCases: [
    { input: '5\n2\n7\n4\n9\n6', output: 'Tong: 28\nSo phan tu chan: 3\nPhan tu lon nhat: 9' },
    { input: '4\n-3\n-8\n5\n2', output: 'Tong: -4\nSo phan tu chan: 2\nPhan tu lon nhat: 5' },
    { input: '3\n-10\n-5\n-20', output: 'Tong: -35\nSo phan tu chan: 2\nPhan tu lon nhat: -5' },
    { input: '0', output: 'Tong: 0\nSo phan tu chan: 0\nDanh sach rong, khong co phan tu lon nhat' },
    { input: '1\n-7', output: 'Tong: -7\nSo phan tu chan: 0\nPhan tu lon nhat: -7' }
  ]
};

export const REFERENCE_PYTHON_SOLUTION = `# LỜI GIẢI CHUẨN (REFERENCE SOLUTION)
n = int(input())
if n == 0:
    print("Tong: 0")
    print("So phan tu chan: 0")
    print("Danh sach rong, khong co phan tu lon nhat")
else:
    a = []
    for _ in range(n):
        a.append(int(input()))
    
    total = sum(a)
    even_count = 0
    for x in a:
        if x % 2 == 0:
            even_count += 1
            
    max_val = max(a)
    
    print(f"Tong: {total}")
    print(f"So phan tu chan: {even_count}")
    print(f"Phan tu lon nhat: {max_val}")`;

/**
 * ĐẶC TẢ RUBRIC 5 TIÊU CHÍ ĐÁNH GIÁ DA6
 */
export const DA6_RUBRIC_SPECIFICATION = [
  {
    id: 1,
    name: 'Đáp ứng yêu cầu bài toán',
    weight: 20,
    levels: {
      excellent: 'Thực hiện đầy đủ cả 4 yêu cầu: tính tổng, đếm số chẵn, tìm max và xử lý danh sách rỗng.',
      good: 'Thực hiện được 2-3 yêu cầu, bỏ sót hoặc sai 1 yêu cầu (thường là trường hợp rỗng).',
      poor: 'Chỉ thực hiện được 1 yêu cầu hoặc sai hoàn toàn đặc tả đề bài.'
    }
  },
  {
    id: 2,
    name: 'Tính đúng đắn của thuật toán',
    weight: 25,
    levels: {
      excellent: 'Thuật toán chính xác trong mọi tình huống (số âm, số 0, số dương, chia dư % 2 == 0).',
      good: 'Có lỗi logic nhỏ (ví dụ khởi tạo max_val = 0 sai khi mảng toàn số âm, nhầm phép chia).',
      poor: 'Thuật toán sai lệch bản chất, vòng lặp sai điều kiện hoặc biến đếm không cập nhật.'
    }
  },
  {
    id: 3,
    name: 'Khả năng xử lý trường hợp biên',
    weight: 20,
    levels: {
      excellent: 'Kiểm tra chặt chẽ điều kiện n == 0 trước khi truy xuất phần tử; xử lý đúng mảng toàn âm.',
      good: 'Chưa bọc điều kiện kiểm tra rỗng, có thể gặp lỗi crash (ValueError/IndexError) khi n = 0.',
      poor: 'Bỏ qua hoàn toàn các trường hợp biên, mã sụp đổ khi dữ liệu đầu vào đặc biệt.'
    }
  },
  {
    id: 4,
    name: 'Cấu trúc, tính dễ đọc và hợp lý của mã nguồn',
    weight: 20,
    levels: {
      excellent: 'Tuân thủ chuẩn PEP 8: thụt lề 4 khoảng trắng nhất quán, đặt tên biến rõ nghĩa (total, even_count, max_val).',
      good: 'Đặt tên biến ngắn tùy tiện (a, b, x, y) nhưng cấu trúc mã vẫn chạy được.',
      poor: 'Vi phạm thụt lề, lồng ghép lệnh rối rắm, viết code thừa hoặc lặp lệnh không cần thiết.'
    }
  },
  {
    id: 5,
    name: 'Khả năng giải thích và cải thiện dựa trên minh chứng quá trình',
    weight: 15,
    levels: {
      excellent: 'Có ghi chú (comments) giải thích rõ ràng ý định thuật toán hoặc phân tích trường hợp biên.',
      good: 'Có chú thích sơ sài nhưng chưa thể hiện rõ quá trình tư duy hoặc cải thiện.',
      insufficient: 'Chưa đủ dữ liệu đánh giá: Học sinh chỉ nộp mã nguồn đơn thuần, không có lịch sử chỉnh sửa hay ghi chú quá trình.'
    }
  }
];

/**
 * BỘ 15 BÀI LẬP TRÌNH GIẢ LẬP PHỤC VỤ NGHIÊN CỨU VÀ KIỂM THỬ DA6
 * Nhãn: DỮ LIỆU MÔ PHỎNG PHỤC VỤ KIỂM THỬ
 */
const RAW_DA6_15_BENCHMARK_SUBMISSIONS: CodeSubmission[] = [
  // ==========================================
  // NHÓM 1: 3 BÀI ĐÁP ỨNG YÊU CẦU (MEETING REQUIREMENTS)
  // ==========================================
  {
    id: 'SUB-DA6-01',
    studentId: 'HS04',
    studentName: 'Phạm Minh Dung (HS04)',
    taskId: 'TASK-DA6-CENTRAL',
    taskTitle: 'Xử lý danh sách số nguyên trong Python',
    taskType: 'central_benchmark',
    errorCategory: 'meeting_requirements',
    errorDescription: 'Bài làm xuất sắc, xử lý đầy đủ 4 yêu cầu bằng vòng lặp chuẩn.',
    code: `n = int(input())
if n == 0:
    print("Tong: 0")
    print("So phan tu chan: 0")
    print("Danh sach rong, khong co phan tu lon nhat")
else:
    numbers = []
    for _ in range(n):
        numbers.append(int(input()))
    
    total = sum(numbers)
    even_count = 0
    for x in numbers:
        if x % 2 == 0:
            even_count += 1
            
    max_val = max(numbers)
    print(f"Tong: {total}")
    print(f"So phan tu chan: {even_count}")
    print(f"Phan tu lon nhat: {max_val}")`,
    submittedAt: '2026-10-31 08:30:00',
    overallScore: 9.2,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 10, level: 'Đạt', evidence: 'Đáp ứng đầy đủ 4 yêu cầu: tính tổng, đếm chẵn, max và xử lý rỗng n=0.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 10, level: 'Đạt', evidence: 'Sử dụng sum(), max() và phép chia dư x % 2 == 0 hoàn toàn chính xác.' },
      { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 10, level: 'Đạt', evidence: 'Kiểm tra if n == 0 ngay từ đầu, tránh hoàn toàn lỗi rỗng.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 9, level: 'Đạt', evidence: 'Tên biến rõ ràng (numbers, total, even_count, max_val), thụt lề chuẩn PEP 8.' },
      { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Học sinh chỉ nộp mã nguồn hoàn chỉnh, không kèm chú thích hay lịch sử nháp.' }
    ],
    aiFeedback: {
      evidence: 'Mã nguồn kiểm tra chặt chẽ điều kiện if n == 0 (dòng 2) và tính toán chính xác trên biến numbers.',
      assessment: 'Bài làm hoàn hảo, đáp ứng xuất sắc mọi yêu cầu của bài toán xử lý danh sách.',
      suggestion: 'Em có thể tìm hiểu thêm List Comprehension như len([x for x in numbers if x % 2 == 0]) để viết ngắn gọn hơn.',
      socraticQuestion: 'Nếu số lượng phần tử n lên tới hàng triệu, việc duyệt danh sách 2 lần (sum và đếm chẵn) có thể gộp thành 1 vòng lặp để tối ưu không?'
    },
    analysisType: 'static_analysis',
    detectedIssues: [],
    teacherReview: {
      status: 'Đã duyệt',
      reviewedBy: 'Cô giáo Nguyễn Thanh Hương',
      reviewedAt: '2026-10-31 08:45:00',
      independentScore: 9.5,
      independentComments: 'Bài làm rất chuẩn, tư duy mạch lạc và xử lý rỗng mẫu mực.',
      teacherComment: 'Đồng ý với phân tích của AI. Bài mẫu điểm cao của lớp.',
      reviewDurationMinutes: 1.5,
      traditionalDurationMinutes: 6.0,
      hasCriticalError: false
    },
    da4SyncRecommendation: {
      relatedUnits: ['K04', 'K06', 'K09', 'K12'],
      proposedScoreDelta: { K12: 5, K09: 5 },
      rationale: 'Học sinh thể hiện sự thành thạo trọn vẹn trong thao tác duyệt danh sách và tổng hợp dữ liệu.'
    },
    isSimulatedData: true
  },
  {
    id: 'SUB-DA6-02',
    studentId: 'HS04',
    studentName: 'Phạm Minh Dung (HS04)',
    taskId: 'TASK-DA6-CENTRAL',
    taskTitle: 'Xử lý danh sách số nguyên trong Python',
    taskType: 'central_benchmark',
    errorCategory: 'meeting_requirements',
    errorDescription: 'Sử dụng list comprehension và hàm có sẵn hiệu quả cao.',
    code: `n = int(input())
nums = [int(input()) for _ in range(n)]

print("Tong:", sum(nums))
print("So phan tu chan:", len([x for x in nums if x % 2 == 0]))
if nums:
    print("Phan tu lon nhat:", max(nums))
else:
    print("Danh sach rong, khong co phan tu lon nhat")`,
    submittedAt: '2026-10-31 08:35:00',
    overallScore: 9.5,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 10, level: 'Đạt', evidence: 'Xuất đầy đủ 4 thông tin đúng yêu cầu đề bài.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 10, level: 'Đạt', evidence: 'Thuật toán tối ưu, cú pháp Pythonic chuẩn xác.' },
      { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 10, level: 'Đạt', evidence: 'Sử dụng if nums để kiểm tra tính rỗng của danh sách.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 10, level: 'Đạt', evidence: 'Mã cực kỳ ngắn gọn, hiện đại, trình bày sạch sẽ.' },
      { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có ghi chú quá trình sửa lỗi hay nhật ký thực hành.' }
    ],
    aiFeedback: {
      evidence: 'Sử dụng List Comprehension ở dòng 2 và dòng 5 kết hợp điều kiện if nums: (dòng 6).',
      assessment: 'Giải pháp xuất sắc, áp dụng phong cách lập trình Python hiện đại (Pythonic).',
      suggestion: 'Em có thể bổ sung chú thích ngắn để bạn bè cùng nhóm học tập có thể đọc hiểu cách viết ngắn này.',
      socraticQuestion: 'Trong Python, vì sao câu lệnh if nums lại tương đương với if len(nums) > 0?'
    },
    analysisType: 'static_analysis',
    detectedIssues: [],
    teacherReview: {
      status: 'Đã duyệt',
      reviewedBy: 'Cô giáo Nguyễn Thanh Hương',
      reviewedAt: '2026-10-31 08:50:00',
      independentScore: 9.5,
      independentComments: 'Cách viết rất gọn và hiện đại, thể hiện năng lực Python nâng cao.',
      teacherComment: 'Duyệt phản hồi AI. Khen ngợi học sinh.',
      reviewDurationMinutes: 1.2,
      traditionalDurationMinutes: 5.5,
      hasCriticalError: false
    },
    da4SyncRecommendation: {
      relatedUnits: ['K09', 'K11', 'K12'],
      proposedScoreDelta: { K12: 5 },
      rationale: 'Học sinh thành thạo cú pháp lọc và xử lý danh sách nâng cao.'
    },
    isSimulatedData: true
  },
  {
    id: 'SUB-DA6-03',
    studentId: 'HS03',
    studentName: 'Lê Hoàng Cường (HS03)',
    taskId: 'TASK-DA6-CENTRAL',
    taskTitle: 'Xử lý danh sách số nguyên trong Python',
    taskType: 'central_benchmark',
    errorCategory: 'meeting_requirements',
    errorDescription: 'Triển khai thuật toán 1 vòng lặp duy nhất kèm chú thích quá trình giải bài.',
    code: `# Buoc 1: Nhap so luong phan tu
n = int(input())

if n == 0:
    print("Tong: 0")
    print("So phan tu chan: 0")
    print("Danh sach rong, khong co phan tu lon nhat")
else:
    # Buoc 2: Vua nhap vua tinh tong, chan, max de toi uu bo nho
    first_val = int(input())
    total = first_val
    even_count = 1 if first_val % 2 == 0 else 0
    max_val = first_val
    
    for _ in range(n - 1):
        x = int(input())
        total += x
        if x % 2 == 0:
            even_count += 1
        if x > max_val:
            max_val = x
            
    print("Tong:", total)
    print("So phan tu chan:", even_count)
    print("Phan tu lon nhat:", max_val)`,
    submittedAt: '2026-10-31 08:40:00',
    overallScore: 9.6,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 10, level: 'Đạt', evidence: 'Đáp ứng đầy đủ 4 yêu cầu bài toán.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 10, level: 'Đạt', evidence: 'Thuật toán 1 lượt (Single pass) tối ưu độ phức tạp thời gian O(n).' },
      { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 10, level: 'Đạt', evidence: 'Xử lý n=0 trước khi đọc first_val, khởi tạo max_val bằng first_val giúp đúng cả khi toàn số âm.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 9, level: 'Đạt', evidence: 'Thụt lề chuẩn xác, đặt tên biến gợi ý nghĩa.' },
      { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: 9, level: 'Đạt', evidence: 'Có chú thích giải thích rõ ràng các bước và tư duy tối ưu hóa thuật toán.' }
    ],
    aiFeedback: {
      evidence: 'Có chú thích quá trình từng bước (# Buoc 1, # Buoc 2) và khởi tạo max_val = first_val tránh lỗi mảng âm.',
      assessment: 'Rất đáng khen ngợi! Em vừa giải đúng, vừa tối ưu chỉ dùng 1 vòng lặp và có minh chứng quá trình giải thích rõ ràng.',
      suggestion: 'Cách giải này rất tốt cho mảng lớn, em có thể lưu lại mảng numbers nếu sau này bài toán yêu cầu in lại danh sách.',
      socraticQuestion: 'Vì sao việc khởi tạo max_val = first_val lại an toàn hơn khởi tạo max_val = 0 khi danh sách có toàn số âm?'
    },
    analysisType: 'static_analysis',
    detectedIssues: [],
    teacherReview: {
      status: 'Đã duyệt',
      reviewedBy: 'Cô giáo Nguyễn Thanh Hương',
      reviewedAt: '2026-10-31 09:00:00',
      independentScore: 9.8,
      independentComments: 'Học sinh duy nhất có chú thích tư duy quá trình và tối ưu hóa single pass.',
      teacherComment: 'Rất hài lòng với phản hồi AI và chất lượng bài làm của em Cường.',
      reviewDurationMinutes: 1.8,
      traditionalDurationMinutes: 7.0,
      hasCriticalError: false
    },
    da4SyncRecommendation: {
      relatedUnits: ['K09', 'K10', 'K12'],
      proposedScoreDelta: { K09: 10, K10: 10, K12: 10 },
      rationale: 'Học sinh làm chủ kỹ năng vòng lặp và xử lý max/sum/đếm chẵn ở mức vận dụng cao.'
    },
    isSimulatedData: true
  },

  // ==========================================
  // NHÓM 2: 3 BÀI CÓ LỖI CÚ PHÁP (SYNTAX ERRORS)
  // ==========================================
  {
    id: 'SUB-DA6-04',
    studentId: 'HS01',
    studentName: 'Nguyễn Văn An (HS01)',
    taskId: 'TASK-DA6-CENTRAL',
    taskTitle: 'Xử lý danh sách số nguyên trong Python',
    taskType: 'central_benchmark',
    errorCategory: 'syntax_error',
    errorDescription: 'Thiếu dấu hai chấm : sau for và if.',
    code: `n = int(input())
a = []
for i in range(n)
    a.append(int(input()))

total = 0
for x in a
    total = total + x

print(total)`,
    submittedAt: '2026-10-31 09:10:00',
    overallScore: 3.5,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 3, level: 'Chưa đạt', evidence: 'Mới chỉ viết được phần nhập và tính tổng, thiếu đếm chẵn, thiếu max, thiếu xử lý rỗng.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 4, level: 'Chưa đạt', evidence: 'Mã nguồn không thể thực thi được do lỗi cú pháp cơ bản.' },
      { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 3, level: 'Chưa đạt', evidence: 'Không kiểm tra n = 0.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 4, level: 'Cần cố gắng', evidence: 'Vi phạm cú pháp dòng 3 và dòng 7 do thiếu dấu hai chấm (:).' },
      { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có ghi chú hay giải thích quá trình.' }
    ],
    aiFeedback: {
      evidence: 'Dòng 3: "for i in range(n)" và Dòng 7: "for x in a" đều thiếu dấu hai chấm (:) ở cuối dòng.',
      assessment: 'Mã nguồn bị dừng ngay khi thông dịch vì lỗi cú pháp SyntaxError: expected ":". Em chưa hoàn thành 3 yêu cầu còn lại.',
      suggestion: 'Trong Python, sau các câu lệnh điều khiển như for, while, if, else, em luôn phải kết thúc dòng bằng dấu hai chấm (:).',
      socraticQuestion: 'Em hãy quan sát lại cú pháp chuẩn của vòng lặp for: for <biến> in <dãy>: và bổ sung ký tự còn thiếu vào dòng 3 và 7 nhé?'
    },
    analysisType: 'static_analysis',
    detectedIssues: [
      { type: 'confirmed', message: 'SyntaxError: expected ":" at line 3', line: 3 },
      { type: 'confirmed', message: 'SyntaxError: expected ":" at line 7', line: 7 }
    ],
    teacherReview: {
      status: 'Đã duyệt',
      reviewedBy: 'Cô giáo Nguyễn Thanh Hương',
      reviewedAt: '2026-10-31 09:20:00',
      independentScore: 3.5,
      independentComments: 'Học sinh quên cú pháp dấu hai chấm cơ bản của Python và nộp bài chưa xong.',
      teacherComment: 'Phản hồi AI chỉ rõ dòng lỗi và đưa câu hỏi gợi mở đúng đối tượng HS01.',
      reviewDurationMinutes: 1.0,
      traditionalDurationMinutes: 5.0,
      hasCriticalError: false
    },
    isSimulatedData: true
  },
  {
    id: 'SUB-DA6-05',
    studentId: 'HS01',
    studentName: 'Nguyễn Văn An (HS01)',
    taskId: 'TASK-DA6-CENTRAL',
    taskTitle: 'Xử lý danh sách số nguyên trong Python',
    taskType: 'central_benchmark',
    errorCategory: 'syntax_error',
    errorDescription: 'Lỗi thụt lề IndentationError bên trong khối for.',
    code: `n = int(input())
a = []
for i in range(n):
a.append(int(input()))

total = sum(a)
print("Tong:", total)`,
    submittedAt: '2026-10-31 09:25:00',
    overallScore: 4.0,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 4, level: 'Chưa đạt', evidence: 'Mới viết được nhập mảng và tính tổng, thiếu đếm chẵn, max và rỗng.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 4, level: 'Chưa đạt', evidence: 'Chương trình dừng ngay do IndentationError.' },
      { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 3, level: 'Chưa đạt', evidence: 'Chưa xử lý n=0.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 4, level: 'Cần cố gắng', evidence: 'Dòng 4 không thụt lề vào trong khối lệnh for ở dòng 3.' },
      { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có ghi chú quá trình.' }
    ],
    aiFeedback: {
      evidence: 'Dòng 4: "a.append(int(input()))" nằm thẳng hàng với dòng 3 thay vì được thụt lề vào trong.',
      assessment: 'Chương trình gặp lỗi IndentationError: expected an indented block after "for" statement on line 3.',
      suggestion: 'Sau dấu hai chấm (:), toàn bộ các câu lệnh bên trong thân vòng lặp for phải được thụt lề (bằng phím Tab hoặc 4 khoảng trắng).',
      socraticQuestion: 'Làm thế nào để Python biết câu lệnh nào thuộc về vòng lặp for và câu lệnh nào nằm bên ngoài?'
    },
    analysisType: 'static_analysis',
    detectedIssues: [
      { type: 'confirmed', message: 'IndentationError: expected an indented block at line 4', line: 4 }
    ],
    teacherReview: {
      status: 'Đã duyệt',
      reviewedBy: 'Cô giáo Nguyễn Thanh Hương',
      reviewedAt: '2026-10-31 09:35:00',
      independentScore: 4.0,
      independentComments: 'Lỗi thụt đầu dòng kinh điển của học sinh lớp 7-8 mới học Python.',
      teacherComment: 'Duyệt phản hồi AI. Gợi ý dễ hiểu cho học sinh.',
      reviewDurationMinutes: 1.0,
      traditionalDurationMinutes: 4.5,
      hasCriticalError: false
    },
    isSimulatedData: true
  },
  {
    id: 'SUB-DA6-06',
    studentId: 'HS02',
    studentName: 'Trần Thị Bình (HS02)',
    taskId: 'TASK-DA6-CENTRAL',
    taskTitle: 'Xử lý danh sách số nguyên trong Python',
    taskType: 'central_benchmark',
    errorCategory: 'syntax_error',
    errorDescription: 'Sử dụng toán tử gán = thay vì toán tử so sánh == trong câu lệnh if.',
    code: `n = int(input())
a = []
for i in range(n):
    a.append(int(input()))

chan = 0
for x in a:
    if x % 2 = 0:
        chan += 1

print("So chan:", chan)`,
    submittedAt: '2026-10-31 09:40:00',
    overallScore: 4.5,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 5, level: 'Cần cố gắng', evidence: 'Chỉ mới viết phần đếm số chẵn, thiếu tổng, max và trường hợp rỗng.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 4, level: 'Chưa đạt', evidence: 'Lỗi cú pháp toán tử gán trong điều kiện logic ngăn cản thực thi.' },
      { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 4, level: 'Cần cố gắng', evidence: 'Chưa xét n=0.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 5, level: 'Cần cố gắng', evidence: 'Dòng 8 sử dụng dấu = thay vì ==.' },
      { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có ghi chú quá trình.' }
    ],
    aiFeedback: {
      evidence: 'Dòng 8: "if x % 2 = 0:" sử dụng một dấu bằng (=).',
      assessment: 'Chương trình phát sinh lỗi SyntaxError: cannot assign to expression here. Em đang dùng phép gán thay vì phép so sánh bằng.',
      suggestion: 'Trong Python: dấu "=" dùng để gán giá trị cho biến, còn dấu "==" (hai dấu bằng) mới dùng để so sánh bằng trong câu lệnh if.',
      socraticQuestion: 'Khi kiểm tra số dư của x chia cho 2 có bằng 0 hay không, em cần dùng toán tử so sánh nào?'
    },
    analysisType: 'static_analysis',
    detectedIssues: [
      { type: 'confirmed', message: 'SyntaxError: invalid syntax in assignment expression at line 8', line: 8 }
    ],
    teacherReview: {
      status: 'Chờ duyệt',
      independentScore: 4.5,
      independentComments: 'Học sinh nhầm dấu gán và so sánh, chưa làm phần max và tổng.',
      reviewDurationMinutes: 0.8,
      traditionalDurationMinutes: 4.5,
      hasCriticalError: false
    },
    isSimulatedData: true
  },

  // ==========================================
  // NHÓM 3: 3 BÀI CÓ LỖI LOGIC (LOGIC ERRORS)
  // ==========================================
  {
    id: 'SUB-DA6-07',
    studentId: 'HS02',
    studentName: 'Trần Thị Bình (HS02)',
    taskId: 'TASK-DA6-CENTRAL',
    taskTitle: 'Xử lý danh sách số nguyên trong Python',
    taskType: 'central_benchmark',
    errorCategory: 'logic_error',
    errorDescription: 'Khởi tạo biến đếm chẵn = 1 và cộng dồn biến chỉ số i thay vì giá trị a[i].',
    code: `n = int(input())
a = []
for i in range(n):
    a.append(int(input()))

total = 0
chan = 1
for i in range(len(a)):
    total = total + i
    if a[i] % 2 == 0:
        chan += 1

print("Tong:", total)
print("So chan:", chan)`,
    submittedAt: '2026-10-31 09:50:00',
    overallScore: 5.5,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 6, level: 'Cần cố gắng', evidence: 'Thực hiện tính tổng và đếm chẵn nhưng thiếu tìm max và xử lý rỗng n=0.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 5, level: 'Cần cố gắng', evidence: 'Hai lỗi logic: dòng 9 cộng dồn chỉ số i thay vì a[i]; dòng 7 khởi tạo chan = 1 làm kết quả đếm luôn thừa 1.' },
      { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 4, level: 'Cần cố gắng', evidence: 'Nếu n=0 kết quả in So chan: 1 (sai).' },
      { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 7, level: 'Đạt', evidence: 'Thụt lề đúng, cú pháp hợp lệ nhưng thuật toán sai biến.' },
      { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có ghi chú.' }
    ],
    aiFeedback: {
      evidence: 'Dòng 7: "chan = 1" và Dòng 9: "total = total + i".',
      assessment: 'Thuật toán gặp 2 lỗi logic: (1) Biến đếm số chẵn bắt đầu từ 1 khiến số lượng luôn dư 1; (2) Em đang cộng chỉ số vị trí i thay vì cộng giá trị phần tử a[i].',
      suggestion: 'Khởi tạo biến đếm bằng 0. Khi tính tổng, em cần lấy giá trị a[i] tại vị trí i để cộng vào total.',
      socraticQuestion: 'Nếu danh sách có 3 số [10, 20, 30], biến i sẽ nhận các giá trị 0, 1, 2. Việc cộng i sẽ cho ra tổng là bao nhiêu so với tổng của 10+20+30?'
    },
    analysisType: 'static_analysis',
    detectedIssues: [
      { type: 'confirmed', message: 'LogicError: adding loop index variable i instead of element a[i]', line: 9 },
      { type: 'suspected', message: 'LogicError: counter initialized to 1 instead of 0', line: 7 }
    ],
    teacherReview: {
      status: 'Đã chỉnh sửa',
      reviewedBy: 'Cô giáo Nguyễn Thanh Hương',
      reviewedAt: '2026-10-31 10:05:00',
      independentScore: 5.8,
      independentComments: 'Học sinh rất hay nhầm giữa chỉ số i và giá trị a[i] khi duyệt range(len(a)).',
      editReason: 'Bổ sung lời động viên và ví dụ cụ thể về mảng [10, 20, 30] để học sinh dễ hình dung.',
      editedFeedback: {
        evidence: 'Dòng 7 khởi tạo chan = 1 và Dòng 9 cộng total + i.',
        assessment: 'Em đã biết cách duyệt danh sách bằng chỉ số, nhưng cần chú ý phân biệt giữa vị trí i và giá trị phần tử a[i].',
        suggestion: 'Hãy đặt chan = 0 trước vòng lặp và sửa dòng 9 thành total = total + a[i]. Đừng quên làm thêm phần tìm max nhé!',
        socraticQuestion: 'Trong danh sách a = [10, 20, 30], a[1] bằng bao nhiêu và chỉ số 1 có ý nghĩa gì?'
      },
      reviewDurationMinutes: 2.2,
      traditionalDurationMinutes: 6.5,
      hasCriticalError: false
    },
    da4SyncRecommendation: {
      relatedUnits: ['K03', 'K05', 'K10', 'K12'],
      proposedScoreDelta: { K10: -5 },
      rationale: 'Học sinh cần củng cố lại sự khác biệt giữa chỉ số và giá trị phần tử khi duyệt theo range(len(a)).'
    },
    isSimulatedData: true
  },
  {
    id: 'SUB-DA6-08',
    studentId: 'HS03',
    studentName: 'Lê Hoàng Cường (HS03)',
    taskId: 'TASK-DA6-CENTRAL',
    taskTitle: 'Xử lý danh sách số nguyên trong Python',
    taskType: 'central_benchmark',
    errorCategory: 'logic_error',
    errorDescription: 'Nhầm lẫn điều kiện số chẵn thành x % 2 == 1 (đếm số lẻ) và đảo ngược dấu tìm max.',
    code: `n = int(input())
a = []
for _ in range(n):
    a.append(int(input()))

total = sum(a)
chan = 0
for x in a:
    if x % 2 == 1:
        chan += 1

max_val = a[0] if n > 0 else 0
for x in a:
    if x < max_val:
        max_val = x

print("Tong:", total)
print("So chan:", chan)
print("Max:", max_val)`,
    submittedAt: '2026-10-31 10:15:00',
    overallScore: 5.0,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 7, level: 'Cần cố gắng', evidence: 'Có xuất đủ thông tin nhưng kết quả sai logic ở 2 mục: đếm chẵn và tìm max.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 4, level: 'Chưa đạt', evidence: 'Dòng 9 đếm số lẻ thay vì số chẵn; Dòng 15 so sánh if x < max_val biến thuật toán tìm max thành tìm min.' },
      { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 5, level: 'Cần cố gắng', evidence: 'Đã có biểu thức n > 0 nhưng chưa xuất đúng thông báo danh sách rỗng.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 7, level: 'Đạt', evidence: 'Mã trình bày gọn gàng, chia khối rõ ràng.' },
      { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có ghi chú.' }
    ],
    aiFeedback: {
      evidence: 'Dòng 9: "if x % 2 == 1:" và Dòng 15: "if x < max_val: max_val = x".',
      assessment: 'Thuật toán bị đảo ngược logic: (1) Số chẵn chia 2 phải có số dư là 0, điều kiện x % 2 == 1 đang đếm số lẻ; (2) Tìm số lớn nhất phải cập nhật khi gặp số lớn hơn (x > max_val).',
      suggestion: 'Đổi điều kiện dòng 9 thành x % 2 == 0 và dòng 15 thành x > max_val.',
      socraticQuestion: 'Số 4 chia cho 2 dư mấy? Điều kiện x % 2 == 1 sẽ trả về True hay False đối với số 4?'
    },
    analysisType: 'static_analysis',
    detectedIssues: [
      { type: 'confirmed', message: 'LogicError: odd condition used for counting even numbers', line: 9 },
      { type: 'confirmed', message: 'LogicError: comparison operator < used for finding maximum', line: 15 }
    ],
    teacherReview: {
      status: 'Chờ duyệt',
      independentScore: 5.0,
      independentComments: 'Học sinh bị nhầm lẫn dấu so sánh và phép chia dư số chẵn.',
      reviewDurationMinutes: 1.1,
      traditionalDurationMinutes: 5.0,
      hasCriticalError: false
    },
    isSimulatedData: true
  },
  {
    id: 'SUB-DA6-09',
    studentId: 'HS02',
    studentName: 'Trần Thị Bình (HS02)',
    taskId: 'TASK-DA6-CENTRAL',
    taskTitle: 'Xử lý danh sách số nguyên trong Python',
    taskType: 'central_benchmark',
    errorCategory: 'logic_error',
    errorDescription: 'Khởi tạo max_val = 0, dẫn đến kết quả sai nghiêm trọng khi danh sách toàn số âm.',
    code: `n = int(input())
a = []
for _ in range(n):
    a.append(int(input()))

total = sum(a)
chan = sum(1 for x in a if x % 2 == 0)

max_val = 0
for x in a:
    if x > max_val:
        max_val = x

print("Tong:", total)
print("So chan:", chan)
print("Phan tu lon nhat:", max_val)`,
    submittedAt: '2026-10-31 10:25:00',
    overallScore: 6.2,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 7, level: 'Cần cố gắng', evidence: 'Tính được tổng và đếm chẵn, nhưng sai giá trị max khi toàn số âm, chưa xử lý n=0.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 6, level: 'Cần cố gắng', evidence: 'Khởi tạo max_val = 0 (dòng 9) sai logic khi mảng có các số âm.' },
      { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 5, level: 'Cần cố gắng', evidence: 'Không vượt qua Test Case 3 (toàn số âm: [-10, -5, -20] in ra max là 0) và Test Case 4 (n=0).' },
      { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 8, level: 'Đạt', evidence: 'Trình bày tốt, viết đếm chẵn bằng comprehension gọn.' },
      { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có ghi chú.' }
    ],
    aiFeedback: {
      evidence: 'Dòng 9: "max_val = 0". Khi kiểm thử với danh sách [-10, -5, -20], chương trình in "Phan tu lon nhat: 0".',
      assessment: 'Thuật toán tìm max bị sai trong trường hợp danh sách chứa toàn số âm, vì số 0 lớn hơn mọi số âm trong danh sách.',
      suggestion: 'Thay vì gán max_val = 0, em nên khởi tạo max_val bằng chính phần tử đầu tiên của danh sách: max_val = a[0] (sau khi đã kiểm tra n > 0).',
      socraticQuestion: 'Nếu nhiệt độ cả tuần ở Sa Pa đều dưới 0 độ (ví dụ -3, -5, -1), nhiệt độ cao nhất có thể là 0 độ được không nếu ngày đó không xuất hiện nhiệt độ 0?'
    },
    analysisType: 'static_analysis',
    detectedIssues: [
      { type: 'suspected', message: 'LogicError: initializing maximum to 0 will fail on negative number sequences', line: 9 }
    ],
    teacherReview: {
      status: 'Đã duyệt',
      reviewedBy: 'Cô giáo Nguyễn Thanh Hương',
      reviewedAt: '2026-10-31 10:40:00',
      independentScore: 6.5,
      independentComments: 'Lỗi rất phổ biến của học sinh: mặc định số lớn nhất bắt đầu từ 0.',
      teacherComment: 'Ví dụ minh họa nhiệt độ Sa Pa của AI rất hay và gần gũi với học sinh THCS.',
      reviewDurationMinutes: 1.4,
      traditionalDurationMinutes: 6.0,
      hasCriticalError: false
    },
    da4SyncRecommendation: {
      relatedUnits: ['K12'],
      proposedScoreDelta: { K12: -5 },
      rationale: 'Cần rèn luyện thêm kỹ thuật tìm max/min trên tập dữ liệu số âm.'
    },
    isSimulatedData: true
  },

  // ==========================================
  // NHÓM 4: 3 BÀI CHƯA XỬ LÝ ĐÚNG TRƯỜNG HỢP BIÊN (EDGE CASES)
  // ==========================================
  {
    id: 'SUB-DA6-10',
    studentId: 'HS03',
    studentName: 'Lê Hoàng Cường (HS03)',
    taskId: 'TASK-DA6-CENTRAL',
    taskTitle: 'Xử lý danh sách số nguyên trong Python',
    taskType: 'central_benchmark',
    errorCategory: 'edge_case_error',
    errorDescription: 'Không kiểm tra n=0, gọi trực tiếp max(a) gây sập chương trình ValueError.',
    code: `n = int(input())
a = []
for _ in range(n):
    a.append(int(input()))

total = sum(a)
chan = 0
for x in a:
    if x % 2 == 0:
        chan += 1

max_val = max(a)

print("Tong:", total)
print("So chan:", chan)
print("Phan tu lon nhat:", max_val)`,
    submittedAt: '2026-10-31 10:50:00',
    overallScore: 6.8,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 7, level: 'Cần cố gắng', evidence: 'Chạy tốt với n > 0 nhưng chưa xử lý yêu cầu số 4 (danh sách rỗng n = 0).' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 8, level: 'Đạt', evidence: 'Thuật toán tính tổng, đếm chẵn và max đúng khi n > 0.' },
      { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 4, level: 'Chưa đạt', evidence: 'Crash ngay tại dòng 12: ValueError: max() arg is an empty sequence khi n = 0.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 9, level: 'Đạt', evidence: 'Mã nguồn viết sạch đẹp, biến rõ ràng.' },
      { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có ghi chú.' }
    ],
    aiFeedback: {
      evidence: 'Dòng 12: "max_val = max(a)". Khi n = 0, danh sách a rỗng dẫn đến lỗi: ValueError: max() arg is an empty sequence.',
      assessment: 'Bài làm rất tốt các phần tử thông thường, nhưng chưa xử lý trường hợp biên danh sách rỗng (n = 0) theo yêu cầu đề bài.',
      suggestion: 'Em cần bọc câu lệnh tìm max trong điều kiện kiểm tra: if n > 0: max_val = max(a) else: in thông báo danh sách rỗng.',
      socraticQuestion: 'Hàm max() có thể tìm phần tử lớn nhất trong một cái hộp hoàn toàn không chứa đồ vật nào được không?'
    },
    analysisType: 'static_analysis',
    detectedIssues: [
      { type: 'confirmed', message: 'EdgeCaseError: calling max() on potentially empty list without guard check', line: 12 }
    ],
    teacherReview: {
      status: 'Chờ duyệt',
      independentScore: 7.0,
      independentComments: 'Code chạy tốt các testcase thông thường, trượt testcase rỗng n=0.',
      reviewDurationMinutes: 1.0,
      traditionalDurationMinutes: 5.0,
      hasCriticalError: false
    },
    isSimulatedData: true
  },
  {
    id: 'SUB-DA6-11',
    studentId: 'HS02',
    studentName: 'Trần Thị Bình (HS02)',
    taskId: 'TASK-DA6-CENTRAL',
    taskTitle: 'Xử lý danh sách số nguyên trong Python',
    taskType: 'central_benchmark',
    errorCategory: 'edge_case_error',
    errorDescription: 'Truy cập a[0] trước khi kiểm tra n>0 gây lỗi IndexError khi n=0.',
    code: `n = int(input())
a = []
for _ in range(n):
    a.append(int(input()))

max_val = a[0]
total = 0
chan = 0

if n == 0:
    print("Danh sach rong")
else:
    for x in a:
        total += x
        if x % 2 == 0:
            chan += 1
        if x > max_val:
            max_val = x
    print("Tong:", total)
    print("So chan:", chan)
    print("Max:", max_val)`,
    submittedAt: '2026-10-31 11:00:00',
    overallScore: 6.0,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 7, level: 'Cần cố gắng', evidence: 'Có ý thức kiểm tra rỗng nhưng đặt vị trí câu lệnh sai dẫn đến crash.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 7, level: 'Đạt', evidence: 'Thuật toán trong nhánh else hoàn toàn chính xác.' },
      { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 4, level: 'Chưa đạt', evidence: 'Dòng 6: max_val = a[0] nằm trước câu lệnh if n == 0, gây IndexError: list index out of range khi n = 0.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 7, level: 'Đạt', evidence: 'Bố cục rõ ràng nhưng thứ tự thực thi câu lệnh có lỗi.' },
      { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có ghi chú.' }
    ],
    aiFeedback: {
      evidence: 'Dòng 6: "max_val = a[0]" được thực hiện trước dòng 10: "if n == 0:".',
      assessment: 'Em đã nhớ cần kiểm tra n == 0, nhưng câu lệnh max_val = a[0] lại đặt ở ngoài khối if-else khiến chương trình gặp IndexError khi n = 0.',
      suggestion: 'Hãy di chuyển câu lệnh max_val = a[0] vào bên trong khối else (nơi chắc chắn rằng danh sách đã có ít nhất một phần tử).',
      socraticQuestion: 'Nếu n = 0, danh sách a có phần tử mang chỉ số 0 để gán cho max_val hay không?'
    },
    analysisType: 'static_analysis',
    detectedIssues: [
      { type: 'confirmed', message: 'IndexError: indexing a[0] before checking if list is non-empty', line: 6 }
    ],
    teacherReview: {
      status: 'Chờ duyệt',
      independentScore: 6.0,
      independentComments: 'Học sinh hiểu bài nhưng sơ suất vị trí đặt lệnh gán ban đầu.',
      reviewDurationMinutes: 1.0,
      traditionalDurationMinutes: 5.0,
      hasCriticalError: false
    },
    isSimulatedData: true
  },
  {
    id: 'SUB-DA6-12',
    studentId: 'HS01',
    studentName: 'Nguyễn Văn An (HS01)',
    taskId: 'TASK-DA6-CENTRAL',
    taskTitle: 'Xử lý danh sách số nguyên trong Python',
    taskType: 'central_benchmark',
    errorCategory: 'edge_case_error',
    errorDescription: 'Xử lý rỗng bằng exit() đột ngột, bỏ qua việc xuất Tong: 0 và So chan: 0.',
    code: `n = int(input())
if n == 0:
    print("Danh sach rong")
    exit()

a = [int(input()) for _ in range(n)]
print("Tong:", sum(a))
print("So chan:", len([x for x in a if x % 2 == 0]))
print("Max:", max(a))`,
    submittedAt: '2026-10-31 11:10:00',
    overallScore: 7.2,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 7, level: 'Cần cố gắng', evidence: 'Thiếu in ra Tong: 0 và So chan: 0 trong trường hợp rỗng n=0.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 8, level: 'Đạt', evidence: 'Các phép tính với n > 0 hoàn toàn đúng.' },
      { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 6, level: 'Cần cố gắng', evidence: 'Có bắt trường hợp n=0 nhưng không đủ định dạng đầu ra đề bài yêu cầu.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 8, level: 'Đạt', evidence: 'Mã ngắn gọn, dùng exit() để thoát nhanh.' },
      { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có ghi chú.' }
    ],
    aiFeedback: {
      evidence: 'Dòng 4: "exit()" khiến chương trình dừng ngay lập tức mà chưa in "Tong: 0" và "So phan tu chan: 0".',
      assessment: 'Em đã ngăn chặn được lỗi rỗng rất tốt, nhưng đề bài yêu cầu vẫn cần hiển thị tổng và số chẵn (đều bằng 0) khi n = 0.',
      suggestion: 'Trước khi exit() hoặc trong khối if n == 0, em hãy in thêm 2 dòng: print("Tong: 0") và print("So phan tu chan: 0").',
      socraticQuestion: 'Khi một giỏ hàng không có sản phẩm nào, tổng số tiền cần thanh toán hiển thị trên màn hình nên là bao nhiêu?'
    },
    analysisType: 'static_analysis',
    detectedIssues: [],
    teacherReview: {
      status: 'Đã chỉnh sửa',
      reviewedBy: 'Cô giáo Nguyễn Thanh Hương',
      reviewedAt: '2026-10-31 11:25:00',
      independentScore: 7.5,
      independentComments: 'Học sinh biết dùng exit() nhưng đọc chưa kỹ quy cách output khi rỗng.',
      editReason: 'Khen ngợi cách viết tiến bộ của An và nhắc nhở đọc kỹ đề.',
      reviewDurationMinutes: 1.5,
      traditionalDurationMinutes: 5.5,
      hasCriticalError: false
    },
    isSimulatedData: true
  },

  // ==========================================
  // NHÓM 5: 3 BÀI CHẠY ĐÚNG MỘT PHẦN NHƯNG CẤU TRÚC KÉM / SUB-OPTIMAL
  // ==========================================
  {
    id: 'SUB-DA6-13',
    studentId: 'HS02',
    studentName: 'Trần Thị Bình (HS02)',
    taskId: 'TASK-DA6-CENTRAL',
    taskTitle: 'Xử lý danh sách số nguyên trong Python',
    taskType: 'central_benchmark',
    errorCategory: 'poor_structure',
    errorDescription: 'Sử dụng 3 vòng lặp riêng biệt không cần thiết, đặt tên biến tùy tiện (x1, x2, temp, ok).',
    code: `n = int(input())
if n == 0:
    print("Tong: 0\\nSo phan tu chan: 0\\nDanh sach rong, khong co phan tu lon nhat")
else:
    ds = []
    for x1 in range(n):
        ds.append(int(input()))
    
    t = 0
    for x2 in ds:
        t = t + x2
        
    c = 0
    for x3 in ds:
        if x3 % 2 == 0:
            c = c + 1
            
    m = ds[0]
    for x4 in ds:
        if x4 > m:
            m = x4
            
    print("Tong:", t)
    print("So phan tu chan:", c)
    print("Phan tu lon nhat:", m)`,
    submittedAt: '2026-10-31 11:30:00',
    overallScore: 7.2,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 10, level: 'Đạt', evidence: 'Kết quả chạy chính xác cả 5 testcases.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 9, level: 'Đạt', evidence: 'Thuật toán đúng nhưng lặp danh sách tới 4 lần liên tiếp.' },
      { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 9, level: 'Đạt', evidence: 'Xử lý n = 0 đầy đủ.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 5, level: 'Cần cố gắng', evidence: 'Đặt tên biến x1, x2, x3, x4, t, c, m khó hiểu; tách 3 vòng lặp riêng gây lãng phí tài nguyên.' },
      { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có ghi chú.' }
    ],
    aiFeedback: {
      evidence: 'Dùng 4 vòng for riêng biệt (x1, x2, x3, x4) và biến viết tắt t, c, m.',
      assessment: 'Chương trình chạy ra kết quả đúng, nhưng cấu trúc mã còn cồng kềnh và tên biến chưa rõ nghĩa.',
      suggestion: 'Em có thể gộp việc tính tổng (t), đếm chẵn (c) và tìm max (m) vào trong cùng một vòng lặp for duy nhất để mã gọn và nhanh hơn gấp 3 lần.',
      socraticQuestion: 'Mỗi lần đi siêu thị, em có cần phải đi hết các kệ hàng một lần chỉ để đếm đồ, rồi đi lại lần thứ hai để tính tiền không, hay có thể làm cùng lúc?'
    },
    analysisType: 'static_analysis',
    detectedIssues: [
      { type: 'suspected', message: 'Performance/Structure: multiple sequential loops traversing identical list', line: 11 }
    ],
    teacherReview: {
      status: 'Đã duyệt',
      reviewedBy: 'Cô giáo Nguyễn Thanh Hương',
      reviewedAt: '2026-10-31 11:45:00',
      independentScore: 7.2,
      independentComments: 'Học sinh tư duy theo kiểu tách nhỏ bài toán, đúng kết quả nhưng cần học cách gộp vòng lặp.',
      teacherComment: 'Ẩn dụ đi siêu thị của AI rất sinh động và chuẩn mực sư phạm.',
      reviewDurationMinutes: 1.3,
      traditionalDurationMinutes: 6.0,
      hasCriticalError: false
    },
    da4SyncRecommendation: {
      relatedUnits: ['K09', 'K10', 'K12'],
      proposedScoreDelta: { K12: 5 },
      rationale: 'Học sinh làm chủ việc duyệt và xử lý dữ liệu, cần rèn thêm về tối ưu hóa vòng lặp.'
    },
    isSimulatedData: true
  },
  {
    id: 'SUB-DA6-14',
    studentId: 'HS03',
    studentName: 'Lê Hoàng Cường (HS03)',
    taskId: 'TASK-DA6-CENTRAL',
    taskTitle: 'Xử lý danh sách số nguyên trong Python',
    taskType: 'central_benchmark',
    errorCategory: 'poor_structure',
    errorDescription: 'AI đưa ra gợi ý dùng thư viện không phù hợp; giáo viên từ chối phản hồi và ghi đè.',
    code: `n = int(input())
if n == 0:
    print("Tong: 0\\nSo phan tu chan: 0\\nDanh sach rong, khong co phan tu lon nhat")
else:
    s = ""
    for _ in range(n):
        s += input() + " "
    arr = [int(v) for v in s.strip().split(" ")]
    print("Tong:", sum(arr))
    print("So phan tu chan:", len([x for x in arr if x % 2 == 0]))
    print("Phan tu lon nhat:", max(arr))`,
    submittedAt: '2026-10-31 11:40:00',
    overallScore: 7.0,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 9, level: 'Đạt', evidence: 'Kết quả đúng.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 8, level: 'Đạt', evidence: 'Nối chuỗi rồi split ra mảng số, chạy được nhưng tốn bộ nhớ không cần thiết.' },
      { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 9, level: 'Đạt', evidence: 'Xử lý n=0 tốt.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 6, level: 'Cần cố gắng', evidence: 'Dùng biến s nối chuỗi trung gian thay vì append trực tiếp vào list.' },
      { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có ghi chú.' }
    ],
    aiFeedback: {
      evidence: 'Dòng 5-7: Sử dụng phép cộng chuỗi s += input() và split().',
      assessment: 'Học sinh chưa tối ưu nhập liệu. Gợi ý học sinh import thư viện numpy hoặc io.StringIO để tối ưu tốc độ đọc chuỗi.',
      suggestion: 'Hãy import numpy as np và dùng np.fromstring() để tăng tốc độ phân tích dữ liệu.',
      socraticQuestion: 'Em có biết thư viện numpy giúp tăng tốc mảng số như thế nào không?'
    },
    analysisType: 'static_analysis',
    detectedIssues: [
      { type: 'suspected', message: 'Inefficient string concatenation for list accumulation', line: 7 }
    ],
    teacherReview: {
      status: 'Từ chối phản hồi',
      reviewedBy: 'Cô giáo Nguyễn Thanh Hương',
      reviewedAt: '2026-10-31 11:55:00',
      independentScore: 7.0,
      independentComments: 'Học sinh dùng sai phương pháp nối chuỗi để tạo list.',
      rejectionReason: 'LỖI PHẢN HỒI AI: AI gợi ý học sinh lớp 8 dùng thư viện numpy là hoàn toàn sai chuẩn chương trình Tin học THCS. Cần dùng phương thức append() chuẩn của Python list.',
      teacherComment: 'Đã từ chối phản hồi của AI và viết lại góp ý chuẩn mực sư phạm THCS cho học sinh.',
      editedFeedback: {
        evidence: 'Dòng 5-7: Nối chuỗi s += input() + " " rồi dùng split().',
        assessment: 'Bài làm ra kết quả đúng nhưng cách đưa dữ liệu vào danh sách qua biến chuỗi trung gian là không cần thiết và tốn bộ nhớ.',
        suggestion: 'Em chỉ cần tạo danh sách arr = [] rồi dùng arr.append(int(input())) trực tiếp trong vòng lặp.',
        socraticQuestion: 'Tại sao việc dùng phương thức append() đưa số thẳng vào danh sách lại nhanh và tiết kiệm bộ nhớ hơn việc biến số thành chữ rồi lại đổi ngược lại?'
      },
      reviewDurationMinutes: 2.8,
      traditionalDurationMinutes: 6.5,
      hasCriticalError: true,
      criticalErrorDetails: 'AI gợi ý thư viện numpy ngoài phạm vi chương trình THCS.'
    },
    isSimulatedData: true
  },
  {
    id: 'SUB-DA6-15',
    studentId: 'HS04',
    studentName: 'Phạm Minh Dung (HS04)',
    taskId: 'TASK-DA6-CENTRAL',
    taskTitle: 'Xử lý danh sách số nguyên trong Python',
    taskType: 'central_benchmark',
    errorCategory: 'poor_structure',
    errorDescription: 'Code nén gộp 1 dòng quá phức tạp (One-liner), khó đọc và khó bảo trì.',
    code: `n = int(input())
a = [int(input()) for _ in range(n)]
print(f"Tong: {sum(a)}\\nSo phan tu chan: {len(list(filter(lambda x: x%2==0, a)))}\\nPhan tu lon nhat: {max(a) if a else 'Danh sach rong, khong co phan tu lon nhat'}")`,
    submittedAt: '2026-10-31 11:50:00',
    overallScore: 7.8,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu bài toán', score: 10, level: 'Đạt', evidence: 'Đáp ứng đầy đủ 4 yêu cầu bài toán.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn của thuật toán', score: 9, level: 'Đạt', evidence: 'Dùng lambda và filter chính xác.' },
      { criteriaId: 3, criteriaName: 'Khả năng xử lý trường hợp biên', score: 9, level: 'Đạt', evidence: 'Xử lý rỗng bằng biểu thức điều kiện ternary if a else.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc, tính dễ đọc của mã', score: 6, level: 'Cần cố gắng', evidence: 'Dòng lệnh in quá dài (>120 ký tự), lồng ghép lambda, filter và toán tử 3 ngôi làm giảm độ dễ đọc (Readability).' },
      { criteriaId: 5, criteriaName: 'Khả năng giải thích & minh chứng quá trình', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có chú thích giải thích.' }
    ],
    aiFeedback: {
      evidence: 'Dòng 3: Câu lệnh print lồng ghép f-string, sum(), len(), list(), filter(), lambda và if-else trên 1 dòng duy nhất.',
      assessment: 'Kỹ năng cú pháp của em rất điêu luyện, tuy nhiên câu lệnh quá dài và phức tạp, đi ngược lại nguyên lý "Đơn giản tốt hơn phức tạp" của Python (Zen of Python).',
      suggestion: 'Em nên tách câu lệnh in thành các dòng riêng biệt và tính toán trước các giá trị vào biến có tên rõ ràng.',
      socraticQuestion: 'Nếu câu lệnh dòng 3 phát sinh lỗi khi chạy, việc tìm ra vị trí lỗi trong một dòng dài có khó hơn khi được chia thành các biến riêng không?'
    },
    analysisType: 'static_analysis',
    detectedIssues: [
      { type: 'suspected', message: 'Code style: line length exceeds recommended readability limits with complex nesting', line: 3 }
    ],
    teacherReview: {
      status: 'Chờ duyệt',
      independentScore: 8.0,
      independentComments: 'Học sinh thích thể hiện kỹ thuật viết code 1 dòng, cần định hướng tính dễ đọc.',
      reviewDurationMinutes: 1.0,
      traditionalDurationMinutes: 5.0,
      hasCriticalError: false
    },
    isSimulatedData: true
  }
];

export const DA6_15_BENCHMARK_SUBMISSIONS: CodeSubmission[] = RAW_DA6_15_BENCHMARK_SUBMISSIONS.map(sub => ({
  ...sub,
  overallScore: calculateWeightedRubricScore(sub.criteriaScores),
  isSimulatedData: true,
  isSyntheticResearchSample: true
}));
