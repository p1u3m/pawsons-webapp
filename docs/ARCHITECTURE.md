# Pawsons WebApp — System Architecture & Database Documentation

> **เอกสารสรุปสถาปัตยกรรมระบบ โครงสร้างฐานข้อมูล และเครื่องมือทั้งหมดของ Pawsons**  
> *บันทึกเมื่อ: 23 กันยายน 2026* · *เวอร์ชัน: Phase 2 (User Profiles & Character Room Complete)*

---

## 1. ภาพรวมสถาปัตยกรรม (System Architecture Overview)

Pawsons WebApp พัฒนาขึ้นด้วยสถาปัตยกรรม **Modern Full-Stack SSR (Server-Side Rendering)** โดยแยกหน้าที่การทำงานออกเป็น 3 เลเยอร์หลัก:

```
[ Frontend: Client Components & UI ]
       │ ▲  (HTTPS / Cookie / State)
       ▼ │
[ Backend: Next.js Server & Route Handlers ]
       │ ▲  (Supabase SSR Client / REST Data API)
       ▼ │
[ Database & Cloud: Supabase (PostgreSQL + Auth + Storage) ]
```

### การไหลของข้อมูล (Data Flow: Auth & Character Selection)
1. **Authentication Flow (Google OAuth)**:
   - ผู้ใช้คลิก `Sign in` บนแถบ Navigation
   - เบราว์เซอร์ส่งคำขอไปยัง Supabase Auth ผ่าน `signInWithOAuth({ provider: 'google' })`
   - Google ทำการยืนยันตัวตน และ Redirect กลับมายัง `/auth/callback?code=...`
   - Route Handler แลก authorization code เป็น Session Token และเก็บลงใน **Secure HttpOnly Cookie** อัตโนมัติ
   - Middleware คอยตรวจสอบและ Refresh session token ในทุกคำขอ

2. **Character Selection & Room Flow**:
   - เมื่อผู้ใช้เลือกตัวละคร (จากหน้า Quiz `/quiz` หรือหน้าตัวละคร `/characters/[type]`)
   - Server Action `saveQuizResult` จะทำการ `UPSERT` ข้อมูลลงในตาราง `public.profiles`
   - สั่งล้างแคช (`revalidatePath`) ของหน้า `/room` ทันที
   - เมื่อผู้ใช้เข้าหน้า `/room` เซิร์ฟเวอร์จะ Query ข้อมูลตัวละครล่าสุดจาก Supabase แล้วส่งต่อให้ `RoomScene` เรนเดอร์อนิเมชัน GSAP แบบนุ่มนวล

---

## 2. โครงสร้างฐานข้อมูล (Database Schema)

### 2.1 แผนผังความสัมพันธ์ (Entity Relationship)

```
┌────────────────────────┐          ┌───────────────────────────────────┐
│     auth.users         │          │         public.profiles           │
├────────────────────────┤          ├───────────────────────────────────┤
│ id (UUID) [PK]         │ ◄──1:1── │ id (UUID) [PK, FK -> auth.users]  │
│ email (TEXT)           │          │ display_name (TEXT)               │
│ raw_user_meta_data     │          │ avatar_url (TEXT)                 │
│ created_at             │          │ assigned_character (TEXT)         │
└────────────────────────┘          │ house (TEXT)                      │
                                    │ vibe (TEXT)                       │
                                    │ created_at (TIMESTAMPTZ)          │
                                    │ updated_at (TIMESTAMPTZ)          │
                                    └───────────────────────────────────┘
```

### 2.2 รายละเอียดตาราง `public.profiles`
| คอลัมน์ | ชนิดข้อมูล | หน้าที่ |
| :--- | :--- | :--- |
| `id` | `UUID` | รหัสผู้ใช้ อ้างอิงจาก `auth.users.id` (Primary Key & Foreign Key, Cascade Delete) |
| `display_name` | `TEXT` | ชื่อที่แสดงของผู้ใช้ (ดึงจาก Google Account เช่น `P1u3m`) |
| `avatar_url` | `TEXT` | ลิงก์รูปโปรไฟล์จาก Google |
| `assigned_character` | `TEXT` | รหัสตัวละครประจำตัว เช่น `INFP`, `INTP`, `ENFJ` |
| `house` | `TEXT` | รหัสบ้าน เช่น `lavender`, `clover`, `forget-me-not`, `dandelion` |
| `vibe` | `TEXT` | คำฮีลใจที่เลือกจากการทำ Quiz (เช่น 'อิสระ', 'พอดี', 'สบาย') |
| `created_at` | `TIMESTAMPTZ` | วันเวลาที่สร้างโปรไฟล์ |
| `updated_at` | `TIMESTAMPTZ` | วันเวลาที่มีการอัปเดตข้อมูลล่าสุด |

### 2.3 นโยบายความปลอดภัย (Row Level Security - RLS)
- **SELECT**: ทุกคนสามารถอ่านโปรไฟล์ได้ (`using (true)`)
- **INSERT**: อนุญาตเฉพาะเจ้าของบัญชีเท่านั้น (`with check ((select auth.uid()) = id)`)
- **UPDATE**: อนุญาตเฉพาะเจ้าของบัญชีเท่านั้น (`using ((select auth.uid()) = id) with check ((select auth.uid()) = id)`)
- **Automated Trigger**: `handle_new_user()` ทำงานอัตโนมัติเมื่อมีผู้ใช้ใหม่ลงทะเบียนผ่าน OAuth

---

## 3. สรุปรายการเครื่องมือและเทคโนโลยีทั้งหมด (Tech Stack)

### 3.1 ฝั่งหน้าบ้าน (Frontend & UI)
- **Next.js 16 (App Router)**: เฟรมเวิร์กหลัก รองรับ Server Components, Server Actions และ Static Site Generation
- **React 19**: ไลบรารีจัดการคอมโพเนนต์
- **TypeScript 7**: ควบคุมความถูกต้องของ Type และโค้ดทั้งโปรเจกต์
- **GSAP 3.15 (GreenSock Animation Platform)**: จัดการ Micro-animations, Floating Mascot, และ ScrollTrigger
- **Pure CSS System (globals.css)**: ดีไซน์ระบบกระดาษธรรมชาติ (Paper / Sanctuary Aesthetic) ด้วย CSS Variables

### 3.2 ฝั่งหลังบ้านและการจัดเก็บข้อมูล (Backend & Database)
- **Supabase PostgreSQL**: ฐานข้อมูลหลักระดับ Production
- **Supabase Auth (OAuth 2.0)**: ระบบยืนยันตัวตนผ่าน Google Provider
- **@supabase/ssr**: ไลบรารีเชื่อมต่อ Supabase บน Next.js App Router แบบปลอดภัยผ่าน HttpOnly Cookies
- **Next.js Middleware**: ตัวคอยตรวจสอบและรีเฟรช Session อัตโนมัติทุก Request

### 3.3 เครื่องมือสนับสนุนและการพัฒนา (DevOps & Tooling)
- **Vercel**: แพลตฟอร์มสำหรับการ Deploy เว็บไซต์จริงแบบ Serverless & Edge
- **GitHub**: คลังจัดเก็บซอร์สโค้ดและระบบ CI/CD
- **Model Context Protocol (MCP)**:
  - `Supabase MCP`: เชื่อมต่อตรงกับฐานข้อมูลสำหรับรัน Migration, DDL, และตรวจสอบ Schema
  - `GitHub MCP`: ดันโค้ดและควบคุมเวอร์ชันโดยตรงจาก Agent
- **Playwright**: ไลบรารีสำหรับการทดสอบ E2E และสร้างเอกสารรายงาน PDF คุณภาพสูง
