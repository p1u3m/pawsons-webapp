import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function generateReport() {
  console.log('Generating Pawsons Architecture & Tools PDF Report...');

  const htmlContent = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>Pawsons WebApp - System Architecture & Tools Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 16mm 14mm 18mm 14mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Prompt', sans-serif;
        font-size: 9pt;
        color: #8c857b;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #262420;
      background: #FFFFFF;
      font-size: 10pt;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      page-break-after: always;
      position: relative;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* HEADER */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #EBE6DD;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-logo span {
      font-size: 20pt;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #1A1917;
    }

    .brand-badge {
      display: inline-block;
      padding: 3px 10px;
      background: #EAF7E8;
      border: 1px solid rgba(69, 146, 115, 0.3);
      color: #2F5D3E;
      border-radius: 20px;
      font-size: 8pt;
      font-weight: 600;
    }

    .report-meta {
      text-align: right;
      font-size: 8.5pt;
      color: #7A746B;
      line-height: 1.4;
    }

    .report-meta strong {
      color: #262420;
    }

    /* TYPOGRAPHY */
    h1 {
      font-size: 20pt;
      font-weight: 700;
      color: #1A1917;
      margin-bottom: 6px;
      letter-spacing: -0.3px;
    }

    h2 {
      font-size: 13pt;
      font-weight: 600;
      color: #1A1917;
      margin-top: 20px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #F0ECE4;
      padding-bottom: 5px;
    }

    h2::before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 16px;
      background: #BD7A38;
      border-radius: 2px;
    }

    h3 {
      font-size: 10.5pt;
      font-weight: 600;
      color: #332F2A;
      margin: 12px 0 6px;
    }

    p {
      margin-bottom: 10px;
      color: #3D3934;
      font-size: 9.5pt;
    }

    /* SUMMARY BANNER */
    .hero-banner {
      background: linear-gradient(135deg, #FAF8F5 0%, #F5EFE6 100%);
      border: 1px solid #E5DFD3;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 20px;
    }

    .hero-banner p {
      font-size: 9.5pt;
      color: #4A443C;
      margin: 0;
      line-height: 1.6;
    }

    /* GRID & CARDS */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin-bottom: 16px;
    }

    .card {
      background: #FFFFFF;
      border: 1px solid #EAE5DC;
      border-radius: 10px;
      padding: 12px 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .card-title {
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .card-title.accent-green { color: #2E6A47; }
    .card-title.accent-purple { color: #674277; }
    .card-title.accent-gold { color: #BD7A38; }
    .card-title.accent-blue { color: #2B578E; }

    .card-tag {
      font-size: 7.5pt;
      padding: 2px 7px;
      border-radius: 10px;
      background: #F4F0E8;
      color: #615B52;
    }

    .card ul {
      list-style: none;
      padding-left: 0;
      font-size: 8.5pt;
    }

    .card li {
      padding: 3px 0;
      border-bottom: 1px dashed #F0ECE4;
      display: flex;
      justify-content: space-between;
    }

    .card li:last-child {
      border-bottom: none;
    }

    .card li strong {
      color: #1A1917;
    }

    /* ARCHITECTURE DIAGRAM */
    .diag-box {
      background: #FAF8F5;
      border: 1px solid #E5DFD3;
      border-radius: 10px;
      padding: 14px;
      margin: 14px 0;
      font-size: 8.5pt;
    }

    .diag-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 8px 0;
    }

    .diag-node {
      background: #FFFFFF;
      border: 1px solid #D8D2C5;
      border-radius: 8px;
      padding: 8px 12px;
      width: 28%;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.03);
    }

    .diag-node.client { border-top: 3px solid #3B7E58; }
    .diag-node.server { border-top: 3px solid #BD7A38; }
    .diag-node.db { border-top: 3px solid #74549E; }

    .diag-node strong {
      display: block;
      font-size: 9pt;
      margin-bottom: 2px;
      color: #1A1917;
    }

    .diag-node span {
      font-size: 7.5pt;
      color: #7A746B;
    }

    .diag-arrow {
      color: #8C857B;
      font-weight: 700;
      font-size: 11pt;
    }

    /* TABLES */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin: 10px 0 16px;
    }

    th, td {
      padding: 7px 10px;
      text-align: left;
      border-bottom: 1px solid #ECE7DE;
    }

    th {
      background: #F7F4EE;
      color: #4A443C;
      font-weight: 600;
      border-top: 1px solid #E2DCCF;
      border-bottom: 1px solid #D8D1C2;
    }

    tr:nth-child(even) td {
      background: #FCFBF8;
    }

    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8pt;
      background: #F0ECE4;
      padding: 1px 4px;
      border-radius: 4px;
      color: #A34824;
    }

    /* FOOTER */
    .doc-footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #EBE6DD;
      display: flex;
      justify-content: space-between;
      font-size: 7.5pt;
      color: #999185;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: EXECUTIVE SUMMARY & TECH STACK -->
  <div class="page">
    <div class="header-bar">
      <div>
        <div class="brand-logo">
          <span>pawsons</span>
          <div class="brand-badge">Architecture & Tech Stack Report</div>
        </div>
      </div>
      <div class="report-meta">
        <div><strong>โครงการ:</strong> Pawsons WebApp</div>
        <div><strong>สถานะ:</strong> Phase 1 & 2 Completed</div>
        <div><strong>วันที่จัดทำ:</strong> 23 กันยายน 2026</div>
      </div>
    </div>

    <h1>รายงานสรุปโครงสร้างทางเทคนิค และระบบเครื่องมือ</h1>
    <p style="color: #6E675D; font-size: 9pt; margin-bottom: 16px;">
      เอกสารฉบับนี้จัดทำขึ้นเพื่อบันทึกโครงสร้างสถาปัตยกรรมทางเทคนิค (Technical Architecture), การเชื่อมต่อฐานข้อมูล (Database Integration), แผนผังความสัมพันธ์ (Entity Relationship) และสรุปรายการเครื่องมือทั้งหมดที่ใช้ในการพัฒนาเว็บแอปพลิเคชัน Pawsons
    </p>

    <div class="hero-banner">
      <div style="font-weight: 700; color: #2B2823; margin-bottom: 4px; font-size: 10pt;">
        🌿 ปรัชญาและเป้าหมายของระบบ (Design & Architecture Philosophy)
      </div>
      <p>
        Pawsons ถูกสร้างขึ้นด้วยแนวคิด <em>"Calm, Simple & Sanctuary"</em> — พื้นที่พักใจที่เน้นความเรียบง่าย อบอุ่น โทนกระดาษธรรมชาติ ด้านเทคนิคเลือกใช้สถาปัตยกรรม <strong>Full-Stack Server-Side Rendering (SSR)</strong> บน Next.js 16 ร่วมกับ <strong>Supabase PostgreSQL</strong> เพื่อให้ผู้ใช้สามารถล็อกอินด้วย Google Account ครั้งเดียว และมีห้องส่วนตัว (Character Room) ที่บันทึกความทรงจำของตัวละคร MBTI ประจำตัวไว้ได้อย่างปลอดภัยตลอดไป
      </p>
    </div>

    <h2>1. รายการเครื่องมือและเทคโนโลยีทั้งหมด (Complete Tech Stack)</h2>

    <div class="grid-3">
      <!-- FRONTEND -->
      <div class="card">
        <div class="card-title accent-green">
          <span>1. Frontend UI</span>
          <span class="card-tag">Client/SSR</span>
        </div>
        <ul>
          <li><span>เฟรมเวิร์กหลัก</span> <strong>Next.js 16.3.5</strong></li>
          <li><span>ไลบรารีส่วนติดต่อ</span> <strong>React 19.3</strong></li>
          <li><span>การควบคุมโค้ด</span> <strong>TypeScript 7.0</strong></li>
          <li><span>ระบบอนิเมชัน</span> <strong>GSAP 3.15</strong></li>
          <li><span>ดีไซน์และธีม</span> <strong>Pure CSS Variables</strong></li>
          <li><span>Bundler Engine</span> <strong>Turbopack</strong></li>
        </ul>
      </div>

      <!-- BACKEND & DB -->
      <div class="card">
        <div class="card-title accent-purple">
          <span>2. Backend & DB</span>
          <span class="card-tag">Cloud</span>
        </div>
        <ul>
          <li><span>ฐานข้อมูลหลัก</span> <strong>PostgreSQL 15+</strong></li>
          <li><span>แพลตฟอร์มคลาวด์</span> <strong>Supabase Cloud</strong></li>
          <li><span>ระบบยืนยันตัวตน</span> <strong>Google OAuth 2.0</strong></li>
          <li><span>Session Token</span> <strong>Secure HttpOnly</strong></li>
          <li><span>SSR Integration</span> <strong>@supabase/ssr</strong></li>
          <li><span>ความปลอดภัย</span> <strong>Row Level Security</strong></li>
        </ul>
      </div>

      <!-- DEVOPS & TOOLS -->
      <div class="card">
        <div class="card-title accent-gold">
          <span>3. DevOps & Tools</span>
          <span class="card-tag">Deployment</span>
        </div>
        <ul>
          <li><span>Hosting & Edge</span> <strong>Vercel Serverless</strong></li>
          <li><span>Source Control</span> <strong>GitHub (Main)</strong></li>
          <li><span>Protocol Tooling</span> <strong>Supabase MCP</strong></li>
          <li><span>Automation</span> <strong>GitHub MCP</strong></li>
          <li><span>E2E & PDF Gen</span> <strong>Playwright 1.63</strong></li>
          <li><span>ความเร็ว Deploy</span> <strong>CI/CD Auto-Build</strong></li>
        </ul>
      </div>
    </div>

    <h2>2. แผนผังการเชื่อมโยงระบบ (System Architecture Flow)</h2>

    <div class="diag-box">
      <div class="diag-row">
        <div class="diag-node client">
          <strong>1. หน้าเว็บ (Client)</strong>
          <span>Browser (React 19)</span>
          <div style="font-size: 7.5pt; color: #3B7E58; margin-top: 4px;">GSAP Idle Mascot • UI</div>
        </div>
        <div class="diag-arrow">◄── HTTPS / Cookie ──►</div>
        <div class="diag-node server">
          <strong>2. เซิร์ฟเวอร์ (Next.js)</strong>
          <span>App Router & Server Actions</span>
          <div style="font-size: 7.5pt; color: #BD7A38; margin-top: 4px;">Middleware • Dynamic SSR</div>
        </div>
        <div class="diag-arrow">◄── PostgREST / TLS ──►</div>
        <div class="diag-node db">
          <strong>3. ฐานข้อมูล (Supabase)</strong>
          <span>PostgreSQL + Auth</span>
          <div style="font-size: 7.5pt; color: #74549E; margin-top: 4px;">auth.users • profiles</div>
        </div>
      </div>
    </div>

    <h3>สรุปขั้นตอนการทำงานเมื่อผู้ใช้เลือกตัวละคร:</h3>
    <ol style="padding-left: 20px; font-size: 9pt; color: #4A443C; line-height: 1.7;">
      <li><strong>ผู้ใช้คลิกเลือกตัวละคร (เช่น Mavis):</strong> หน้าเว็บจะเรียก Server Action <code>saveQuizResult('INTP', 'lavender', 'พอดี')</code></li>
      <li><strong>บันทึกลง Supabase:</strong> Next.js Server นำสิทธิ์ของ User ทำคำสั่ง <code>UPSERT</code> ลงตาราง <code>public.profiles</code> แบบเรียลไทม์</li>
      <li><strong>ล้างแคชทันที:</strong> เซิร์ฟเวอร์เรียก <code>revalidatePath('/room')</code> เพื่อให้หน้าห้องของตัวละครรีเฟรชข้อมูลตัวใหม่ทันที</li>
      <li><strong>เปิดหน้า /room:</strong> เซิร์ฟเวอร์ดึงข้อมูลจากตาราง <code>profiles</code> และส่งรูปตัวละครพร้อมธีมสีบ้าน Lavender ให้น้อง Mavis ขยับลอยตัวต้อนรับ</li>
    </ol>

    <div class="doc-footer">
      <span>Pawsons WebApp Architecture Documentation</span>
      <span>หน้า 1 จาก 2</span>
    </div>
  </div>

  <!-- PAGE 2: DATABASE SCHEMA & SECURITY -->
  <div class="page">
    <div class="header-bar">
      <div>
        <div class="brand-logo">
          <span>pawsons</span>
          <div class="brand-badge">Database & Security Specification</div>
        </div>
      </div>
      <div class="report-meta">
        <div><strong>ฐานข้อมูล:</strong> PostgreSQL (Supabase)</div>
        <div><strong>มาตรฐาน:</strong> Supabase Best Practices</div>
        <div><strong>ความปลอดภัย:</strong> RLS Enabled</div>
      </div>
    </div>

    <h2>3. รายละเอียดโครงสร้างฐานข้อมูล (Database Schema)</h2>
    <p>
      ระบบออกแบบโดยแยกชั้นการยืนยันตัวตน (Authentication) ออกจากชั้นข้อมูลผู้ใช้ (Application Profile) เพื่อความปลอดภัยสูงสุด:
    </p>

    <table>
      <thead>
        <tr>
          <th style="width: 22%;">ชื่อคอลัมน์</th>
          <th style="width: 18%;">ชนิดข้อมูล</th>
          <th style="width: 15%;">คุณสมบัติ</th>
          <th>คำอธิบายหน้าที่</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>id</code></td>
          <td><code>uuid</code></td>
          <td>PK, FK (auth.users)</td>
          <td>รหัสประจำตัวผู้ใช้ เชื่อมโยงกับ Google Account ผ่านตาราง <code>auth.users</code></td>
        </tr>
        <tr>
          <td><code>display_name</code></td>
          <td><code>text</code></td>
          <td>Nullable</td>
          <td>ชื่อที่ใช้แสดงผลของผู้ใช้ (ดึงอัตโนมัติจาก Google เช่น "P1u3m")</td>
        </tr>
        <tr>
          <td><code>avatar_url</code></td>
          <td><code>text</code></td>
          <td>Nullable</td>
          <td>URL รูปโปรไฟล์ของ Google สำหรับนำมาแสดงใน Dropdown Navigation</td>
        </tr>
        <tr>
          <td><code>assigned_character</code></td>
          <td><code>text</code></td>
          <td>Nullable</td>
          <td>รหัสตัวละครประจำตัว เช่น <code>INFP</code> (Kumo), <code>INTP</code> (Mavis), <code>ENFP</code> (Penny)</td>
        </tr>
        <tr>
          <td><code>house</code></td>
          <td><code>text</code></td>
          <td>Nullable</td>
          <td>บ้านของตัวละคร (<code>lavender</code>, <code>clover</code>, <code>forget-me-not</code>, <code>dandelion</code>)</td>
        </tr>
        <tr>
          <td><code>vibe</code></td>
          <td><code>text</code></td>
          <td>Nullable</td>
          <td>คำฮีลใจที่เลือกจากการทำ Quiz (เช่น 'อิสระ', 'พอดี', 'อบอุ่น')</td>
        </tr>
        <tr>
          <td><code>created_at</code></td>
          <td><code>timestamptz</code></td>
          <td>Default now()</td>
          <td>วันและเวลาที่โปรไฟล์ถูกสร้างขึ้น</td>
        </tr>
        <tr>
          <td><code>updated_at</code></td>
          <td><code>timestamptz</code></td>
          <td>Default now()</td>
          <td>วันและเวลาที่มีการเปลี่ยนตัวละครหรือแก้ไขโปรไฟล์ล่าสุด</td>
        </tr>
      </tbody>
    </table>

    <h2>4. มาตรการความปลอดภัย (Security & RLS Policies)</h2>
    <div class="grid-2">
      <div class="card">
        <div class="card-title accent-blue">
          <span>Row Level Security (RLS)</span>
        </div>
        <p style="font-size: 8.5pt; color: #555047; margin: 4px 0 8px;">
          เปิดใช้งาน RLS ทุกตาราง เพื่อป้องกันไม่ให้ผู้ใช้แอบแก้ไขข้อมูลของผู้อื่น:
        </p>
        <ul>
          <li><strong>SELECT Policy:</strong> เปิดให้ทุกคนอ่านโปรไฟล์เพื่อนได้</li>
          <li><strong>INSERT Policy:</strong> ตรวจสอบ <code>(select auth.uid()) = id</code></li>
          <li><strong>UPDATE Policy:</strong> ตรวจสอบ <code>USING</code> และ <code>WITH CHECK</code> ตรงกับ UID ตัวเองเท่านั้น</li>
        </ul>
      </div>

      <div class="card">
        <div class="card-title accent-green">
          <span>Automated Triggers</span>
        </div>
        <p style="font-size: 8.5pt; color: #555047; margin: 4px 0 8px;">
          ทำงานอัตโนมัติในระดับ Database Engine (PostgreSQL):
        </p>
        <ul>
          <li><strong>handle_new_user():</strong> รันอัตโนมัติทันทีที่ผู้ใช้ล็อกอิน Google ครั้งแรก เพื่อสร้างแถวโปรไฟล์ในตาราง</li>
          <li><strong>Foreign Key Cascade:</strong> เมื่อผู้ใช้ลบบัญชี ระบบจะลบข้อมูลโปรไฟล์และห้องออกอัตโนมัติ ป้องกันข้อมูลตกค้าง</li>
        </ul>
      </div>
    </div>

    <h2>5. สถานะฟีเจอร์และการพัฒนาต่อยอด (Roadmap Status)</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 15%;">ระยะ (Phase)</th>
          <th style="width: 35%;">ฟีเจอร์หลัก</th>
          <th style="width: 25%;">เครื่องมือที่ใช้</th>
          <th>สถานะ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Phase 1</strong></td>
          <td>Google Authentication & Cookie Middleware</td>
          <td>Supabase Auth, Next.js Middleware</td>
          <td><span style="color: #2F5D3E; font-weight: 600;">✅ เสร็จสมบูรณ์</span></td>
        </tr>
        <tr>
          <td><strong>Phase 2</strong></td>
          <td>User Profiles & Character Room (/room)</td>
          <td>Supabase DB, GSAP Animation</td>
          <td><span style="color: #2F5D3E; font-weight: 600;">✅ เสร็จสมบูรณ์</span></td>
        </tr>
        <tr>
          <td><strong>Phase 3</strong></td>
          <td>Personal Letters System (จดหมายจากเพื่อน)</td>
          <td>PostgreSQL Letters Table, Scheduled Wait</td>
          <td><span style="color: #BD7A38; font-weight: 600;">⏳ แผนพัฒนาถัดไป</span></td>
        </tr>
        <tr>
          <td><strong>Phase 4</strong></td>
          <td>E-Commerce Shop & Stripe Checkout</td>
          <td>Stripe API, Orders Table, Webhooks</td>
          <td><span style="color: #7A746B; font-weight: 600;">📋 แผนระยะยาว</span></td>
        </tr>
      </tbody>
    </table>

    <div class="doc-footer">
      <span>Pawsons WebApp Architecture Documentation</span>
      <span>หน้า 2 จาก 2</span>
    </div>
  </div>

</body>
</html>
  `;

  const outputPath = path.resolve('docs', 'pawsons-architecture-report.pdf');
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      bottom: '14mm',
      left: '12mm',
      right: '12mm',
    },
  });

  await browser.close();
  console.log(`PDF Report generated successfully at: ${outputPath}`);
}

generateReport().catch(console.error);
