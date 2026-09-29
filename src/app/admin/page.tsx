import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/contents";
import { characters } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard · Pawsons" };

export default async function AdminDashboard() {
  if (!(await isAdmin())) redirect("/");
  const supabase = await createClient();
  if (!supabase) throw new Error("Dashboard unavailable");

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  // Exact aggregate counts avoid downloading member details or truncating at the API row limit.
  const [members, recent, ...typeResults] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since),
    ...characters.map((character) =>
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("assigned_character", character.type.toUpperCase()),
    ),
  ]);
  if (
    [members, recent, ...typeResults].some(
      (result) => result.error || result.count === null,
    )
  ) {
    throw new Error("Unable to load dashboard statistics");
  }
  const distribution = characters
    .map((character, index) => ({
      ...character,
      count: typeResults[index].count!,
    }))
    .sort((a, b) => b.count - a.count);
  const saved = distribution.reduce(
    (total, character) => total + character.count,
    0,
  );
  const number = new Intl.NumberFormat("th-TH");

  return (
    <div className="admin-contents-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-sub">
            ภาพรวมสมาชิกและบุคลิกภาพของชาว Pawsons
          </p>
        </div>
        <Link href="/admin" className="admin-site-link" prefetch={false}>
          อัปเดตข้อมูล ↻
        </Link>
      </header>
      <section className="dashboard-metrics" aria-label="ภาพรวม">
        <article>
          <span>สมาชิกทั้งหมด</span>
          <strong>{number.format(members.count!)}</strong>
          <p>บัญชีที่มีโปรไฟล์ในระบบ</p>
        </article>
        <article>
          <span>สมาชิกใหม่</span>
          <strong>{number.format(recent.count!)}</strong>
          <p>ย้อนหลัง 30 วัน</p>
        </article>
        <article>
          <span>สมาชิกที่บันทึก TYPE</span>
          <strong>{number.format(saved)}</strong>
          <p>นับผลล่าสุด 1 TYPE ต่อสมาชิก</p>
        </article>
        <article>
          <span>การเข้าชมเว็บไซต์</span>
          <strong aria-label="ยังไม่มีข้อมูล">—</strong>
          <p>ยังไม่ได้เชื่อมต่อระบบเก็บยอดเข้าชม</p>
        </article>
      </section>
      <section className="dashboard-panel" aria-labelledby="type-heading">
        <div className="dashboard-panel-heading">
          <div>
            <h2 id="type-heading">สัดส่วนบุคลิกภาพทั้ง 16 TYPE</h2>
            <p>
              เปอร์เซ็นต์จากสมาชิกที่บันทึก TYPE ที่ถูกต้อง ·
              ไม่รวมผู้ทำแบบทดสอบที่ไม่ได้บันทึกผล
            </p>
          </div>
          <span>{number.format(saved)} สมาชิก</span>
        </div>
        {saved === 0 && (
          <p className="dashboard-empty">
            ยังไม่มีสมาชิกบันทึกผลแบบทดสอบ สถิติจะแสดงเมื่อมีการบันทึกผล
          </p>
        )}
        <div className="dashboard-types">
          {distribution.map((character) => {
            const percent = saved ? (character.count / saved) * 100 : 0;
            return (
              <div className="dashboard-type" key={character.type}>
                <div>
                  <strong>{character.type}</strong>
                  <span>{character.name}</span>
                  <small>
                    {number.format(character.count)} คน · {percent.toFixed(1)}%
                  </small>
                </div>
                <meter
                  min={0}
                  max={100}
                  value={percent}
                  aria-label={`${character.type} ${character.count} คน (${percent.toFixed(1)}%)`}
                />
              </div>
            );
          })}
        </div>
      </section>
      <p className="admin-page-sub">
        ข้อมูล ณ{" "}
        {new Intl.DateTimeFormat("th-TH", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Bangkok",
        }).format(new Date())}{" "}
        (เวลาไทย) · สมาชิกที่ยังไม่มี TYPE ที่ถูกต้อง{" "}
        {number.format(members.count! - saved)} คน
      </p>
    </div>
  );
}
