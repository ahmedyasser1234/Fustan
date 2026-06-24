import Link from "next/link";
import { articles } from "@/lib/articles";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

function ArticleTable({ table }: { table: any }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: 12, boxShadow: "0 2px 20px rgba(0,0,0,0.07)", margin: "24px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", fontSize: 14 }}>
        <thead>
          <tr>
            {table.headers.map((h: string, i: number) => (
              <th key={i} style={{ background: "#1A1A2E", color: "#C9A96E", padding: "14px 18px", fontWeight: 700, textAlign: "right", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row: string[], i: number) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "14px 18px", borderBottom: "1px solid #F0EBE3", color: j === 0 ? "#1A1A2E" : "#444", fontWeight: j === 0 ? 700 : 400, textAlign: "right", lineHeight: 1.6 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find((a) => a.slug === params.slug);
  if (!article) return notFound();

  const related = articles.filter((a) => a.slug !== params.slug).slice(0, 2);

  return (
    <div style={{ fontFamily: "Cairo, sans-serif", direction: "rtl", background: "#FAF8F5", minHeight: "100vh" }}>
      {/* Back */}
      <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 32px", background: "#1A1A2E", color: "#C9A96E", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
        → العودة للمدونة
      </Link>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1A1A2E, #2D1B3E)", padding: "64px 24px", textAlign: "center" }}>
        <span style={{ display: "inline-block", padding: "5px 18px", borderRadius: 20, background: "rgba(201,169,110,0.2)", border: "1px solid rgba(201,169,110,0.4)", color: "#C9A96E", fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
          {article.category}
        </span>
        <h1 style={{ color: "#FAF8F5", fontSize: "clamp(22px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.4, maxWidth: 760, margin: "0 auto 20px" }}>
          {article.title}
        </h1>
        <p style={{ color: "rgba(250,248,245,0.5)", fontSize: 13 }}>⏱ {article.readTime} قراءة</p>
      </div>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "56px 24px 80px" }}>
        <p style={{ fontSize: 17, lineHeight: 2, color: "#333", fontWeight: 300, borderRight: "3px solid #C9A96E", paddingRight: 24, marginBottom: 52 }}>
          {article.content.intro}
        </p>

        {article.content.sections.map((section: any, i: number) => (
          <div key={i} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, color: "#1A1A2E", fontWeight: 700, marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid #E8E2D9" }}>
              {section.title}
            </h2>

            {section.text && <p style={{ fontSize: 15, lineHeight: 2, color: "#444", fontWeight: 300, marginBottom: 20 }}>{section.text}</p>}

            {section.table && <ArticleTable table={section.table} />}

            {section.steps && (
              <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
                {section.steps.map((step: any, j: number) => (
                  <li key={j} style={{ display: "flex", gap: 18, alignItems: "flex-start", padding: 20, background: "#fff", borderRadius: 12, boxShadow: "0 1px 12px rgba(0,0,0,0.05)" }}>
                    <div style={{ flexShrink: 0, width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #C9A96E, #B8935A)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{j + 1}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#1A1A2E", marginBottom: 6 }}>{step.title}</div>
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
                    <span style={{ color: "#C9A96E", flexShrink: 0, marginTop: 4 }}>✦</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </main>

      {/* Related */}
      {related.length > 0 && (
        <div style={{ background: "#1A1A2E", padding: "56px 24px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h3 style={{ color: "#FAF8F5", fontSize: 26, fontWeight: 700, textAlign: "center", marginBottom: 28 }}>مقالات قد تعجبكِ</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} style={{ textDecoration: "none", display: "block", padding: 22, background: "rgba(250,248,245,0.06)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 12 }}>
                  <div style={{ color: "#C9A96E", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>{r.category}</div>
                  <div style={{ color: "#FAF8F5", fontSize: 15, fontWeight: 700, lineHeight: 1.5 }}>{r.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}