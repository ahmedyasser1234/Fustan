"use client";

import { useState } from "react";
import { Link } from "wouter";
import { articles, Article } from "../../lib/articles";

const categories = ["الكل", ...Array.from(new Set(articles.map((a: Article) => a.category)))];

export default function BlogPage() {
  const [active, setActive] = useState("الكل");

  const filtered = active === "الكل"
    ? articles
    : articles.filter((a: Article) => a.category === active);

  return (
    <div style={{ fontFamily: "'Cairo', sans-serif", direction: "rtl", background: "#F8F7FC", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #3D2BA0, #5B3FD4)", padding: "80px 24px", textAlign: "center" }}>
        <p style={{ color: "#EEE9FF", letterSpacing: 4, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>✦ مدونة الموضة والأناقة ✦</p>
        <h1 style={{ color: "#ffffff", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, marginBottom: 16 }}>
          عالم <span style={{ color: "#EEE9FF" }}>الفساتين</span>
        </h1>
        <p style={{ color: "rgba(238,233,255,0.75)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
          دليلك الشامل لكل ما تحتاجينه لاختيار فستان أحلامك
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", padding: "40px 24px 24px" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            style={{
              padding: "8px 22px", borderRadius: 30,
              border: `1.5px solid ${active === cat ? "#5B3FD4" : "#D4CCF0"}`,
              background: active === cat ? "#5B3FD4" : "transparent",
              color: active === cat ? "#fff" : "#5B3FD4",
              cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "Cairo, sans-serif"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 28, maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        {filtered.map((article) => (
          <Link key={article.id} href={`/blog/${article.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 20px rgba(91,63,212,0.08)", transition: "transform 0.3s", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-6px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div style={{ height: 180, background: "linear-gradient(135deg, #3D2BA0, #5B3FD4)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <span style={{ fontSize: 52, opacity: 0.5 }}>
                  {article.category === "دليل الاختيار" && "👗"}
                  {article.category === "الأقمشة" && "🧵"}
                  {article.category === "عالم التصنيع" && "✂️"}
                  {article.category === "دليل التنسيق" && "✨"}
                </span>
                <span style={{ position: "absolute", top: 14, right: 14, background: "rgba(238,233,255,0.95)", color: "#3D2BA0", padding: "4px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                  {article.category}
                </span>
              </div>
              <div style={{ padding: 24 }}>
                <p style={{ fontSize: 12, color: "#9B8EC4", marginBottom: 10 }}>⏱ {article.readTime}</p>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#2C2C4A", lineHeight: 1.5, marginBottom: 12 }}>{article.title}</h2>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, fontWeight: 300, marginBottom: 16 }}>{article.excerpt}</p>
                <span style={{ color: "#5B3FD4", fontSize: 13, fontWeight: 700 }}>اقرأ المقال ←</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}