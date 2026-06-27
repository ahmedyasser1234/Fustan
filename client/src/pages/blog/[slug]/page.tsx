import { Link } from "wouter";
import { articles, Article } from "../../../lib/articles";
import NotFound from "@/pages/NotFound";

function ArticleTable({ table }: { table: any }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: 12, boxShadow: "0 2px 20px rgba(91,63,212,0.1)", margin: "24px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", fontSize: 14 }}>
        <thead>
          <tr>
            {table.headers.map((h: string, i: number) => (
              <th key={i} style={{ background: "#5B3FD4", color: "#EEE9FF", padding: "14px 18px", fontWeight: 700, textAlign: "right", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row: string[], i: number) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#F8F7FC" }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "14px 18px", borderBottom: "1px solid #EEE9FF", color: j === 0 ? "#3D2BA0" : "#444", fontWeight: j === 0 ? 700 : 400, textAlign: "right", lineHeight: 1.6 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const article = articles.find((a: Article) => a.slug === slug);
  if (!article) return <NotFound />;

  const related = articles.filter((a: Article) => a.slug !== slug).slice(0, 2);

  return (
    <div style={{ fontFamily: "Cairo, sans-serif", direction: "rtl", background: "#F8F7FC", minHeight: "100vh" }}>
      <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 32px", background: "#5B3FD4", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
        → العودة للمدونة
      </Link>

      <div style={{ background: "linear-gradient(135deg, #3D2BA0, #5B3FD4)", padding: "64px 24px", textAlign: "center" }}>
        <span style={{ display: "inline-block", padding: "5px 18px", borderRadius: 20, background: "rgba(238,233,255,0.2)", border: "1px solid rgba(238,233,255,0.4)", color: "#EEE9FF", fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
          {article.category}
        </span>
        <h1 style={{ color: "#ffffff", fontSize: "clamp(22px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.4, maxWidth: 760, margin: "0 auto 20px" }}>
          {article.title}
        </h1>
        <p style={{ color: "rgba(238,233,255,0.6)", fontSize: 13 }}>⏱ {article.readTime} قراءة</p>
      </div>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "56px 24px 80px" }}>
        <p style={{ fontSize: 17, lineHeight: 2, color: "#2C2C4A", fontWeight: 300, borderRight: "3px solid #5B3FD4", paddingRight: 24, marginBottom: 52 }}>
          {article.content.intro}
        </p>

        {article.content.sections.map((section: any, i: number) => (
          <div key={i} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, color: "#2C2C4A", fontWeight: 700, marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid #EEE9FF" }}>
              {section.title}
            </h2>
            {section.text && <p style={{ fontSize: 15, lineHeight: 2, color: "#444", fontWeight: 300, marginBottom: 20 }}>{section.text}</p>}
            {section.table && <ArticleTable table={section.table} />}
            {section.steps && (
              <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
                {section.steps.map((step: any, j: number) => (
                  <li key={j} style={{ display: "flex", gap: 18, alignItems: "flex-start", padding: 20, background: "#fff", borderRadius: 12, boxShadow: "0 1px 12px rgba(91,63,212,0.08)" }}>
                    <div style={{ flexShrink: 0, width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #5B3FD4, #3D2BA0)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{j + 1}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#2C2C4A", marginBottom: 6 }}>{step.title}</div>
                      <div style={{ fontSize: 14, color: "#555", lineHeight: 1.8, fontWeight: 300 }}>{step.text}</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {section.list && (
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {section.list.map((item: string, j: number) => (
                  <li key={j} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 15, lineHeight: 1.8, color: "#444", fontWeight: 300 }}>
                    <span style={{ color: "#5B3FD4", flexShrink: 0, marginTop: 4 }}>✦</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </main>

      {related.length > 0 && (
        <div style={{ background: "#3D2BA0", padding: "56px 24px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h3 style={{ color: "#fff", fontSize: 26, fontWeight: 700, textAlign: "center", marginBottom: 28 }}>مقالات قد تعجبكِ</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
              {related.map((r: Article) => (
                <Link key={r.id} href={`/blog/${r.slug}`} style={{ textDecoration: "none", display: "block", padding: 22, background: "rgba(238,233,255,0.08)", border: "1px solid rgba(238,233,255,0.2)", borderRadius: 12 }}>
                  <div style={{ color: "#EEE9FF", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>{r.category}</div>
                  <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, lineHeight: 1.5 }}>{r.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}