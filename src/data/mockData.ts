import { KnowledgeUnit, DiagnosticQuestion, LearningTask, StudentProfile, CodeSubmission, AuditLogEntry, ResearchMetrics, StudentReviewRequest } from '../types';
import { CENTRAL_BENCHMARK_TASK, REFERENCE_PYTHON_SOLUTION, DA6_RUBRIC_SPECIFICATION, DA6_15_BENCHMARK_SUBMISSIONS } from './da6BenchmarkData';

export { CENTRAL_BENCHMARK_TASK, REFERENCE_PYTHON_SOLUTION, DA6_RUBRIC_SPECIFICATION };

export const SAMPLE_STUDENT_REVIEW_REQUESTS: StudentReviewRequest[] = [
  {
    id: 'REQ-01',
    studentId: 'HS02',
    studentName: 'Trần Thị Bình',
    message: 'Em đã hoàn thành bài thực hành K06 nhưng hệ thống chưa cập nhật điểm năng lực sang mức Luyện tập.',
    status: 'Chờ xử lý',
    createdAt: '2026-11-05 14:20:00'
  },
  {
    id: 'REQ-02',
    studentId: 'HS03',
    studentName: 'Lê Hoàng Cường',
    message: 'Em muốn xin giáo viên mở khóa phần Vận dụng (K09-K12) vì em đã tự học xong phần duyệt danh sách.',
    status: 'Đã chấp nhận',
    teacherResponse: 'Đã kiểm tra kết quả bài nộp SUB-03 của em đạt tốt. Giáo viên đồng ý mở khóa lộ trình Vận dụng.',
    reviewedBy: 'Cô giáo Nguyễn Thanh Hương',
    createdAt: '2026-11-04 09:10:00',
    updatedAt: '2026-11-04 11:30:00'
  }
];

export const KNOWLEDGE_UNITS: KnowledgeUnit[] = [
  { id: 'K01', code: 'K01', title: 'Khái niệm danh sách', description: 'Hiểu bản chất danh sách (List) trong Python là gì, tính có thứ tự và khả năng chứa nhiều kiểu dữ liệu.', prerequisites: [], category: 'Cơ bản' },
  { id: 'K02', code: 'K02', title: 'Khởi tạo danh sách', description: 'Cách tạo danh sách rỗng, danh sách có sẵn phần tử bằng dấu ngoặc vuông [] hoặc hàm list().', prerequisites: ['K01'], category: 'Cơ bản' },
  { id: 'K03', code: 'K03', title: 'Chỉ số phần tử', description: 'Hiểu chỉ số (index) dương (từ 0) và chỉ số âm (từ -1) để định vị phần tử trong danh sách.', prerequisites: ['K02'], category: 'Cơ bản' },
  { id: 'K04', code: 'K04', title: 'Hàm len()', description: 'Sử dụng hàm len() để xác định số lượng phần tử hiện có trong danh sách.', prerequisites: ['K02'], category: 'Cơ bản' },
  { id: 'K05', code: 'K05', title: 'Truy cập và thay đổi phần tử', description: 'Đọc giá trị và gán giá trị mới cho phần tử thông qua chỉ số.', prerequisites: ['K03', 'K04'], category: 'Thao tác' },
  { id: 'K06', code: 'K06', title: 'Thêm phần tử append()', description: 'Thêm phần tử mới vào cuối danh sách bằng phương thức append(). Phân nhánh từ K02 (không bắt buộc biết len()).', prerequisites: ['K02'], category: 'Thao tác' },
  { id: 'K07', code: 'K07', title: 'Chèn phần tử insert()', description: 'Chèn phần tử vào một vị trí chỉ định trong danh sách bằng insert(index, value).', prerequisites: ['K03', 'K06'], category: 'Thao tác' },
  { id: 'K08', code: 'K08', title: 'Xóa phần tử remove(), pop()', description: 'Xóa phần tử theo giá trị với remove() hoặc theo vị trí với pop() và từ khóa del.', prerequisites: ['K05', 'K06'], category: 'Thao tác' },
  { id: 'K09', code: 'K09', title: 'Duyệt danh sách bằng for', description: 'Sử dụng vòng lặp for item in list để duyệt qua từng phần tử trong danh sách.', prerequisites: ['K02'], category: 'Duyệt & Tìm kiếm' },
  { id: 'K10', code: 'K10', title: 'Duyệt theo chỉ số', description: 'Duyệt danh sách kết hợp range(len(list)) để thao tác với cả chỉ số và giá trị.', prerequisites: ['K03', 'K04', 'K09'], category: 'Duyệt & Tìm kiếm' },
  { id: 'K11', code: 'K11', title: 'Tìm kiếm trong danh sách', description: 'Kiểm tra sự tồn tại bằng từ khóa in, tìm vị trí bằng index() và đếm bằng count().', prerequisites: ['K09'], category: 'Duyệt & Tìm kiếm' },
  { id: 'K12', code: 'K12', title: 'Tổng hợp và xử lý dữ liệu', description: 'Kết hợp danh sách với điều kiện, hàm sum(), max(), min(), sắp xếp sort() để giải quyết bài toán thực tế.', prerequisites: ['K08', 'K10', 'K11'], category: 'Tổng hợp' }
];

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // K01: Khái niệm danh sách (2 câu)
  {
    id: 1,
    unitId: 'K01',
    question: 'Trong Python, kiểu dữ liệu nào dùng để lưu trữ một tập hợp có thứ tự và có thể thay đổi các phần tử?',
    options: ['A. tuple', 'B. list', 'C. set', 'D. dict'],
    correctAnswer: 1,
    explanation: 'Danh sách (list) là cấu trúc dữ liệu có thứ tự, cho phép thay đổi (mutable) các phần tử.'
  },
  {
    id: 2,
    unitId: 'K01',
    question: 'Đặc điểm nào sau đây là ĐÚNG về danh sách (List) trong Python?',
    options: [
      'A. Danh sách chỉ được phép chứa các số nguyên cùng kiểu',
      'B. Danh sách không thể thay đổi các phần tử sau khi tạo',
      'C. Danh sách có thể chứa nhiều phần tử thuộc các kiểu dữ liệu khác nhau cùng lúc',
      'D. Danh sách luôn tự động sắp xếp các phần tử theo thứ tự tăng dần'
    ],
    correctAnswer: 2,
    explanation: 'List trong Python là kiểu dữ liệu linh hoạt, có thể chứa số, chuỗi, boolean, hoặc thậm chí một list khác.'
  },

  // K02: Khởi tạo danh sách (2 câu)
  {
    id: 3,
    unitId: 'K02',
    question: 'Lệnh nào sau đây tạo ra một danh sách rỗng trong Python?',
    options: ['A. a = {}', 'B. a = ()', 'C. a = []', 'D. a = set()'],
    correctAnswer: 2,
    explanation: 'Cặp ngoặc vuông rỗng [] hoặc hàm list() được dùng để khởi tạo danh sách rỗng.'
  },
  {
    id: 4,
    unitId: 'K02',
    question: 'Đoạn mã "a = [10, \'Tin hoc\', 3.14, True]" trong Python sẽ:',
    options: [
      'A. Báo lỗi SyntaxError vì các phần tử không cùng kiểu dữ liệu',
      'B. Khởi tạo một danh sách hợp lệ gồm 4 phần tử',
      'C. Tự động chuyển đổi tất cả các phần tử thành kiểu chuỗi',
      'D. Chỉ lưu phần tử đầu tiên là số 10'
    ],
    correctAnswer: 1,
    explanation: 'Python cho phép khởi tạo danh sách chứa các kiểu dữ liệu hỗn hợp hoàn toàn hợp lệ.'
  },

  // K03: Chỉ số phần tử (2 câu)
  {
    id: 5,
    unitId: 'K03',
    question: 'Cho a = [10, 20, 30, 40]. Chỉ số (index) của phần tử có giá trị 30 là gì?',
    options: ['A. 1', 'B. 2', 'C. 3', 'D. -1'],
    correctAnswer: 1,
    explanation: 'Chỉ số trong Python bắt đầu từ 0: a[0]=10, a[1]=20, a[2]=30.'
  },
  {
    id: 6,
    unitId: 'K03',
    question: 'Trong danh sách a = [10, 20, 30, 40], phần tử a[-1] trả về giá trị nào?',
    options: ['A. 10', 'B. 20', 'C. 30', 'D. 40'],
    correctAnswer: 3,
    explanation: 'Chỉ số âm -1 tham chiếu đến phần tử cuối cùng của danh sách, là 40.'
  },

  // K04: Hàm len() (2 câu)
  {
    id: 7,
    unitId: 'K04',
    question: 'Hàm nào trả về số lượng phần tử của danh sách a?',
    options: ['A. a.size()', 'B. count(a)', 'C. len(a)', 'D. a.length()'],
    correctAnswer: 2,
    explanation: 'Hàm built-in len(a) trả về số lượng phần tử hiện có trong danh sách a.'
  },
  {
    id: 8,
    unitId: 'K04',
    question: 'Giá trị của biểu thức len([]) đối với một danh sách rỗng là bao nhiêu?',
    options: ['A. None', 'B. 0', 'C. -1', 'D. Báo lỗi ValueError'],
    correctAnswer: 1,
    explanation: 'Danh sách rỗng không có phần tử nào nên hàm len([]) trả về giá trị 0.'
  },

  // K05: Truy cập và thay đổi phần tử (2 câu)
  {
    id: 9,
    unitId: 'K05',
    question: 'Cho a = [5, 10, 15]. Lệnh nào gán lại giá trị phần tử thứ hai thành 20?',
    options: ['A. a[2] = 20', 'B. a[1] = 20', 'C. a.change(1, 20)', 'D. a.update(2, 20)'],
    correctAnswer: 1,
    explanation: 'Phần tử thứ hai có chỉ số là 1, nên a[1] = 20 sẽ cập nhật giá trị in-place.'
  },
  {
    id: 10,
    unitId: 'K05',
    question: 'Nếu danh sách a có độ dài bằng 3, câu lệnh "print(a[5])" sẽ dẫn đến lỗi gì trong Python?',
    options: ['A. TypeError', 'B. KeyError', 'C. IndexError: list index out of range', 'D. ValueError'],
    correctAnswer: 2,
    explanation: 'Truy cập chỉ số nằm ngoài phạm vi 0 đến len(a)-1 sẽ gây ra lỗi IndexError.'
  },

  // K06: Thêm phần tử append() (2 câu)
  {
    id: 11,
    unitId: 'K06',
    question: 'Phương thức nào dùng để thêm một phần tử mới vào cuối danh sách?',
    options: ['A. a.add(x)', 'B. a.push(x)', 'C. a.append(x)', 'D. a.insert(x)'],
    correctAnswer: 2,
    explanation: 'Phương thức a.append(x) thêm phần tử x vào vị trí cuối cùng của danh sách a.'
  },
  {
    id: 12,
    unitId: 'K06',
    question: 'Xét đoạn mã: "a = [1, 2]; b = a.append(3)". Giá trị của biến b là gì?',
    options: ['A. [1, 2, 3]', 'B. 3', 'C. None', 'D. [3]'],
    correctAnswer: 2,
    explanation: 'Phương thức append() thay đổi trực tiếp danh sách a và trả về giá trị None.'
  },

  // K07: Chèn phần tử insert() (2 câu)
  {
    id: 13,
    unitId: 'K07',
    question: 'Lệnh a.insert(1, 99) thực hiện điều gì?',
    options: [
      'A. Thay thế phần tử tại vị trí 1 thành 99',
      'B. Chèn số 99 vào vị trí index 1, đẩy các phần tử phía sau sang phải',
      'C. Thêm số 99 vào cuối danh sách',
      'D. Xóa phần tử tại vị trí 1'
    ],
    correctAnswer: 1,
    explanation: 'insert(index, value) chèn giá trị vào vị trí chỉ định mà không làm mất các phần tử cũ.'
  },
  {
    id: 14,
    unitId: 'K07',
    question: 'Để chèn một phần tử x vào vị trí đầu tiên của danh sách a, ta sử dụng lệnh nào?',
    options: ['A. a.insert(0, x)', 'B. a.insert(1, x)', 'C. a.prepend(x)', 'D. a.insert(-1, x)'],
    correctAnswer: 0,
    explanation: 'Chỉ số đầu tiên của danh sách là 0, do đó a.insert(0, x) chèn vào vị trí đầu tiên.'
  },

  // K08: Xóa phần tử remove(), pop() (2 câu)
  {
    id: 15,
    unitId: 'K08',
    question: 'Sự khác biệt chính giữa a.remove(x) và a.pop(i) là gì?',
    options: [
      'A. remove xóa theo giá trị x, pop xóa theo chỉ số i',
      'B. remove xóa theo chỉ số, pop xóa theo giá trị',
      'C. Không có sự khác biệt',
      'D. pop chỉ dùng cho danh sách số'
    ],
    correctAnswer: 0,
    explanation: 'remove(x) tìm và xóa phần tử có giá trị x đầu tiên, còn pop(i) xóa phần tử tại chỉ số i.'
  },
  {
    id: 16,
    unitId: 'K08',
    question: 'Lệnh a.pop() khi không truyền tham số chỉ số sẽ thực hiện hành động nào?',
    options: [
      'A. Xóa phần tử đầu tiên',
      'B. Xóa phần tử cuối cùng của danh sách và trả về giá trị đó',
      'C. Xóa toàn bộ danh sách',
      'D. Báo lỗi thiếu đối số'
    ],
    correctAnswer: 1,
    explanation: 'Mặc định pop() không có tham số sẽ xóa và trả về phần tử cuối cùng của danh sách.'
  },

  // K09: Duyệt danh sách bằng for (2 câu)
  {
    id: 17,
    unitId: 'K09',
    question: 'Cách viết vòng lặp for nào đúng để duyệt qua từng phần tử x trong danh sách a?',
    options: [
      'A. for x in range(a):',
      'B. for x in a:',
      'C. for x of a:',
      'D. for i = 0 to len(a):'
    ],
    correctAnswer: 1,
    explanation: 'Cú pháp chuẩn trong Python để duyệt trực tiếp các phần tử là "for x in a:".'
  },
  {
    id: 18,
    unitId: 'K09',
    question: 'Trong vòng lặp "for item in [\'cam\', \'xoai\', \'nho\']:", tại lần lặp thứ hai biến item nhận giá trị là:',
    options: ['A. 1', 'B. \'cam\'', 'C. \'xoai\'', 'D. 2'],
    correctAnswer: 2,
    explanation: 'Biến lặp nhận trực tiếp giá trị từng phần tử theo thứ tự: lần 1 là "cam", lần 2 là "xoai".'
  },

  // K10: Duyệt theo chỉ số (2 câu)
  {
    id: 19,
    unitId: 'K10',
    question: 'Để duyệt danh sách a theo chỉ số từ 0 đến len(a)-1, cấu trúc nào sau đây là chuẩn mực?',
    options: [
      'A. for i in range(len(a)):',
      'B. for i in len(a):',
      'C. for i in a.indexes():',
      'D. while i < a:'
    ],
    correctAnswer: 0,
    explanation: 'Hàm range(len(a)) tạo dãy chỉ số từ 0 đến len(a)-1 để duyệt.'
  },
  {
    id: 20,
    unitId: 'K10',
    question: 'Để duyệt danh sách vừa lấy được chỉ số i vừa lấy được giá trị x, hàm built-in nào được khuyến khích sử dụng?',
    options: ['A. enumerate(a)', 'B. zip(a)', 'C. list(a)', 'D. range(a)'],
    correctAnswer: 0,
    explanation: 'enumerate(a) trả về cặp (chỉ số, giá trị) giúp việc duyệt gọn gàng và tránh lỗi chỉ số.'
  },

  // K11: Tìm kiếm trong danh sách (2 câu)
  {
    id: 21,
    unitId: 'K11',
    question: 'Biểu thức "apple" in ["banana", "apple", "cherry"] trả về giá trị gì?',
    options: ['A. True', 'B. False', 'C. 1', 'D. Error'],
    correctAnswer: 0,
    explanation: 'Toán tử in kiểm tra sự tồn tại của phần tử và trả về True nếu có trong danh sách.'
  },
  {
    id: 22,
    unitId: 'K11',
    question: 'Cho a = [2, 5, 2, 8, 2, 9]. Kết quả của lệnh a.count(2) là bao nhiêu?',
    options: ['A. 1', 'B. 2', 'C. 3', 'D. 6'],
    correctAnswer: 2,
    explanation: 'Phương thức a.count(x) đếm số lần giá trị x xuất hiện trong danh sách (số 2 xuất hiện 3 lần).'
  },

  // K12: Tổng hợp và xử lý dữ liệu (2 câu)
  {
    id: 23,
    unitId: 'K12',
    question: 'Cho a = [-10, 5, 20, -3]. Giá trị của sum(a) và max(a) lần lượt là:',
    options: ['A. 12 và 20', 'B. 22 và 20', 'C. 12 và 5', 'D. 38 và 20'],
    correctAnswer: 0,
    explanation: 'sum(a) = -10 + 5 + 20 - 3 = 12; max(a) là giá trị lớn nhất trong danh sách, bằng 20.'
  },
  {
    id: 24,
    unitId: 'K12',
    question: 'Điểm khác biệt quan trọng giữa phương thức a.sort() và hàm built-in sorted(a) là gì?',
    options: [
      'A. sort() sắp xếp trực tiếp danh sách a (in-place) còn sorted() trả về một danh sách mới',
      'B. sort() chỉ dùng cho danh sách chuỗi còn sorted() dùng cho số',
      'C. sort() sắp xếp giảm dần còn sorted() sắp xếp tăng dần',
      'D. Hai cách này hoàn toàn giống nhau không có khác biệt'
    ],
    correctAnswer: 0,
    explanation: 'a.sort() thay đổi trực tiếp danh sách ban đầu, còn sorted(a) tạo và trả về danh sách mới đã sắp xếp.'
  }
];

export const LEARNING_TASKS: LearningTask[] = [
  // ==================== K01: Khái niệm danh sách ====================
  {
    id: 'T01',
    unitId: 'K01',
    title: 'Khám phá danh sách trái cây',
    level: 'Cơ bản',
    objective: 'Hiểu khái niệm và tạo danh sách chứa các chuỗi ký tự đại diện cho các loại quả trong Python.',
    requirement: 'Tạo một danh sách Python tên fruits gồm tên của ba loại quả bất kỳ. In toàn bộ danh sách ra màn hình.',
    inputData: 'Không có. Dữ liệu mẫu minh họa: ["tao", "chuoi", "cam"] (đây chỉ là ví dụ minh họa, học sinh có thể chọn 3 loại quả bất kỳ như ["xoai", "mit", "oi"]).',
    expectedOutput: "['<tên_quả_1>', '<tên_quả_2>', '<tên_quả_3>'] (Phụ thuộc vào nội dung danh sách học sinh tạo, ví dụ: ['tao', 'chuoi', 'cam'] hoặc ['xoai', 'mit', 'oi'])",
    starterCode: '# Tạo danh sách fruits gồm 3 loại quả bất kỳ và in ra màn hình\nfruits = ["tao", "chuoi", "cam"]\nprint(fruits)',
    testCases: [
      { input: 'None (Mẫu 1)', output: "['tao', 'chuoi', 'cam']" },
      { input: 'None (Mẫu 2)', output: "['xoai', 'mit', 'oi']" }
    ]
  },
  {
    id: 'T01_M',
    unitId: 'K01',
    title: 'Tạo danh sách hỗn hợp kiểu dữ liệu',
    level: 'Trung bình',
    objective: 'Hiểu tính linh hoạt của List trong Python khi chứa nhiều kiểu dữ liệu (chuỗi, số nguyên, số thực, boolean).',
    requirement: 'Tạo danh sách student_info chứa thông tin một học sinh gồm: tên "Minh", tuổi 14, điểm trung bình 8.5 và trạng thái đạt True. In danh sách ra màn hình.',
    inputData: 'Không có',
    expectedOutput: "['Minh', 14, 8.5, True]",
    starterCode: '# Tạo danh sách student_info chứa 4 kiểu dữ liệu khác nhau\nstudent_info = ["Minh", 14, 8.5, True]\nprint(student_info)',
    testCases: [{ input: 'None', output: "['Minh', 14, 8.5, True]" }]
  },
  {
    id: 'T01_A',
    unitId: 'K01',
    title: 'Danh sách lồng nhau mô phỏng bảng điểm',
    level: 'Vận dụng',
    objective: 'Vận dụng khái niệm danh sách chứa danh sách con (2D list) để lưu trữ cấu trúc bảng dữ liệu.',
    requirement: 'Tạo danh sách matrix gồm 2 danh sách con: danh sách 1 chứa điểm Toán-Văn [9, 8], danh sách 2 chứa điểm Anh-Tin [7, 10]. In danh sách matrix và in số lượng phần tử của matrix.',
    inputData: 'Không có',
    expectedOutput: '[[9, 8], [7, 10]]\n2',
    starterCode: '# Khởi tạo ma trận bảng điểm gồm 2 danh sách con\nmatrix = [[9, 8], [7, 10]]\nprint(matrix)\nprint(len(matrix))',
    testCases: [{ input: 'None', output: '[[9, 8], [7, 10]]\n2' }]
  },

  // ==================== K02: Khởi tạo danh sách ====================
  {
    id: 'T02',
    unitId: 'K02',
    title: 'Khởi tạo danh sách điểm số',
    level: 'Cơ bản',
    objective: 'Thực hành khởi tạo danh sách số nguyên.',
    requirement: 'Tạo danh sách scores chứa 5 điểm số học tập của học sinh: [8, 9, 7, 10, 8] và in danh sách ra.',
    inputData: 'Không có',
    expectedOutput: '[8, 9, 7, 10, 8]',
    starterCode: '# Tạo danh sách scores\nscores = [8, 9, 7, 10, 8]\nprint(scores)',
    testCases: [{ input: 'None', output: '[8, 9, 7, 10, 8]' }]
  },
  {
    id: 'T02_M',
    unitId: 'K02',
    title: 'Khởi tạo danh sách từ chuỗi với hàm list()',
    level: 'Trung bình',
    objective: 'Sử dụng hàm built-in list() để chuyển đổi một chuỗi ký tự thành danh sách các ký tự đơn.',
    requirement: 'Cho chuỗi word = "PYTHON". Hãy dùng hàm list() để chuyển chuỗi thành danh sách các ký tự và in ra màn hình.',
    inputData: 'word = "PYTHON"',
    expectedOutput: "['P', 'Y', 'T', 'H', 'O', 'N']",
    starterCode: 'word = "PYTHON"\n# Dùng list() để tạo danh sách ký tự\nchars = list(word)\nprint(chars)',
    testCases: [{ input: 'PYTHON', output: "['P', 'Y', 'T', 'H', 'O', 'N']" }]
  },
  {
    id: 'T02_A',
    unitId: 'K02',
    title: 'Khởi tạo danh sách lặp lại và cập nhật',
    level: 'Vận dụng',
    objective: 'Vận dụng toán tử nhân danh sách [0] * n để tạo danh sách kích thước lớn và cập nhật phần tử khởi tạo.',
    requirement: 'Tạo danh sách zeros gồm 5 số 0 bằng toán tử [0] * 5. Sau đó gán phần tử đầu tiên zeros[0] = 1 và in danh sách kết quả.',
    inputData: 'Không có',
    expectedOutput: '[1, 0, 0, 0, 0]',
    starterCode: '# Tạo danh sách 5 số 0 và gán phần tử đầu tiên thành 1\nzeros = [0] * 5\nzeros[0] = 1\nprint(zeros)',
    testCases: [{ input: 'None', output: '[1, 0, 0, 0, 0]' }]
  },

  // ==================== K03: Chỉ số phần tử ====================
  {
    id: 'T03',
    unitId: 'K03',
    title: 'Truy xuất phần tử đầu và cuối',
    level: 'Cơ bản',
    objective: 'Sử dụng chỉ số dương và chỉ số âm.',
    requirement: 'Cho colors = ["do", "vang", "xanh", "tim"]. Hãy in ra phần tử đầu tiên và phần tử cuối cùng (dùng chỉ số -1).',
    inputData: 'colors = ["do", "vang", "xanh", "tim"]',
    expectedOutput: 'do\ntim',
    starterCode: 'colors = ["do", "vang", "xanh", "tim"]\n# In phần tử đầu và cuối\nprint(colors[0])\nprint(colors[-1])',
    testCases: [{ input: 'colors', output: 'do\ntim' }]
  },
  {
    id: 'T03_M',
    unitId: 'K03',
    title: 'Truy xuất phần tử áp chót và phần tử giữa',
    level: 'Trung bình',
    objective: 'Thực hành định vị phần tử bằng cả chỉ số dương và chỉ số âm (-2).',
    requirement: 'Cho days = ["Thu 2", "Thu 3", "Thu 4", "Thu 5", "Thu 6", "Thu 7", "Chu nhat"]. In ra ngày ở giữa tuần (chỉ số 3) và ngày áp chót (chỉ số -2).',
    inputData: 'days = ["Thu 2", "Thu 3", "Thu 4", "Thu 5", "Thu 6", "Thu 7", "Chu nhat"]',
    expectedOutput: 'Thu 5\nThu 7',
    starterCode: 'days = ["Thu 2", "Thu 3", "Thu 4", "Thu 5", "Thu 6", "Thu 7", "Chu nhat"]\n# In ngày thứ 4 (index 3) và ngày thứ 7 (index -2)\nprint(days[3])\nprint(days[-2])',
    testCases: [{ input: 'days', output: 'Thu 5\nThu 7' }]
  },
  {
    id: 'T03_A',
    unitId: 'K03',
    title: 'Hoán đổi phần tử đầu và cuối bằng chỉ số',
    level: 'Vận dụng',
    objective: 'Vận dụng chỉ số danh sách để trích xuất và hoán đổi giá trị giữa 2 vị trí mà không dùng hàm phụ.',
    requirement: 'Cho a = [10, 20, 30, 40, 50]. Hãy hoán đổi giá trị phần tử đầu tiên a[0] và phần tử cuối cùng a[-1] rồi in danh sách sau khi hoán đổi.',
    inputData: 'a = [10, 20, 30, 40, 50]',
    expectedOutput: '[50, 20, 30, 40, 10]',
    starterCode: 'a = [10, 20, 30, 40, 50]\n# Hoán đổi a[0] và a[-1]\na[0], a[-1] = a[-1], a[0]\nprint(a)',
    testCases: [{ input: 'a', output: '[50, 20, 30, 40, 10]' }]
  },

  // ==================== K04: Hàm len() ====================
  {
    id: 'T04',
    unitId: 'K04',
    title: 'Đếm số lượng môn học',
    level: 'Cơ bản',
    objective: 'Sử dụng hàm len() với danh sách.',
    requirement: 'Cho subjects = ["Toan", "Van", "Anh", "Tin", "Ly"]. Tính và in ra số lượng môn học.',
    inputData: 'subjects = ["Toan", "Van", "Anh", "Tin", "Ly"]',
    expectedOutput: '5',
    starterCode: 'subjects = ["Toan", "Van", "Anh", "Tin", "Ly"]\n# Dùng len() in ra số lượng\nprint(len(subjects))',
    testCases: [{ input: 'subjects', output: '5' }]
  },
  {
    id: 'T04_M',
    unitId: 'K04',
    title: 'Kiểm tra danh sách rỗng bằng hàm len()',
    level: 'Trung bình',
    objective: 'Phối hợp hàm len() với câu lệnh điều kiện if để kiểm tra tính rỗng của danh sách.',
    requirement: 'Cho danh sách tasks = []. Dùng len(tasks) để kiểm tra: nếu danh sách có độ dài bằng 0 thì in "Danh sach rong", ngược lại in số lượng phần tử.',
    inputData: 'tasks = []',
    expectedOutput: 'Danh sach rong',
    starterCode: 'tasks = []\n# Kiểm tra len(tasks)\nif len(tasks) == 0:\n    print("Danh sach rong")\nelse:\n    print(len(tasks))',
    testCases: [{ input: 'tasks = []', output: 'Danh sach rong' }]
  },
  {
    id: 'T04_A',
    unitId: 'K04',
    title: 'Tìm chỉ số phần tử chính giữa dựa trên len()',
    level: 'Vận dụng',
    objective: 'Vận dụng len() và phép chia nguyên // 2 để định vị động phần tử trung tâm của danh sách bất kỳ.',
    requirement: 'Cho a = [12, 45, 67, 89, 23, 56, 78]. Hãy tính độ dài n của danh sách, tìm vị trí chính giữa mid = n // 2 và in ra độ dài kèm giá trị phần tử tại vị trí mid.',
    inputData: 'a = [12, 45, 67, 89, 23, 56, 78]',
    expectedOutput: 'Do dai: 7\nPhan tu giua: 89',
    starterCode: 'a = [12, 45, 67, 89, 23, 56, 78]\nn = len(a)\nmid = n // 2\nprint(f"Do dai: {n}")\nprint(f"Phan tu giua: {a[mid]}")',
    testCases: [{ input: 'a', output: 'Do dai: 7\nPhan tu giua: 89' }]
  },

  // ==================== K05: Truy cập và thay đổi phần tử ====================
  {
    id: 'T05_B',
    unitId: 'K05',
    title: 'Sửa tên thành phố trong danh sách',
    level: 'Cơ bản',
    objective: 'Hiểu tính thay đổi được (mutable) của list qua phép gán phần tử a[index] = value.',
    requirement: 'Cho cities = ["Ha Noi", "Da Nang", "Sai Gon"]. Hãy thay đổi phần tử thứ 2 ("Da Nang", chỉ số 1) thành "Hue" và in lại danh sách.',
    inputData: 'cities = ["Ha Noi", "Da Nang", "Sai Gon"]',
    expectedOutput: "['Ha Noi', 'Hue', 'Sai Gon']",
    starterCode: 'cities = ["Ha Noi", "Da Nang", "Sai Gon"]\n# Gán cities[1] thành "Hue"\ncities[1] = "Hue"\nprint(cities)',
    testCases: [{ input: 'cities', output: "['Ha Noi', 'Hue', 'Sai Gon']" }]
  },
  {
    id: 'T05',
    unitId: 'K05',
    title: 'Cập nhật điểm kiểm tra',
    level: 'Trung bình',
    objective: 'Truy cập và thay đổi giá trị phần tử.',
    requirement: 'Cho grades = [6, 7, 8, 5]. Học sinh được phúc khảo và điểm số thứ 3 (chỉ số 2) được sửa thành 9. Hãy cập nhật và in danh sách mới.',
    inputData: 'grades = [6, 7, 8, 5]',
    expectedOutput: '[6, 7, 9, 5]',
    starterCode: 'grades = [6, 7, 8, 5]\n# Sửa phần tử thứ 3 thành 9\ngrades[2] = 9\nprint(grades)',
    testCases: [{ input: 'grades', output: '[6, 7, 9, 5]' }]
  },
  {
    id: 'T05_A',
    unitId: 'K05',
    title: 'Cập nhật nhiều vị trí trong danh sách theo quy luật',
    level: 'Vận dụng',
    objective: 'Truy cập và cập nhật đồng thời nhiều vị trí trong danh sách theo quy luật.',
    requirement: 'Cho nums = [10, 20, 30, 40, 50]. Hãy tăng giá trị tại vị trí đầu tiên (chỉ số 0), vị trí giữa (chỉ số 2) và vị trí cuối (chỉ số -1) thêm 5 đơn vị. In danh sách kết quả.',
    inputData: 'nums = [10, 20, 30, 40, 50]',
    expectedOutput: '[15, 20, 35, 40, 55]',
    starterCode: 'nums = [10, 20, 30, 40, 50]\n# Tăng nums[0], nums[2], nums[-1] thêm 5\nnums[0] += 5\nnums[2] += 5\nnums[-1] += 5\nprint(nums)',
    testCases: [{ input: 'nums', output: '[15, 20, 35, 40, 55]' }]
  },

  // ==================== K06: Thêm phần tử append() ====================
  {
    id: 'T06_B',
    unitId: 'K06',
    title: 'Thêm số vào danh sách với append()',
    level: 'Cơ bản',
    objective: 'Làm quen với phương thức append() đưa phần tử vào cuối danh sách.',
    requirement: 'Tạo danh sách numbers = []. Dùng lệnh numbers.append(100) để thêm số 100 vào danh sách và in kết quả.',
    inputData: 'Không có',
    expectedOutput: '[100]',
    starterCode: 'numbers = []\n# Dùng append thêm số 100\nnumbers.append(100)\nprint(numbers)',
    testCases: [{ input: 'None', output: '[100]' }]
  },
  {
    id: 'T06',
    unitId: 'K06',
    title: 'Thêm học sinh vào danh sách lớp',
    level: 'Trung bình',
    objective: 'Sử dụng phương thức append().',
    requirement: 'Cho class_list = ["An", "Binh"]. Thêm học sinh "Chi" và "Dung" vào cuối danh sách bằng append() rồi in ra.',
    inputData: 'class_list = ["An", "Binh"]',
    expectedOutput: "['An', 'Binh', 'Chi', 'Dung']",
    starterCode: 'class_list = ["An", "Binh"]\n# Thêm Chi và Dung\nclass_list.append("Chi")\nclass_list.append("Dung")\nprint(class_list)',
    testCases: [{ input: 'class_list', output: "['An', 'Binh', 'Chi', 'Dung']" }]
  },
  {
    id: 'T06_A',
    unitId: 'K06',
    title: 'Tạo danh sách số chính phương bằng append()',
    level: 'Vận dụng',
    objective: 'Kết hợp vòng lặp for với append() để tạo danh sách dữ liệu động có quy luật toán học.',
    requirement: 'Tạo danh sách squares = []. Dùng vòng lặp for với i chạy từ 1 đến 5 để tính i*i và append vào squares. In danh sách kết quả.',
    inputData: 'Không có',
    expectedOutput: '[1, 4, 9, 16, 25]',
    starterCode: 'squares = []\n# Vòng lặp for i in range(1, 6) và append i*i\nfor i in range(1, 6):\n    squares.append(i * i)\nprint(squares)',
    testCases: [{ input: 'None', output: '[1, 4, 9, 16, 25]' }]
  },

  // ==================== K07: Chèn phần tử insert() ====================
  {
    id: 'T07_B',
    unitId: 'K07',
    title: 'Chèn phần tử vào đầu danh sách với insert()',
    level: 'Cơ bản',
    objective: 'Hiểu cú pháp insert(0, value) để bổ sung phần tử vào vị trí đầu tiên.',
    requirement: 'Cho danh sách books = ["Toan", "Tin"]. Dùng lệnh insert(0, "Van") để chèn môn "Van" vào đầu danh sách và in ra.',
    inputData: 'books = ["Toan", "Tin"]',
    expectedOutput: "['Van', 'Toan', 'Tin']",
    starterCode: 'books = ["Toan", "Tin"]\n# Chèn "Van" vào vị trí 0\nbooks.insert(0, "Van")\nprint(books)',
    testCases: [{ input: 'books', output: "['Van', 'Toan', 'Tin']" }]
  },
  {
    id: 'T07',
    unitId: 'K07',
    title: 'Chèn học sinh vào đội hình',
    level: 'Trung bình',
    objective: 'Sử dụng phương thức insert().',
    requirement: 'Cho queue = ["Lan", "Hung", "Mai"]. Chèn tên "Tuan" vào vị trí index 1 bằng insert(). In ra danh sách.',
    inputData: 'queue = ["Lan", "Hung", "Mai"]',
    expectedOutput: "['Lan', 'Tuan', 'Hung', 'Mai']",
    starterCode: 'queue = ["Lan", "Hung", "Mai"]\n# Chèn Tuan vào vị trí 1\nqueue.insert(1, "Tuan")\nprint(queue)',
    testCases: [{ input: 'queue', output: "['Lan', 'Tuan', 'Hung', 'Mai']" }]
  },
  {
    id: 'T07_A',
    unitId: 'K07',
    title: 'Chèn phần tử bảo toàn trật tự tăng dần',
    level: 'Vận dụng',
    objective: 'Phối hợp câu lệnh rẽ nhánh và insert() để chèn một phần tử vào vị trí thích hợp bảo đảm tính tăng dần.',
    requirement: 'Cho sorted_nums = [10, 20, 40, 50]. Cần chèn số 30 vào giữa 20 và 40 (vị trí index 2) để danh sách vẫn tăng dần. Dùng insert(2, 30) và in kết quả.',
    inputData: 'sorted_nums = [10, 20, 40, 50]',
    expectedOutput: '[10, 20, 30, 40, 50]',
    starterCode: 'sorted_nums = [10, 20, 40, 50]\n# Chèn 30 vào vị trí 2\nsorted_nums.insert(2, 30)\nprint(sorted_nums)',
    testCases: [{ input: 'sorted_nums', output: '[10, 20, 30, 40, 50]' }]
  },

  // ==================== K08: Xóa phần tử remove(), pop() ====================
  {
    id: 'T08_B',
    unitId: 'K08',
    title: 'Xóa phần tử theo giá trị với remove()',
    level: 'Cơ bản',
    objective: 'Nắm vững cú pháp remove(x) để xóa phần tử đầu tiên có giá trị x.',
    requirement: 'Cho animals = ["cho", "meo", "ga", "meo"]. Hãy xóa giá trị "meo" đầu tiên bằng lệnh remove("meo") và in danh sách ra.',
    inputData: 'animals = ["cho", "meo", "ga", "meo"]',
    expectedOutput: "['cho', 'ga', 'meo']",
    starterCode: 'animals = ["cho", "meo", "ga", "meo"]\n# Dùng remove("meo")\nanimals.remove("meo")\nprint(animals)',
    testCases: [{ input: 'animals', output: "['cho', 'ga', 'meo']" }]
  },
  {
    id: 'T08',
    unitId: 'K08',
    title: 'Quản lý giỏ hàng',
    level: 'Trung bình',
    objective: 'Thực hành remove() và pop().',
    requirement: 'Cho cart = ["sach", "but", "thuoc", "tay"]. Xóa "but" bằng remove() và xóa phần tử cuối bằng pop(). In giỏ hàng còn lại.',
    inputData: 'cart = ["sach", "but", "thuoc", "tay"]',
    expectedOutput: "['sach', 'thuoc']",
    starterCode: 'cart = ["sach", "but", "thuoc", "tay"]\n# Xóa but và pop phần tử cuối\ncart.remove("but")\ncart.pop()\nprint(cart)',
    testCases: [{ input: 'cart', output: "['sach', 'thuoc']" }]
  },
  {
    id: 'T08_A',
    unitId: 'K08',
    title: 'Xử lý phần tử lấy ra từ ngăn xếp với pop()',
    level: 'Vận dụng',
    objective: 'Vận dụng phương thức pop() trả về giá trị phần tử bị xóa để lưu trữ và xử lý tiếp.',
    requirement: 'Cho stack = [5, 12, 18, 25]. Hãy dùng val = stack.pop() để lấy ra phần tử cuối cùng, in giá trị val đã lấy ra và in danh sách stack còn lại.',
    inputData: 'stack = [5, 12, 18, 25]',
    expectedOutput: 'Gia tri lay ra: 25\nNgan xep con lai: [5, 12, 18]',
    starterCode: 'stack = [5, 12, 18, 25]\nval = stack.pop()\nprint(f"Gia tri lay ra: {val}")\nprint(f"Ngan xep con lai: {stack}")',
    testCases: [{ input: 'stack', output: 'Gia tri lay ra: 25\nNgan xep con lai: [5, 12, 18]' }]
  },

  // ==================== K09: Duyệt danh sách bằng for ====================
  {
    id: 'T09_B',
    unitId: 'K09',
    title: 'In từng phần tử trên mỗi dòng với vòng lặp for',
    level: 'Cơ bản',
    objective: 'Nắm vững cú pháp cơ bản của vòng lặp for item in list:.',
    requirement: 'Cho colors = ["Xanh", "Do", "Tim"]. Dùng vòng lặp for in mỗi màu trên một dòng riêng biệt.',
    inputData: 'colors = ["Xanh", "Do", "Tim"]',
    expectedOutput: 'Xanh\nDo\nTim',
    starterCode: 'colors = ["Xanh", "Do", "Tim"]\n# Dùng vòng lặp for in từng phần tử\nfor c in colors:\n    print(c)',
    testCases: [{ input: 'colors', output: 'Xanh\nDo\nTim' }]
  },
  {
    id: 'T09_M',
    unitId: 'K09',
    title: 'Tính tổng các số bằng vòng lặp for',
    level: 'Trung bình',
    objective: 'Phối hợp biến tích lũy total += item bên trong vòng lặp for duyệt trực tiếp phần tử.',
    requirement: 'Cho nums = [5, 10, 15, 20]. Khởi tạo total = 0, dùng vòng lặp for x in nums: để cộng dồn vào total và in ra kết quả tổng.',
    inputData: 'nums = [5, 10, 15, 20]',
    expectedOutput: 'Tong: 50',
    starterCode: 'nums = [5, 10, 15, 20]\ntotal = 0\nfor x in nums:\n    total += x\nprint(f"Tong: {total}")',
    testCases: [{ input: 'nums', output: 'Tong: 50' }]
  },
  {
    id: 'T09',
    unitId: 'K09',
    title: 'In danh sách việc cần làm',
    level: 'Vận dụng',
    objective: 'Duyệt danh sách bằng vòng lặp for.',
    requirement: 'Cho todos = ["Lam bai tap", "Nau com", "Quet nha"]. Dùng vòng lặp for in từng việc cần làm kèm số thứ tự (1, 2, 3).',
    inputData: 'todos = ["Lam bai tap", "Nau com", "Quet nha"]',
    expectedOutput: '1. Lam bai tap\n2. Nau com\n3. Quet nha',
    starterCode: 'todos = ["Lam bai tap", "Nau com", "Quet nha"]\n# Dùng vòng lặp in danh sách\nfor i, task in enumerate(todos, 1):\n    print(f"{i}. {task}")',
    testCases: [{ input: 'todos', output: '1. Lam bai tap\n2. Nau com\n3. Quet nha' }]
  },

  // ==================== K10: Duyệt theo chỉ số ====================
  {
    id: 'T10_B',
    unitId: 'K10',
    title: 'In phần tử kèm chỉ số vị trí',
    level: 'Cơ bản',
    objective: 'Sử dụng for i in range(len(list)) để biết cả vị trí và giá trị phần tử.',
    requirement: 'Cho cities = ["Ha Noi", "Hue", "Can Tho"]. Dùng vòng lặp theo chỉ số i để in ra theo mẫu: Vi tri 0: Ha Noi, Vi tri 1: Hue, Vi tri 2: Can Tho.',
    inputData: 'cities = ["Ha Noi", "Hue", "Can Tho"]',
    expectedOutput: 'Vi tri 0: Ha Noi\nVi tri 1: Hue\nVi tri 2: Can Tho',
    starterCode: 'cities = ["Ha Noi", "Hue", "Can Tho"]\nfor i in range(len(cities)):\n    print(f"Vi tri {i}: {cities[i]}")',
    testCases: [{ input: 'cities', output: 'Vi tri 0: Ha Noi\nVi tri 1: Hue\nVi tri 2: Can Tho' }]
  },
  {
    id: 'T10_M',
    unitId: 'K10',
    title: 'Cập nhật các phần tử ở vị trí chẵn',
    level: 'Trung bình',
    objective: 'Vận dụng chỉ số i để áp dụng điều kiện if i % 2 == 0 nhằm thay đổi phần tử tại vị trí chẵn.',
    requirement: 'Cho a = [10, 10, 10, 10, 10]. Duyệt qua chỉ số i từ 0 đến len(a)-1, nếu i là số chẵn (i % 2 == 0) thì tăng a[i] lên 1 đơn vị. In danh sách a sau khi sửa.',
    inputData: 'a = [10, 10, 10, 10, 10]',
    expectedOutput: '[11, 10, 11, 10, 11]',
    starterCode: 'a = [10, 10, 10, 10, 10]\nfor i in range(len(a)):\n    if i % 2 == 0:\n        a[i] += 1\nprint(a)',
    testCases: [{ input: 'a', output: '[11, 10, 11, 10, 11]' }]
  },
  {
    id: 'T10',
    unitId: 'K10',
    title: 'Nhân đôi giá trị danh sách số',
    level: 'Vận dụng',
    objective: 'Duyệt danh sách theo chỉ số để thay đổi giá trị.',
    requirement: 'Cho nums = [1, 2, 3, 4, 5]. Dùng vòng lặp theo chỉ số range(len(nums)) để nhân đôi mỗi phần tử trong danh sách gốc. In ra nums.',
    inputData: 'nums = [1, 2, 3, 4, 5]',
    expectedOutput: '[2, 4, 6, 8, 10]',
    starterCode: 'nums = [1, 2, 3, 4, 5]\n# Nhân đôi từng phần tử qua chỉ số\nfor i in range(len(nums)):\n    nums[i] *= 2\nprint(nums)',
    testCases: [{ input: 'nums', output: '[2, 4, 6, 8, 10]' }]
  },

  // ==================== K11: Tìm kiếm trong danh sách ====================
  {
    id: 'T11_B',
    unitId: 'K11',
    title: 'Kiểm tra sự tồn tại với từ khóa in',
    level: 'Cơ bản',
    objective: 'Nắm vững toán tử in để kiểm tra nhanh sự có mặt của phần tử trong danh sách.',
    requirement: 'Cho fruits = ["tao", "chuoi", "cam"]. Kiểm tra xem "chuoi" có trong danh sách không, nếu có in "Co chuoi", ngược lại in "Khong co".',
    inputData: 'fruits = ["tao", "chuoi", "cam"]',
    expectedOutput: 'Co chuoi',
    starterCode: 'fruits = ["tao", "chuoi", "cam"]\nif "chuoi" in fruits:\n    print("Co chuoi")\nelse:\n    print("Khong co")',
    testCases: [{ input: 'fruits', output: 'Co chuoi' }]
  },
  {
    id: 'T11_M',
    unitId: 'K11',
    title: 'Đếm số lần xuất hiện với count()',
    level: 'Trung bình',
    objective: 'Sử dụng phương thức list.count(x) để đếm tần suất xuất hiện của một giá trị.',
    requirement: 'Cho danh sách điểm grades = [8, 9, 7, 8, 10, 8, 6]. Dùng phương thức count(8) để đếm số bạn đạt điểm 8 và in kết quả theo mẫu: So diem 8: 3.',
    inputData: 'grades = [8, 9, 7, 8, 10, 8, 6]',
    expectedOutput: 'So diem 8: 3',
    starterCode: 'grades = [8, 9, 7, 8, 10, 8, 6]\ncnt = grades.count(8)\nprint(f"So diem 8: {cnt}")',
    testCases: [{ input: 'grades', output: 'So diem 8: 3' }]
  },
  {
    id: 'T11',
    unitId: 'K11',
    title: 'Tìm kiếm tên học sinh',
    level: 'Vận dụng',
    objective: 'Kiểm tra phần tử bằng in và tìm vị trí.',
    requirement: 'Cho names = ["Nam", "Binh", "Chau", "Duc"]. Kiểm tra xem "Chau" có trong danh sách không, nếu có in ra vị trí (index) của bạn đó.',
    inputData: 'names = ["Nam", "Binh", "Chau", "Duc"]',
    expectedOutput: 'Tim thay Chau tai vi tri 2',
    starterCode: 'names = ["Nam", "Binh", "Chau", "Duc"]\n# Tìm kiếm và in vị trí\nif "Chau" in names:\n    idx = names.index("Chau")\n    print(f"Tim thay Chau tai vi tri {idx}")',
    testCases: [{ input: 'names', output: 'Tim thay Chau tai vi tri 2' }]
  },

  // ==================== K12: Tổng hợp và xử lý dữ liệu ====================
  {
    id: 'T12_B',
    unitId: 'K12',
    title: 'Tính tổng và tìm giá trị nhỏ nhất với hàm built-in',
    level: 'Cơ bản',
    objective: 'Nắm bắt cách gọi trực tiếp các hàm sum() và min() trên danh sách số nguyên.',
    requirement: 'Cho nums = [15, 8, 24, 6, 30]. Dùng hàm sum(nums) tính tổng và min(nums) tìm giá trị nhỏ nhất. In kết quả trên 2 dòng.',
    inputData: 'nums = [15, 8, 24, 6, 30]',
    expectedOutput: 'Tong: 83\nNho nhat: 6',
    starterCode: 'nums = [15, 8, 24, 6, 30]\nprint(f"Tong: {sum(nums)}")\nprint(f"Nho nhat: {min(nums)}")',
    testCases: [{ input: 'nums', output: 'Tong: 83\nNho nhat: 6' }]
  },
  {
    id: 'T12_M',
    unitId: 'K12',
    title: 'Lọc và tính tổng các số chẵn trong danh sách',
    level: 'Trung bình',
    objective: 'Kết hợp duyệt danh sách, câu lệnh điều kiện % 2 == 0 để tính tổng có điều kiện.',
    requirement: 'Cho a = [1, 2, 3, 4, 5, 6, 7, 8]. Tính và in ra tổng của các số chẵn có trong danh sách a theo mẫu: Tong chan: 20.',
    inputData: 'a = [1, 2, 3, 4, 5, 6, 7, 8]',
    expectedOutput: 'Tong chan: 20',
    starterCode: 'a = [1, 2, 3, 4, 5, 6, 7, 8]\neven_sum = sum(x for x in a if x % 2 == 0)\nprint(f"Tong chan: {even_sum}")',
    testCases: [{ input: 'a', output: 'Tong chan: 20' }]
  },
  {
    id: 'T12',
    unitId: 'K12',
    title: 'Thống kê điểm số lớp học',
    level: 'Vận dụng',
    objective: 'Tổng hợp dữ liệu với sum(), max(), min().',
    requirement: 'Cho scores = [7.5, 8.0, 9.2, 6.5, 8.5]. Tính điểm cao nhất (max), thấp nhất (min) và điểm trung bình (sum/len). In kết quả.',
    inputData: 'scores = [7.5, 8.0, 9.2, 6.5, 8.5]',
    expectedOutput: 'Max: 9.2\nMin: 6.5\nAvg: 7.94',
    starterCode: 'scores = [7.5, 8.0, 9.2, 6.5, 8.5]\n# Tính max, min, avg\nprint(f"Max: {max(scores)}")\nprint(f"Min: {min(scores)}")\nprint(f"Avg: {round(sum(scores)/len(scores), 2)}")',
    testCases: [{ input: 'scores', output: 'Max: 9.2\nMin: 6.5\nAvg: 7.94' }]
  }
];

export const DEMO_STUDENT_PROFILES: Record<string, StudentProfile> = {
  HS01: {
    id: 'HS01',
    name: 'Nguyễn Văn An (HS01)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    description: 'Học sinh chưa nắm kiến thức cơ bản về biến và khởi tạo danh sách.',
    isDiagnosticCompleted: false,
    diagnosticSource: 'simulated_default',
    diagnosticScores: { K01: 40, K02: 35, K03: 45, K04: 30, K05: 20, K06: 15, K07: 10, K08: 10, K09: 20, K10: 10, K11: 15, K12: 10 },
    masteredUnits: [],
    rawScoreMasteredUnits: [],
    currentRecommendation: {
      path: 'Củng cố toàn diện các đơn vị nền tảng K01 đến K04 (Khái niệm, Khởi tạo, Chỉ số, Hàm len).',
      level: 'Củng cố',
      rationale: 'Điểm chẩn đoán dưới 50% ở các kiến thức nền tảng (Quy tắc ngưỡng <50% là Củng cố). Vi phạm điều kiện tiên quyết.',
      status: 'Chờ kiểm duyệt'
    },
    submissionsCount: 2
  },
  HS02: {
    id: 'HS02',
    name: 'Trần Thị Bình (HS02)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    description: 'Nắm vững cơ bản nhưng gặp khó khăn với các thao tác thêm, chèn, xóa phần tử (K06-K08).',
    isDiagnosticCompleted: false,
    diagnosticSource: 'simulated_default',
    diagnosticScores: { K01: 85, K02: 90, K03: 80, K04: 85, K05: 75, K06: 45, K07: 40, K08: 50, K09: 65, K10: 60, K11: 70, K12: 55 },
    masteredUnits: ['K01', 'K02', 'K03', 'K04'],
    rawScoreMasteredUnits: ['K01', 'K02', 'K03', 'K04'],
    currentRecommendation: {
      path: 'Củng cố nhóm thao tác thêm/xóa phần tử append(), insert(), remove() và pop() (K06–K08).',
      level: 'Củng cố',
      rationale: 'Điểm K06 (45%) và K07 (40%) dưới 50%. Điểm K08 đạt 50% (ngưỡng tối thiểu Luyện tập). Điểm trung bình nhóm thao tác K06–K08 là 45% (<50%). Căn cứ quy tắc phân tuyến dưới 50% là Củng cố, hệ thống đề xuất mức Củng cố cho nhóm kỹ năng này.',
      status: 'Chờ kiểm duyệt'
    },
    submissionsCount: 6
  },
  HS03: {
    id: 'HS03',
    name: 'Lê Hoàng Cường (HS03)',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    description: 'Đã biết thao tác List cơ bản nhưng lúng túng khi kết hợp vòng lặp for và xử lý dữ liệu (K09-K12).',
    isDiagnosticCompleted: false,
    diagnosticSource: 'simulated_default',
    diagnosticScores: { K01: 90, K02: 95, K03: 90, K04: 90, K05: 85, K06: 80, K07: 85, K08: 80, K09: 55, K10: 50, K11: 45, K12: 40 },
    masteredUnits: ['K01', 'K02', 'K03', 'K04', 'K05', 'K06', 'K07', 'K08'],
    rawScoreMasteredUnits: ['K01', 'K02', 'K03', 'K04', 'K05', 'K06', 'K07', 'K08'],
    currentRecommendation: {
      path: 'Luyện tập chuyên sâu kỹ thuật duyệt danh sách K09–K10 và tìm kiếm K11 (Điểm trong khoảng 50%–79%).',
      level: 'Luyện tập',
      rationale: 'Thao tác danh sách cơ bản (K01-K08) đạt chuẩn (>=80%), tuy nhiên nhóm kỹ năng duyệt vòng lặp và xử lý dữ liệu (K09-K12) có K09 (55%) và K10 (50%) thuộc ngưỡng Luyện tập từ 50% đến dưới 80%.',
      status: 'Chờ kiểm duyệt'
    },
    submissionsCount: 8
  },
  HS04: {
    id: 'HS04',
    name: 'Phạm Minh Dung (HS04)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    description: 'Nắm vững phần lớn kiến thức, thành thạo cả vòng lặp lẫn hàm tổng hợp.',
    isDiagnosticCompleted: false,
    diagnosticSource: 'simulated_default',
    diagnosticScores: { K01: 95, K02: 95, K03: 90, K04: 100, K05: 90, K06: 95, K07: 90, K08: 90, K09: 95, K10: 90, K11: 95, K12: 92 },
    masteredUnits: ['K01', 'K02', 'K03', 'K04', 'K05', 'K06', 'K07', 'K08', 'K09', 'K10', 'K11', 'K12'],
    rawScoreMasteredUnits: ['K01', 'K02', 'K03', 'K04', 'K05', 'K06', 'K07', 'K08', 'K09', 'K10', 'K11', 'K12'],
    currentRecommendation: {
      path: 'Thực hiện các nhiệm vụ Vận dụng cao (T09–T12) và dự án tổng hợp xử lý dữ liệu thực tế.',
      level: 'Vận dụng',
      rationale: 'Toàn bộ 12 đơn vị kiến thức đạt điểm ≥80% (ngưỡng Vận dụng) và đã được xác nhận đáp ứng đầy đủ chuỗi kiến thức tiên quyết.',
      status: 'Chờ kiểm duyệt'
    },
    submissionsCount: 12
  }
};

// 5 BÀI NỘP PHÁT SINH TRONG QUÁ TRÌNH NGHIỆM THU (KIỂM THỬ HỒ SƠ DEMO HS01-HS04)
// Bảo toàn các bài nộp lịch sử SUB-7157, SUB-2130 (minh chứng lỗi đặc tả) và SUB-4673 (đã biên tập chuẩn)
export const ACCEPTANCE_TESTING_SUBMISSIONS: CodeSubmission[] = [
  {
    id: 'SUB-4673',
    submissionId: 'SUB-4673',
    studentId: 'HS02',
    studentName: 'Trần Thị Bình',
    taskId: 'T01',
    knowledgeUnitId: 'K01',
    taskTitle: 'T01 - Khám phá danh sách trái cây',
    taskType: 'regular',
    taskDescription: 'Tạo một danh sách Python tên `fruits` gồm tên của ba loại quả bất kỳ. In toàn bộ danh sách ra màn hình.',
    learningObjectives: 'Làm quen với cú pháp khởi tạo danh sách bằng dấu ngoặc vuông [] và hàm in print().',
    inputSpecification: 'Không có dữ liệu đầu vào từ bàn phím.',
    expectedOutput: "Danh sách gồm 3 chuỗi ký tự, ví dụ: ['cam', 'quyt', 'mit']",
    assessmentCriteria: 'Đánh giá theo Rubric 5 tiêu chí: C1 (3 loại quả), C2 (in danh sách), C3 (danh sách không rỗng), C4 (dễ đọc), C5 (chú thích).',
    code: 'fruits = ["cam", "quyt", "mit"]\nprint(fruits)',
    studentCode: 'fruits = ["cam", "quyt", "mit"]\nprint(fruits)',
    submittedAt: '2026-11-06 08:30:00',
    submissionTime: '2026-11-06 08:30:00',
    overallScore: 8.0,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu nhiệm vụ', score: 10, level: 'Đạt', evidence: 'Tạo danh sách fruits chứa 3 chuỗi ký tự hợp lệ.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn thuật toán & cú pháp', score: 10, level: 'Đạt', evidence: 'Cú pháp Python chuẩn xác, print(fruits) hoạt động không lỗi.' },
      { criteriaId: 3, criteriaName: 'Xử lý dữ liệu biên & Ngoại lệ', score: 10, level: 'Đạt', evidence: 'Danh sách có đúng 3 phần tử, không bị rỗng.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc mã nguồn & Phong cách', score: 10, level: 'Đạt', evidence: 'Đặt tên biến đúng theo yêu cầu fruits, định dạng chuẩn.' },
      { criteriaId: 5, criteriaName: 'Giải thích quá trình & Suy luận', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Mã nguồn không có dòng chú thích (#) giải thích quá trình.' }
    ],
    aiFeedback: {
      evidence: 'Học sinh khởi tạo biến fruits gán bằng danh sách 3 chuỗi ký tự và in ra màn hình bằng lệnh print(fruits).',
      assessment: 'Chương trình tạo danh sách cơ bản hợp lệ theo đặc tả nhưng chưa có thao tác giải thích cấu trúc dữ liệu hoặc truy xuất chi tiết.',
      suggestion: 'Em có thể tìm hiểu thêm cách truy cập phần tử thông qua chỉ mục index hoặc duyệt danh sách.',
      socraticQuestion: 'Em có biết làm thế nào để lấy ra phần tử đầu tiên của danh sách fruits không?'
    },
    errorCategory: 'meeting_requirements',
    errorDescription: 'Bài làm đạt yêu cầu tạo danh sách 3 phần tử và in ra màn hình.',
    analysisType: 'static_analysis',
    teacherReview: {
      status: 'Đã chỉnh sửa',
      reviewedBy: 'Cô giáo Nguyễn Thanh Hương',
      reviewedAt: '2026-11-06 11:30:00',
      teacherVerificationLabel: 'Đánh giá AI đúng',
      independentScore: 9.5,
      teacherComment: 'Đánh giá AI cơ bản đúng. Giáo viên đã hoàn thiện phản hồi học sinh theo phương pháp Socratic phù hợp với trình độ THCS.',
      editReason: 'Chuyển đổi bảo tồn cấu trúc dữ liệu: Tách bạch rõ lý do biên tập sư phạm khỏi nội dung phản hồi học sinh. Giáo viên hiệu chỉnh để hướng dẫn cú pháp duyệt danh sách for x in list thay vì chỉ gợi ý chung chung.',
      editedFeedback: {
        evidence: 'Dòng 1: Tạo danh sách fruits = ["cam", "quyt", "mit"]. Dòng 2: print(fruits) in toàn bộ danh sách ra màn hình.',
        assessment: 'Em đã hoàn thành chính xác yêu cầu tạo và xuất danh sách Python. Mã nguồn ngắn gọn, đúng cú pháp.',
        suggestion: 'Em hãy thử duyệt từng loại quả bằng vòng lặp: for fruit in fruits: print(fruit) để in mỗi quả trên một dòng riêng biệt.',
        socraticQuestion: 'Nếu danh sách có 100 loại quả, việc duyệt bằng vòng lặp for sẽ thuận tiện và chuyên nghiệp hơn in thủ công như thế nào?'
      },
      historicalAuditNote: 'Đã thực hiện chuyển đổi bảo tồn: Tách bạch rõ ràng aiFeedback (gốc AI), teacherReview.editedFeedback (phản hồi gửi học sinh) và teacherReview.editReason (nhật ký kiểm duyệt).',
      reviewDurationMinutes: 1.5,
      traditionalDurationMinutes: 5.0,
      hasCriticalError: false,
      evidenceAccuracyVerified: true,
      suggestionSuitabilityVerified: true
    },
    da4SyncRecommendation: {
      relatedUnits: ['K01'],
      proposedScoreDelta: { K01: 5 },
      rationale: 'Hoàn thành bài tập khởi tạo danh sách K01.',
      isApplied: true,
      appliedAt: '2026-11-06 11:35:00'
    },
    isSimulatedData: false,
    isSyntheticResearchSample: false,
    datasetOrigin: 'acceptance_testing'
  },
  {
    id: 'SUB-7157',
    submissionId: 'SUB-7157',
    studentId: 'HS03',
    studentName: 'Lê Hoàng Cường',
    taskId: 'T01',
    knowledgeUnitId: 'K01',
    taskTitle: 'T01 - Khám phá danh sách trái cây',
    taskType: 'regular',
    taskDescription: 'Tạo một danh sách Python tên `fruits` gồm ba loại quả bất kỳ và in ra màn hình.',
    learningObjectives: 'Khởi tạo danh sách và in dữ liệu.',
    inputSpecification: 'Không có đầu vào.',
    expectedOutput: "['tao', 'chuoi', 'cam']",
    assessmentCriteria: 'Đánh giá theo Rubric 5 tiêu chí.',
    code: 'fruits = ["tao", "chuoi", "cam"]\nprint(fruits)',
    studentCode: 'fruits = ["tao", "chuoi", "cam"]\nprint(fruits)',
    submittedAt: '2026-11-06 09:10:00',
    submissionTime: '2026-11-06 09:10:00',
    overallScore: 1.5,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu nhiệm vụ', score: 2.0, level: 'Chưa đạt', evidence: 'Mã không có logic nhập số nguyên n và xử lý danh sách số nguyên.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn thuật toán & cú pháp', score: 2.0, level: 'Chưa đạt', evidence: 'Không tìm thấy vòng lặp tính tổng hoặc tìm max.' },
      { criteriaId: 3, criteriaName: 'Xử lý dữ liệu biên & Ngoại lệ', score: 0.0, level: 'Chưa đạt', evidence: 'Không kiểm tra n=0.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc mã nguồn & Phong cách', score: 2.0, level: 'Chưa đạt', evidence: 'Chưa có cấu trúc xử lý đầy đủ.' },
      { criteriaId: 5, criteriaName: 'Giải thích quá trình & Suy luận', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có chú thích giải thích mã nguồn.' }
    ],
    aiFeedback: {
      evidence: 'Mã nguồn dòng 1 gán fruits = ["tao", "chuoi", "cam"], dòng 2 print(fruits). Không tìm thấy mã nhập số nguyên n, vòng lặp tính tổng, đếm số chẵn hoặc tìm phần tử lớn nhất.',
      assessment: 'Chương trình chưa giải quyết các yêu cầu cốt lõi của bài toán xử lý danh sách số nguyên.',
      suggestion: 'Cần nhập n, duyệt vòng lặp để nhập danh sách và tìm số lớn nhất.',
      socraticQuestion: 'Làm sao em tìm được số lớn nhất nếu không so sánh từng phần tử?'
    },
    errorCategory: 'logic_error',
    errorDescription: 'Minh chứng lịch sử: AI áp dụng nhầm đề bài xử lý mảng số nguyên K12 cho nhiệm vụ T01.',
    analysisType: 'static_analysis',
    teacherReview: {
      status: 'Đã chỉnh sửa',
      reviewedBy: 'Cô giáo Nguyễn Thanh Hương',
      reviewedAt: '2026-11-06 09:20:00',
      teacherVerificationLabel: 'Sai lệch đã xác minh',
      independentScore: 10.0,
      hasCriticalError: true,
      criticalErrorDetails: 'Lỗi đặc tả: AI áp dụng nhầm tiêu chí bài toán số nguyên tổng hợp K12 cho nhiệm vụ cơ bản T01 (K01). Học sinh làm đúng 100% đặc tả T01.',
      teacherComment: 'Minh chứng sai lệch đã xác minh: Điểm AI gốc 1.5/10 là sai lệch do thuật toán áp nhầm đề bài. Giáo viên thẩm định bài làm đạt 10/10.',
      editReason: 'Khắc phục sai lệch nghiêm trọng của AI về đặc tả nhiệm vụ. Giữ nguyên điểm cũ 1.5/10 làm minh chứng kiểm toán, công nhận điểm độc lập 10/10.',
      editedFeedback: {
        evidence: 'Dòng 1: Tạo danh sách fruits gồm đúng 3 loại quả "tao", "chuoi", "cam". Dòng 2: In toàn bộ danh sách ra màn hình.',
        assessment: 'Bài làm xuất sắc! Em đã hoàn thành đúng 100% yêu cầu của nhiệm vụ T01.',
        suggestion: 'Em có thể tìm hiểu thêm cách thêm một loại quả mới vào danh sách bằng phương thức fruits.append("nho").',
        socraticQuestion: 'Nếu muốn thêm quả "nho" vào cuối danh sách fruits hiện tại, em sẽ dùng câu lệnh nào?'
      },
      historicalAuditNote: 'Minh chứng lịch sử: Lỗi đánh giá sai đặc tả nhiệm vụ T01 trước khi sửa thuật toán. Điểm AI cũ: 1.5/10. Giáo viên đã xác nhận sai lệch.',
      reEvaluation: {
        version: 'da6_v2_task_specific',
        reEvaluatedAt: '2026-11-06 10:30:00',
        newScore: 10.0,
        rationale: 'Sau khi phân hệ DA6 được cập nhật hỗ trợ phân tích tĩnh theo đặc tả riêng của từng nhiệm vụ, thuật toán v2 đánh giá bài làm đạt 10/10.',
        linkedOriginalSubmissionId: 'SUB-7157'
      },
      reviewDurationMinutes: 1.5,
      traditionalDurationMinutes: 5.0,
      evidenceAccuracyVerified: false,
      suggestionSuitabilityVerified: false
    },
    da4SyncRecommendation: {
      relatedUnits: ['K01'],
      proposedScoreDelta: { K01: 5 },
      rationale: 'Bài nộp T01 đã được giáo viên thẩm định đạt 10/10.',
      isApplied: false
    },
    isSimulatedData: false,
    isSyntheticResearchSample: false,
    datasetOrigin: 'acceptance_testing'
  },
  {
    id: 'SUB-2130',
    submissionId: 'SUB-2130',
    studentId: 'HS03',
    studentName: 'Lê Hoàng Cường',
    taskId: 'T01',
    knowledgeUnitId: 'K01',
    taskTitle: 'T01 - Khám phá danh sách trái cây',
    taskType: 'regular',
    taskDescription: 'Tạo một danh sách Python tên `fruits` gồm tên của ba loại quả bất kỳ và in ra màn hình.',
    learningObjectives: 'Khởi tạo danh sách với các phần tử linh hoạt.',
    inputSpecification: 'Không có đầu vào.',
    expectedOutput: "['xoai', 'mit', 'oi']",
    assessmentCriteria: 'Đánh giá theo Rubric 5 tiêu chí.',
    code: 'fruits = ["xoai", "mit", "oi"]\nprint(fruits)',
    studentCode: 'fruits = ["xoai", "mit", "oi"]\nprint(fruits)',
    submittedAt: '2026-11-06 09:55:00',
    submissionTime: '2026-11-06 09:55:00',
    overallScore: 6.2,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu nhiệm vụ', score: 5.0, level: 'Cần cố gắng', evidence: 'Danh sách thiếu 3 loại quả chuẩn "tao", "chuoi", "cam" theo dữ liệu mẫu.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn thuật toán & cú pháp', score: 10.0, level: 'Đạt', evidence: 'Cú pháp chuẩn, in danh sách hoạt động chính xác.' },
      { criteriaId: 3, criteriaName: 'Xử lý dữ liệu biên & Ngoại lệ', score: 10.0, level: 'Đạt', evidence: 'Danh sách có 3 phần tử hợp lệ.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc mã nguồn & Phong cách', score: 10.0, level: 'Đạt', evidence: 'Tên biến fruits đúng chuẩn.' },
      { criteriaId: 5, criteriaName: 'Giải thích quá trình & Suy luận', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có chú thích giải thích mã nguồn.' }
    ],
    aiFeedback: {
      evidence: 'Dòng 1: fruits = ["xoai", "mit", "oi"]. Danh sách thiếu các loại quả "tao", "chuoi", "cam" theo dữ liệu mẫu minh họa của đề bài.',
      assessment: 'Bài làm đã tạo danh sách và in nhưng chưa sử dụng các loại quả đúng như ví dụ minh họa.',
      suggestion: 'Nên sử dụng đúng các loại quả táo, chuối, cam như mô tả mẫu của đề bài.',
      socraticQuestion: 'Em có thể đổi lại các phần tử thành đúng danh sách quả mẫu được không?'
    },
    errorCategory: 'logic_error',
    errorDescription: 'Minh chứng lịch sử: AI hiểu nhầm ví dụ minh họa là ràng buộc cứng, trừ điểm học sinh dùng quả nhiệt đới.',
    analysisType: 'static_analysis',
    teacherReview: {
      status: 'Đã chỉnh sửa',
      reviewedBy: 'Cô giáo Nguyễn Thanh Hương',
      reviewedAt: '2026-11-06 10:10:00',
      teacherVerificationLabel: 'Sai lệch đã xác minh',
      independentScore: 10.0,
      hasCriticalError: true,
      criticalErrorDetails: 'AI nhận định sai do ép buộc dữ liệu mẫu minh họa ("tao", "chuoi", "cam") trong khi đề bài cho phép 3 loại quả bất kỳ ("xoai", "mit", "oi" hoàn toàn hợp lệ).',
      teacherComment: 'Sai lệch đã xác minh: AI nhầm lẫn giữa ví dụ minh họa và ràng buộc đề bài. Học sinh chọn 3 quả bất kỳ là hoàn toàn sáng tạo và chính xác.',
      editReason: 'Sửa sai lệch AI do hiểu nhầm ví dụ minh họa là ràng buộc bắt buộc. Công nhận điểm tối đa cho học sinh.',
      editedFeedback: {
        evidence: 'Dòng 1: fruits = ["xoai", "mit", "oi"] gồm đúng 3 loại quả bất kỳ. Dòng 2: print(fruits) in danh sách chuẩn xác.',
        assessment: 'Bài làm rất tốt và sáng tạo với các loại quả nhiệt đới hợp lệ.',
        suggestion: 'Em có thể thử sắp xếp danh sách theo thứ tự bảng chữ cái bằng hàm sorted(fruits).',
        socraticQuestion: 'Em dự đoán danh sách fruits sau khi sắp xếp lại theo bảng chữ cái sẽ có thứ tự như thế nào?'
      },
      historicalAuditNote: 'Minh chứng lịch sử: AI trừ điểm vì học sinh dùng hoa quả khác ví dụ minh họa. Điểm AI cũ: 6.2/10. Giáo viên đã xác nhận sai lệch.',
      reEvaluation: {
        version: 'da6_v2_flexible_fruits',
        reEvaluatedAt: '2026-11-06 11:15:00',
        newScore: 10.0,
        rationale: 'Sau khi bổ sung bộ từ vựng hoa quả linh hoạt và chấp nhận 3 chuỗi bất kỳ, thuật toán v2 đánh giá đạt 10/10.',
        linkedOriginalSubmissionId: 'SUB-2130'
      },
      reviewDurationMinutes: 1.5,
      traditionalDurationMinutes: 5.0,
      evidenceAccuracyVerified: false,
      suggestionSuitabilityVerified: false
    },
    da4SyncRecommendation: {
      relatedUnits: ['K01'],
      proposedScoreDelta: { K01: 5 },
      rationale: 'Bài nộp T01 đã được giáo viên thẩm định đạt 10/10.',
      isApplied: false
    },
    isSimulatedData: false,
    isSyntheticResearchSample: false,
    datasetOrigin: 'acceptance_testing'
  },
  {
    id: 'SUB-01',
    submissionId: 'SUB-01',
    studentId: 'HS02',
    studentName: 'Trần Thị Bình',
    taskId: 'T01',
    knowledgeUnitId: 'K01',
    taskTitle: 'T01 - Khám phá danh sách trái cây',
    taskType: 'regular',
    code: 'fruits = ["tao", "chuoi", "cam"]\nprint(fruits)',
    studentCode: 'fruits = ["tao", "chuoi", "cam"]\nprint(fruits)',
    submittedAt: '2026-10-31 09:10:00',
    submissionTime: '2026-10-31 09:10:00',
    overallScore: 10.0,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu nhiệm vụ', score: 10, level: 'Đạt', evidence: 'Tạo đúng danh sách fruits gồm 3 loại quả.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn thuật toán & cú pháp', score: 10, level: 'Đạt', evidence: 'print(fruits) in chính xác.' },
      { criteriaId: 3, criteriaName: 'Xử lý dữ liệu biên & Ngoại lệ', score: 10, level: 'Đạt', evidence: 'Danh sách có đúng 3 phần tử.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc mã nguồn & Phong cách', score: 10, level: 'Đạt', evidence: 'Tên biến và cú pháp chuẩn.' },
      { criteriaId: 5, criteriaName: 'Giải thích quá trình & Suy luận', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có chú thích giải thích mã nguồn.' }
    ],
    aiFeedback: {
      evidence: 'Dòng 1: Tạo danh sách fruits = ["tao", "chuoi", "cam"]. Dòng 2: print(fruits).',
      assessment: 'Chương trình hoàn thành xuất sắc yêu cầu của bài toán cơ bản.',
      suggestion: 'Em hãy thử truy xuất phần tử đầu tiên bằng fruits[0].',
      socraticQuestion: 'Chỉ số (index) của phần tử đầu tiên trong Python bắt đầu từ mấy?'
    },
    errorCategory: 'meeting_requirements',
    errorDescription: 'Bài làm đạt yêu cầu T01.',
    analysisType: 'static_analysis',
    teacherReview: {
      status: 'Đã duyệt',
      reviewedBy: 'Cô giáo Nguyễn Thanh Hương',
      reviewedAt: '2026-10-31 09:15:00',
      teacherVerificationLabel: 'Đánh giá AI đúng',
      independentScore: 10.0,
      teacherComment: 'Giáo viên kiểm duyệt và chấp thuận phản hồi cho bài nộp SUB-01 của học sinh Trần Thị Bình.',
      reviewDurationMinutes: 1.5,
      traditionalDurationMinutes: 5.0,
      evidenceAccuracyVerified: true,
      suggestionSuitabilityVerified: true
    },
    isSimulatedData: false,
    isSyntheticResearchSample: false,
    datasetOrigin: 'acceptance_testing'
  },
  {
    id: 'SUB-03',
    submissionId: 'SUB-03',
    studentId: 'HS03',
    studentName: 'Lê Hoàng Cường',
    taskId: 'T02',
    knowledgeUnitId: 'K02',
    taskTitle: 'T02 - Tạo danh sách số chẵn',
    taskType: 'regular',
    code: 'numbers = [x * 2 for x in range(1, 6)]\nprint(numbers)',
    studentCode: 'numbers = [x * 2 for x in range(1, 6)]\nprint(numbers)',
    submittedAt: '2026-10-31 09:55:00',
    submissionTime: '2026-10-31 09:55:00',
    overallScore: 8.5,
    criteriaScores: [
      { criteriaId: 1, criteriaName: 'Đáp ứng yêu cầu nhiệm vụ', score: 10, level: 'Đạt', evidence: 'Tạo đúng danh sách số chẵn.' },
      { criteriaId: 2, criteriaName: 'Tính đúng đắn thuật toán & cú pháp', score: 10, level: 'Đạt', evidence: 'List comprehension chạy không lỗi.' },
      { criteriaId: 3, criteriaName: 'Xử lý dữ liệu biên & Ngoại lệ', score: 10, level: 'Đạt', evidence: 'Khoảng giá trị range(1, 6) hợp lệ.' },
      { criteriaId: 4, criteriaName: 'Cấu trúc mã nguồn & Phong cách', score: 9.0, level: 'Đạt', evidence: 'Cú pháp nâng cao, ngắn gọn.' },
      { criteriaId: 5, criteriaName: 'Giải thích quá trình & Suy luận', score: null, level: 'Chưa đủ dữ liệu đánh giá', evidence: 'Không có chú thích giải thích mã nguồn.' }
    ],
    aiFeedback: {
      evidence: 'Học sinh sử dụng list comprehension [x * 2 for x in range(1, 6)] để tạo danh sách.',
      assessment: 'Học sinh sử dụng cú pháp rút gọn linh hoạt và sáng tạo.',
      suggestion: 'Em có thể bổ sung chú thích để giải thích cơ chế của list comprehension.',
      socraticQuestion: 'Cách viết list comprehension khác gì so với dùng vòng lặp for và append thông thường?'
    },
    errorCategory: 'meeting_requirements',
    errorDescription: 'Bài làm sáng tạo với list comprehension.',
    analysisType: 'static_analysis',
    teacherReview: {
      status: 'Đã chỉnh sửa',
      reviewedBy: 'Cô giáo Nguyễn Thanh Hương',
      reviewedAt: '2026-10-31 10:02:00',
      teacherVerificationLabel: 'Đánh giá AI đúng',
      independentScore: 9.0,
      teacherComment: 'Giáo viên bổ sung gợi ý về list comprehension cho bài nộp SUB-03 của học sinh Lê Hoàng Cường.',
      editReason: 'Bổ sung giải thích chuyên sâu về cú pháp list comprehension cho học sinh có năng lực tốt.',
      editedFeedback: {
        evidence: 'Dòng 1: numbers = [x * 2 for x in range(1, 6)] tạo danh sách số chẵn từ 2 đến 10. Dòng 2: print(numbers).',
        assessment: 'Bài làm rất tốt, thể hiện kỹ năng lập trình nâng cao khi dùng list comprehension.',
        suggestion: 'Em hãy thử viết lại đoạn mã này bằng vòng lặp for thông thường kết hợp append() để so sánh hiệu năng và độ dễ đọc.',
        socraticQuestion: 'Trong trường hợp nào thì viết for thông thường sẽ dễ bảo trì hơn dùng list comprehension?'
      },
      reviewDurationMinutes: 1.5,
      traditionalDurationMinutes: 5.0,
      evidenceAccuracyVerified: true,
      suggestionSuitabilityVerified: true
    },
    isSimulatedData: false,
    isSyntheticResearchSample: false,
    datasetOrigin: 'acceptance_testing'
  }
];

// TẬP HỢP TẤT CẢ BÀI NỘP BAN ĐẦU:
// Gồm 15 bài Benchmark chuẩn hóa (K12) và 5 bài nộp phát sinh trong quá trình nghiệm thu (T01, T02)
export const SAMPLE_SUBMISSIONS: CodeSubmission[] = [
  ...DA6_15_BENCHMARK_SUBMISSIONS,
  ...ACCEPTANCE_TESTING_SUBMISSIONS
];


export const AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'LOG-101',
    timestamp: '2026-10-31 08:15:00',
    actor: 'Hệ thống AI',
    role: 'system',
    action: 'Cập nhật đề xuất lộ trình thích ứng',
    details: 'Hệ thống phân tích bài chẩn đoán của HS02 và đề xuất củng cố nhóm K06-K08 dựa trên quy tắc tổng hợp điểm trung bình nhóm <50%.'
  },
  {
    id: 'LOG-102',
    timestamp: '2026-10-31 09:15:00',
    actor: 'Cô giáo Nguyễn Thanh Hương',
    role: 'teacher',
    action: 'Phê duyệt phản hồi AI',
    details: 'Giáo viên kiểm duyệt và chấp thuận phản hồi cho bài nộp SUB-01 của học sinh Trần Thị Bình.'
  },
  {
    id: 'LOG-103',
    timestamp: '2026-10-31 10:02:00',
    actor: 'Cô giáo Nguyễn Thanh Hương',
    role: 'teacher',
    action: 'Chỉnh sửa phản hồi AI',
    details: 'Giáo viên bổ sung gợi ý về list comprehension cho bài nộp SUB-03 của học sinh Lê Hoàng Cường.'
  },
  {
    id: 'LOG-104',
    timestamp: '2026-10-31 10:30:00',
    actor: 'Hệ thống AI',
    role: 'system',
    action: 'Đồng bộ hóa dữ liệu nghiên cứu',
    details: 'Ghi nhận 12 lượt nộp bài, tỷ lệ đồng thuận AI-Giáo viên đạt 91.5%.'
  }
];

export const RESEARCH_METRICS_DATA: ResearchMetrics = {
  adaptive: {
    expertAlignmentRate: 94.2,
    taskCompletionRate: 88.5,
    teacherOverrideCount: 3,
    sensitivityThreshold: 50.0,
    profileDisparityIndex: 18.4
  },
  aiFeedback: {
    aiTeacherConsensusRate: 91.5,
    evidenceBasedRate: 98.0,
    actionableSuggestionRate: 95.4,
    criticalErrorCount: 0,
    averageReviewTimeMinutes: 2.1
  }
};
