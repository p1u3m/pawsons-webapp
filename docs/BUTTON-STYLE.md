# Dark Pill Button

สไตล์ปุ่มอ้างอิงจากภาพ: ปุ่มสีดำทรงแคปซูล ข้อความสีขาว มีเงานุ่มด้านนอก ขอบไฮไลต์ด้านใน และวงกลมเครื่องหมายถูกทางขวา

## ชื่อสไตล์

- **Pill Button / Capsule Button**: ปุ่มปลายมนทั้งสองด้านด้วย `border-radius: 9999px`
- **Soft Raised Effect**: เงาช่วยให้ปุ่มดูนูนเหนือพื้นหลังเล็กน้อย
- **Inset Highlight**: ไฮไลต์บาง ๆ ด้านบนของขอบด้านใน
- **Icon Badge**: วงกลมสีเทาเข้มที่รองรับไอคอนทางขวา

ชื่อที่ใช้เรียกในโปรเจกต์: **Dark Pill Button with Icon Badge**

## ลักษณะภาพ

| ส่วน | ค่าเริ่มต้น |
| --- | --- |
| พื้นหลังปุ่ม | `#191919` |
| ข้อความ | `#f7f7f5` |
| ขอบ | `#383838` |
| พื้นหลังวงกลมไอคอน | `#3b3b3b` |
| ความสูงขั้นต่ำ | `60px` |
| ขนาดวงกลมไอคอน | `40px` |
| ระยะห่างข้อความกับไอคอน | `14px` |
| รูปทรง | `border-radius: 9999px` |

ค่าด้านบนเป็นค่าประมาณเพื่อให้ได้รูปลักษณ์ใกล้เคียงภาพอ้างอิง

## ตัวอย่าง HTML

```html
<button class="dark-pill-button" type="button">
  <span class="dark-pill-button__label">เลือก Caine เป็นเพื่อนในห้อง</span>
  <span class="dark-pill-button__badge" aria-hidden="true">✓</span>
</button>
```

ในแอปให้ใช้ไอคอนจากไลบรารีที่โปรเจกต์มีอยู่ เช่น `CheckIcon` ของ Phosphor แทนตัวอักษรเครื่องหมายถูก เพื่อควบคุมขนาดและน้ำหนักเส้นได้สม่ำเสมอ

## ตัวอย่าง CSS

```css
.dark-pill-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 60px;
  max-width: 100%;
  padding: 10px 18px 10px 24px;
  border: 1px solid #383838;
  border-radius: 9999px;
  background: #191919;
  color: #f7f7f5;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0;
  text-align: center;
  cursor: pointer;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 18%),
    0 6px 14px rgb(0 0 0 / 12%);
  transition:
    transform 160ms ease,
    background-color 160ms ease,
    box-shadow 160ms ease;
}

.dark-pill-button__label {
  min-width: 0;
  overflow-wrap: anywhere;
}

.dark-pill-button__badge {
  display: grid;
  place-items: center;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3b3b3b;
  color: #f7f7f5;
  font-size: 22px;
}

.dark-pill-button__badge svg {
  width: 22px;
  height: 22px;
}

.dark-pill-button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #242424;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 22%),
    0 8px 18px rgb(0 0 0 / 16%);
}

.dark-pill-button:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 12%),
    0 2px 6px rgb(0 0 0 / 12%);
}

.dark-pill-button:focus-visible {
  outline: 2px solid #191919;
  outline-offset: 4px;
}

.dark-pill-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .dark-pill-button {
    transition: none;
  }
}
```

## แนวทางใช้งาน

- ใช้สำหรับคำสั่งหลัก เช่น เลือกตัวละคร หรือยืนยันการเลือก
- ข้อความควรสั้นและชัดเจน หากหน้าจอแคบให้ขึ้นบรรทัดใหม่ได้โดยวงกลมไอคอนไม่หด
- เลือกไอคอนให้ตรงกับคำสั่ง เครื่องหมายถูกเหมาะกับการเลือกหรือยืนยัน
- ใช้ `<button>` สำหรับคำสั่ง และ `<a>` หรือ `Link` สำหรับการไปหน้าอื่น
- ระหว่างบันทึกให้ปิดการกดซ้ำด้วย `disabled` พร้อมแสดงข้อความสถานะและ `aria-busy="true"`
