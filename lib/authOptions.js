import GoogleProvider from "next-auth/providers/google";
import { getAdminMembers } from "./drive";

const allowed = (process.env.ALLOWED_EMAILS || "")
  .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
const admins = (process.env.ADMIN_EMAILS || "")
  .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // CHỈ cho phép email trong danh sách đăng nhập: env (cố định, không khóa nhầm) HOẶC store admin.
    async signIn({ user }) {
      const email = (user?.email || "").toLowerCase();
      if (!email) return false;
      if (allowed.includes(email) || admins.includes(email)) return true;
      const members = await getAdminMembers();   // đã bọc try/catch, lỗi → []
      return members.some((m) => (m.email || "").toLowerCase() === email);
    },
    async jwt({ token }) {
      token.isAdmin = admins.includes((token.email || "").toLowerCase());
      return token;
    },
    async session({ session, token }) {
      session.user.isAdmin = !!token.isAdmin;
      return session;
    },
  },
  pages: { error: "/?error=denied" },
};

export function isAllowed(email) {
  return allowed.includes((email || "").toLowerCase());
}
export function isAdmin(email) {
  return admins.includes((email || "").toLowerCase());
}
