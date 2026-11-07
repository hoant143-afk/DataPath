import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import { analyzePythonCodeStatic, calculateWeightedRubricScore } from "./src/utils/da6Engine";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Initialize Google GenAI client if API key exists
  const aiApiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (aiApiKey) {
    ai = new GoogleGenAI({
      apiKey: aiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API endpoint for AI Code Evaluation (Phân hệ B - AI Feedback)
  app.post("/api/ai/evaluate-code", async (req, res) => {
    try {
      const { code, taskTitle, taskDescription, expectedOutput, testCases } = req.body;

      if (!code) {
        return res.status(400).json({ error: "No code provided" });
      }

      // Check if code contains meaningful process comments
      const commentLines = code.split('\n').filter((l: string) => l.trim().startsWith('#') && !l.trim().startsWith('# Nhập') && !l.trim().startsWith('# TODO'));
      const hasProcessComments = commentLines.length >= 2;

      // If Gemini API is available, use it
      if (ai) {
        try {
          const prompt = `Bạn là trợ lý AI chuyên gia giáo dục lập trình Python cho học sinh THCS. Hãy đánh giá đoạn mã Python sau dựa trên Rubric 5 tiêu chí chuẩn mực sư phạm.
Nhiệm vụ: "${taskTitle}"
Mô tả: "${taskDescription}"
Đầu ra mong đợi: "${expectedOutput || 'Không có'}"

Mã nguồn học sinh nộp:
\`\`\`python
${code}
\`\`\`

Hãy phân tích theo 5 tiêu chí:
1. Đáp ứng yêu cầu bài toán
2. Tính đúng đắn của thuật toán
3. Khả năng xử lý trường hợp kiểm thử và trường hợp biên (đặc biệt danh sách rỗng, số âm)
4. Cấu trúc, tính dễ đọc và chuẩn phong cách của mã nguồn
5. Khả năng giải thích & minh chứng quá trình:
QUAN TRỌNG: Nếu học sinh chỉ nộp mã nguồn thuần túy không có chú thích phân tích quá trình, BẮT BUỘC đặt score: null, level: "Chưa đủ dữ liệu đánh giá", và evidence: "Học sinh chỉ nộp mã nguồn thuần túy, chưa có chú thích phân tích quá trình tư duy hoặc nhật ký học tập (AI không suy diễn nỗ lực)."

Trả về cấu trúc JSON gồm:
- criteriaScores: mảng 5 phần tử { criteriaId (1-5), criteriaName, score (số 0-10 hoặc null), level ("Đạt" | "Cần cố gắng" | "Chưa đạt" | "Chưa đủ dữ liệu đánh giá"), evidence }
- aiFeedback: { evidence: string, assessment: string, suggestion: string, socraticQuestion: string }
- overallScore: điểm trung bình thang 10 của các tiêu chí có điểm (không tính tiêu chí null)
- isSimulated: false
`;

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              systemInstruction: "Bạn là chuyên gia đánh giá code Python theo rubric sư phạm THCS. Tuyệt đối không suy diễn nỗ lực ở Tiêu chí 5 nếu không có chú thích hoặc nhật ký của học sinh.",
              responseMimeType: "application/json"
            }
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            if (parsed.criteriaScores) {
              parsed.overallScore = calculateWeightedRubricScore(parsed.criteriaScores);
            }
            return res.json(parsed);
          }
        } catch (geminiErr: any) {
          console.warn("Gemini evaluation error, falling back to static analyzer:", geminiErr);
        }
      }

      // Robust static analysis fallback complying strictly with DA6 Rubric
      const taskSpec = req.body.task || (req.body.taskId ? {
        id: req.body.taskId,
        unitId: req.body.knowledgeUnitId,
        title: req.body.taskTitle,
        requirement: req.body.taskDescription,
        expectedOutput: req.body.expectedOutput
      } : undefined);
      const staticResult = analyzePythonCodeStatic(code, taskSpec);
      return res.json({
        overallScore: staticResult.overallScore,
        criteriaScores: staticResult.criteriaScores,
        aiFeedback: staticResult.aiFeedback,
        errorCategory: staticResult.errorCategory,
        detectedIssues: staticResult.detectedIssues,
        analysisType: staticResult.analysisType,
        isSimulated: true
      });
    } catch (err: any) {
      console.error("Evaluation error:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // API endpoint for Diagnostic analysis & adaptive path recommendation
  app.post("/api/ai/analyze-diagnostic", async (req, res) => {
    try {
      const { scores, studentId, answers } = req.body;
      let scoreMap = scores || {};
      const lowUnits = Object.entries(scoreMap).filter(([k, v]: [string, any]) => v < 50).map(([k, v]) => `${k} (${v}%)`);
      const highUnits = Object.entries(scoreMap).filter(([k, v]: [string, any]) => v >= 80).map(([k, v]) => `${k} (${v}%)`);
      
      const recommendedPath = lowUnits.length > 0 ? `Củng cố các đơn vị kiến thức: ${lowUnits.join(', ')}` : 'Thực hiện nhiệm vụ Vận dụng cao (T09-T12)';
      const rationale = `Phân tích chẩn đoán thực tế cho ${studentId || 'Học sinh'}: Các đơn vị đạt chuẩn (≥80%): [${highUnits.join(', ') || 'Chưa có'}]. Các đơn vị dưới ngưỡng 50%: [${lowUnits.join(', ') || 'Không có'}]. Hệ thống định hướng lộ trình thích ứng ZPD tương ứng.`;

      return res.json({
        success: true,
        analysisTimestamp: new Date().toISOString(),
        studentId: studentId || "HS-DEMO",
        recommendedPath,
        rationale
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Teacher Authentication & RBAC System (Vercel & Express compatible) ---
  const SESSION_COOKIE_NAME = "datapath_teacher_session";
  const isProduction = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
  const SESSION_SECRET = process.env.SESSION_SECRET || (isProduction ? "" : "datapath_session_hmac_secret_2026_vercel_protected");

  if (isProduction) {
    if (!process.env.SESSION_SECRET) {
      console.error("CRITICAL SECURITY ERROR: SESSION_SECRET is missing in production!");
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("CRITICAL SECURITY ERROR: GOOGLE_CLIENT_ID is missing in production!");
    }
  }

  const cookieOptions: express.CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/"
  };

  function createSessionToken(user: any): string {
    const payload = {
      ...user,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000
    };
    const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const sig = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
    return `${data}.${sig}`;
  }

  function verifySessionToken(token?: string): any | null {
    if (!token || typeof token !== "string" || !token.includes(".")) return null;
    const [data, sig] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
    try {
      const sigBuf = Buffer.from(sig, "base64url");
      const expectedBuf = Buffer.from(expectedSig, "base64url");
      if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        return null;
      }
      const parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
      if (parsed.exp && parsed.exp < Date.now()) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  // Teacher Whitelist (stored securely on server, never exposed in client bundle)
  const AUTHORIZED_TEACHERS: Record<string, {
    name: string;
    role: 'teacher' | 'admin';
    avatar: string;
    department: string;
  }> = {
    'nhulun7903@gmail.com': {
      name: 'Nguyễn Như Luận',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      department: 'Ban Quản trị & Chuyên môn DataPath AI'
    },
    'huong.nguyen@datapath.edu.vn': {
      name: 'Cô giáo Nguyễn Thanh Hương',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      department: 'Tổ Tin học - Giáo viên phụ trách DA4 & DA6'
    },
    'teacher@datapath.edu.vn': {
      name: 'Cô giáo Nguyễn Thanh Hương (Demo)',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      department: 'Tổ Tin học - Giáo viên phản hồi sư phạm'
    }
  };

  function getAuthorizedTeacher(email: string) {
    const normalized = email.trim().toLowerCase();
    if (AUTHORIZED_TEACHERS[normalized]) {
      return AUTHORIZED_TEACHERS[normalized];
    }

    const envEmails = (process.env.AUTHORIZED_TEACHER_EMAILS || "")
      .split(",")
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);

    if (envEmails.includes(normalized)) {
      return {
        name: normalized.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        role: "teacher" as const,
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        department: "Tổ Tin học - Giáo viên chuyên môn"
      };
    }
    return null;
  }

  // 1. Check current authenticated session from HttpOnly cookie
  app.get("/api/auth/session", (req, res) => {
    const cookieToken = req.cookies?.[SESSION_COOKIE_NAME];
    const headerToken = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const session = verifySessionToken(cookieToken || headerToken);

    if (session) {
      return res.json({
        authenticated: true,
        user: {
          uid: session.uid,
          email: session.email,
          displayName: session.displayName,
          photoURL: session.photoURL,
          role: session.role,
          isAuthorizedTeacher: true,
          authProvider: session.authProvider || 'google',
          verifiedAt: session.verifiedAt || new Date().toLocaleString('vi-VN')
        }
      });
    }

    return res.json({ authenticated: false, user: null });
  });

  // 2. Google OAuth verification endpoint (Strict Google ID Token Verification)
  app.post("/api/auth/google", async (req, res) => {
    try {
      if (isProduction && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === "datapath_session_hmac_secret_2026_vercel_protected" || !process.env.GOOGLE_CLIENT_ID)) {
        return res.status(500).json({ authorized: false, error: "Hệ thống chưa được cấu hình GOOGLE_CLIENT_ID hoặc SESSION_SECRET bảo mật cho môi trường production." });
      }

      const { credential } = req.body;
      if (!credential || typeof credential !== "string") {
        return res.status(400).json({ authorized: false, error: "Thiếu Google ID Token (credential) hợp lệ." });
      }

      let email: string | null = null;
      let name: string | null = null;
      let picture: string | null = null;

      try {
        const googleResp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (!googleResp.ok) {
          return res.status(401).json({ authorized: false, error: "Google ID Token không hợp lệ hoặc đã hết hạn." });
        }

        const googleData: any = await googleResp.json();
        
        // Validate email_verified
        if (googleData.email_verified !== "true" && googleData.email_verified !== true) {
          return res.status(401).json({ authorized: false, error: "Tài khoản Google chưa được xác thực email." });
        }

        // Validate audience (aud) if GOOGLE_CLIENT_ID is configured on server
        const expectedClientId = process.env.GOOGLE_CLIENT_ID;
        if (expectedClientId && googleData.aud !== expectedClientId) {
          return res.status(401).json({ authorized: false, error: "Google Client ID (aud) không khớp với cấu hình hệ thống." });
        }

        email = googleData.email;
        name = googleData.name;
        picture = googleData.picture;
      } catch (tokenErr) {
        console.error("Error verifying Google ID token with Google API:", tokenErr);
        return res.status(401).json({ authorized: false, error: "Không thể xác thực Google ID token với máy chủ Google." });
      }

      if (!email) {
        return res.status(400).json({ authorized: false, error: "Không thể xác định địa chỉ email từ Google Token." });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const teacher = getAuthorizedTeacher(normalizedEmail);

      if (!teacher) {
        return res.status(403).json({
          authorized: false,
          error: `Tài khoản Google "${normalizedEmail}" chưa được cấp quyền giáo viên trên hệ thống DataPath AI.`
        });
      }

      const user = {
        uid: `teacher_${normalizedEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
        email: normalizedEmail,
        displayName: name || teacher.name,
        photoURL: picture || teacher.avatar,
        role: teacher.role,
        isAuthorizedTeacher: true,
        authProvider: 'google' as const,
        verifiedAt: new Date().toLocaleString('vi-VN')
      };

      const token = createSessionToken(user);
      res.cookie(SESSION_COOKIE_NAME, token, cookieOptions);

      return res.json({
        authorized: true,
        user,
        message: "Xác thực danh tính Google thành công."
      });
    } catch (err: any) {
      console.error("Google Auth error:", err);
      return res.status(500).json({ authorized: false, error: "Lỗi xử lý xác thực tài khoản Google." });
    }
  });

  // 3. Logout endpoint (invalidates session cookie)
  app.post("/api/auth/logout", (_req, res) => {
    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/"
    });
    return res.json({ success: true, message: "Đã đăng xuất tài khoản giáo viên." });
  });

  // 4. Auth configuration endpoint for frontend Google Identity Services
  app.get("/api/auth/config", (_req, res) => {
    return res.json({
      googleClientId: process.env.GOOGLE_CLIENT_ID || "",
      isGoogleConfigured: !!process.env.GOOGLE_CLIENT_ID,
      environment: process.env.VERCEL ? "vercel" : "preview"
    });
  });

  // Vite integration for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  const PORT = process.env.PORT || 3000;
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  return app;
}

export const appPromise = startServer();
