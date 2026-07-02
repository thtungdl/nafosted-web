"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function Home() {
  const { data: session, status } = useSession();
  const denied = useSearchParams().get("error") === "denied";

  const card = { maxWidth: 560, margin: "8vh auto", background: "#fff", border: "1px solid #e3e8f2", borderRadius: 16, padding: 28 };
  const btn = { background: "#223771", color: "#fff", border: 0, borderRadius: 10, padding: "12px 18px", fontSize: 16, cursor: "pointer", textDecoration: "none", display: "inline-block" };

  return (
    <div style={card}>
      <h1 style={{ color: "#223771", fontSize: "1.3rem" }}>Tiến độ đề tài NAFOSTED 108.05-2023.20</h1>
      <p style={{ color: "#5d667d" }}>Cổng nộp & theo dõi tiến độ nghiên cứu. Đăng nhập bằng email đã đăng ký.</p>
      {denied && <p style={{ color: "#d23b3b" }}>⚠ Email của bạn chưa được cấp quyền. Liên hệ chủ nhiệm đề tài.</p>}
      {status === "loading" ? <p>Đang tải…</p> : !session ? (
        <button style={btn} onClick={() => signIn("google")}>Đăng nhập với Google</button>
      ) : (
        <div>
          <p>Xin chào <b>{session.user.name}</b> ({session.user.email}){session.user.isAdmin ? " · admin" : ""}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "14px 0" }}>
            <Link href="/submit" style={btn}>📝 Nộp báo cáo tiến độ</Link>
            <a href="/dashboard" style={{ ...btn, background: "#F26522" }}>📊 Dashboard (tiến độ + tính công)</a>
          </div>
          <button style={{ ...btn, background: "#8a93a8" }} onClick={() => signOut()}>Đăng xuất</button>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return <Suspense><Home /></Suspense>;
}
