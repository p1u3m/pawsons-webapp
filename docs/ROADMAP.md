# Pawsons — Full Development Roadmap (4 Phases)

> **Core Philosophy**: Calm, simple & clean (ฟิลกู้ด สบายตา ไม่ต้องรีบไปต่อ)  
> **Tech Stack**: Next.js App Router (React 19, TypeScript), GSAP, **Supabase** (Auth + PostgreSQL), **Stripe Checkout** (International Payments)

---

## 🏗️ สรุปสถาปัตยกรรมระบบ (System Architecture)

```mermaid
flowchart TD
    subgraph Client ["Client (Mobile-first WebApp)"]
        UI["Next.js App Router + GSAP"]
        AuthUI["Google Sign-In Button / Profile Dropdown"]
        RoomUI["Character Room (/room)"]
        MailUI["Personal Letters (/letters)"]
        ShopUI["E-commerce Shop (/shop)"]
    end

    subgraph Backend ["Server & APIs (Next.js Server Actions & Route Handlers)"]
        AuthMiddleware["Supabase Auth Middleware"]
        LetterWorker["Letter Delivery Scheduler"]
        StripeRoute["/api/checkout (Stripe Session)"]
        WebhookRoute["/api/webhooks/stripe"]
    end

    subgraph CloudServices ["External Cloud Services"]
        SupabaseAuth["Supabase Auth (Google OAuth 2.0)"]
        SupabaseDB[("Supabase PostgreSQL DB")]
        SupabaseStorage["Supabase Storage (Letter Media / Room Assets)"]
        StripeGateway["Stripe Checkout (Global Cards, Apple Pay, Google Pay)"]
    end

    AuthUI -->|Login| SupabaseAuth
    SupabaseAuth -->|Session Token| AuthMiddleware
    RoomUI & MailUI -->|Server Actions| SupabaseDB
    ShopUI -->|Create Session| StripeRoute
    StripeRoute -->|Redirect| StripeGateway
    StripeGateway -->|Webhook Event| WebhookRoute
    WebhookRoute -->|Update Order & Inventory| SupabaseDB
```

---

## 🗄️ ออกแบบฐานข้อมูล (Supabase PostgreSQL Schema)

```sql
-- 1. ตารางโปรไฟล์ผู้ใช้ (ต่อขยายจาก auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  assigned_character text, -- เช่น 'INFP', 'ENFJ' จากผล Quiz
  house text,              -- เช่น 'Verdant', 'Gilded'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ตารางห้องของตัวละคร (Character Room)
create table public.user_rooms (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  theme text default 'paper-classic',
  wallpaper text default 'default',
  placed_items jsonb default '[]'::jsonb, -- พิกัดและของตกแต่งที่วางในห้อง
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ตารางคลังไอเทมของผู้ใช้ (Inventory)
create table public.user_inventory (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_type text not null, -- 'furniture', 'stamp', 'badge', 'sticker'
  item_code text not null, -- รหัสสินค้า/ไอเทม
  acquired_via text not null, -- 'quiz', 'shop', 'letter_gift'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ตารางจดหมายส่วนตัว (Personal Letters)
create table public.letters (
  id uuid default gen_random_uuid() primary key,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  sender_type text not null, -- 'character' หรือ 'friend' หรือ 'system'
  sender_id text not null,   -- รหัสตัวละคร เช่น 'INFP' หรือ user_id ของเพื่อน
  stamp_code text default 'basic-paw',
  title text not null,
  content text not null,
  status text default 'in_transit', -- 'in_transit', 'delivered', 'opened'
  deliver_at timestamp with time zone not null, -- เวลาส่งถึง (Slow Mail Concept)
  opened_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ภาพร่างคำสั่งซื้อ; schema จริงและ migrations อยู่ในแผน Phase 4
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  stripe_session_id text unique, -- ยังไม่มีค่าขณะสร้าง order ก่อน Checkout Session
  stripe_payment_intent_id text unique,
  amount_total bigint not null, -- หน่วยย่อยของ currency เช่น satang/cents
  currency text not null,
  order_status text not null default 'checkout_pending',
  payment_status text not null default 'unpaid',
  fulfillment_status text not null default 'unfulfilled',
  shipping_details jsonb,
  items jsonb not null, -- snapshot; implementation จริงแยก order_items
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

---

## 📅 รายละเอียดการดำเนินงานทั้ง 4 Phase

### 🌿 Phase 1: Database & Google Authentication (รากฐานระบบ)
**เป้าหมาย:** ให้ผู้ใช้สามารถกดล็อกอินด้วย Google Account ได้อย่างปลอดภัย มีข้อมูลโปรไฟล์ และคงสถานะ Session ได้อย่างราบรื่น

1. **เตรียมการ Cloud & Credentials**:
   - สร้างโปรเจกต์ใน **Supabase Dashboard**
   - สร้าง OAuth 2.0 Client ID & Secret บน **Google Cloud Console**
   - ผูก Google Provider เข้ากับ Supabase Authentication
2. **ติดตั้ง Libraries ใน Next.js**:
   - `@supabase/supabase-js`, `@supabase/ssr`
3. **โครงสร้างโค้ด**:
   - `src/lib/supabase/client.ts` (Browser Client)
   - `src/lib/supabase/server.ts` (Server Client / Server Actions)
   - `src/middleware.ts` (จัดระเบียบ Cookie / Session Refresh อัตโนมัติ)
4. **ส่วนติดต่อผู้ใช้ (UI Components)**:
   - ปุ่ม **Sign in with Google** บริเวณมุมบนของ Header (รองรับธีม Paper/Ink สบายตา)
   - เมนูผู้ใช้ (User Dropdown/Drawer) แสดง Avatar, ชื่อผู้ใช้, สถานะตัวละคร และปุ่ม Sign Out
   - เชื่อมต่อให้ผลการทำ Quiz (`/quiz`) บันทึกลง Profile ผู้ใช้อัตโนมัติเมื่อล็อกอิน

---

### 🏡 Phase 2: User Profile & Character Room (ห้องตัวละคร)
**เป้าหมาย:** สร้างพื้นที่ส่วนตัวอันอบอุ่นของผู้ใช้ ที่มีตัวละครประจำตัวคอยต้อนรับ พร้อมจัดวางสิ่งของตกแต่งได้

1. **หน้าโปรไฟล์ (`/profile`)**:
   - แสดงตราประจำบ้าน (House Badge: Verdant, Gilded, etc.)
   - การ์ดตัวละครประจำตัว พร้อมปุ่มแชร์ IG Story Card ที่สร้างเฉพาะบุคคล
   - ประวัติกิจกรรม และรายการจดหมาย/ไอเทมสะสม
2. **หน้าห้องตัวละคร (`/room`)**:
   - **Visual Design**: ภาพห้องโทนกระดาษอุ่นๆ (Paper aesthetic) มีหน้าต่างมองเห็นบรรยากาศกลางวัน/กลางคืน
   - **Interactive Mascot**: ตัวละครประจำตัวนั่ง/ยืนในห้อง ขยับแบบ Idle Animation ด้วย **GSAP** (กระพริบตา, โบกมือเบาๆ เมื่อแตะ)
   - **Furniture & Decor Placement**: ระบบวางของสะสมหรือไอเทมที่ได้รับจากกล่องจดหมาย/ร้านค้า
   - มีปุ่ม "เยี่ยมชมห้องเพื่อน" (Shareable Room Link) เปิดให้คนอื่นเข้ามาดูห้องได้แบบ Read-only

---

### ✉️ Phase 3: Personal Letters System (`/letters`)
**เป้าหมาย:** ฟีเจอร์จดหมายสไตล์ Slow-Life *"เหมือนแชทกับตัวละคร แต่ต้องรอเหมือนรอจดหมายจริง"* เพื่อให้รู้สึกอบอุ่นและได้พักผ่อน

1. **คอนเซ็ปต์การทำงาน (Slow-Mail Concept)**:
   - ผู้ใช้เขียนจดหมายส่งหาตัวละคร หรือกดขอรับคำปรึกษา/เรื่องเล่าประจำวัน
   - ระบบตั้งเวลา `deliver_at` (เช่น 6 ชั่วโมง, 12 ชั่วโมง หรือวันรุ่งขึ้นเวลา 09:00 น.)
   - ตัวละครจะตอบกลับมาพร้อมของขวัญเล็กๆ (เช่น สติกเกอร์ หรือคำคมฮีลใจ)
2. **ระบบกล่องจดหมาย (Mailbox UI)**:
   - ตู้จดหมายไม้หน้าบ้าน (แสดงไอคอนธงขึ้นเมื่อมีจดหมายใหม่)
   - แท็บ: **กล่องจดหมายเข้า (Inbox)**, **จดหมายที่กำลังเดินทาง (In Transit)**, **คลังจดหมายเก่า (Memories)**
3. **อนิเมชันเปิดจดหมาย (GSAP Experience)**:
   - กดเปิดซองจดหมาย มีเอฟเฟกต์แกะครั่ง/สแตมป์ และคลี่กระดาษจดหมายออกมาอย่างนุ่มนวล
   - ระบบเก็บสแตมป์สะสม (Stamp Book) เป็นมินิเกมให้สะสมสแตมป์จากทุกตัวละคร

---

### 🛍️ Phase 4: E-commerce Shop & International Stripe Checkout

**เป้าหมาย:** เปลี่ยน `/shop` จากหน้าตัวอย่างเป็นร้านขาย Physical Merch และ Digital Items ที่จัดการ catalog, cart, stock, order, การชำระเงินผ่าน Stripe Hosted Checkout และ fulfillment ได้ครบ พร้อมทดสอบก่อนเปิดรับเงินจริง

อ่านรายละเอียดงาน ระบบข้อมูล การไหลของเงินและออเดอร์ ความเสี่ยง และเกณฑ์เปิดขายใน [แผน Shop Phase 4](./PHASE-4-SHOP.md)

---

## 🔒 Security & Best Practices
- **Row Level Security (RLS)**: บังคับใช้ใน Supabase ทุกตาราง ผู้ใช้เข้าถึงได้เฉพาะข้อมูลห้อง/จดหมาย/ออเดอร์ของตนเอง
- **Stripe Webhook Verification**: ตรวจสอบ Header Signature ป้องกันการส่ง Request ปลอม
- **Environment Variables**: เก็บ Private Key (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`) ไว้เฉพาะ Server-side เท่านั้น
