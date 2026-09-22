export const houses = [
  {
    id: "lavender",
    name: "Lavender",
    thai: "บ้านของนักคิด",
    groupTitle: "THE VISIONARIES",
    color: "#EEE9F5",
    gradientStart: "#FAF8FC",
    gradientEnd: "#EAE0FC",
    ink: "#674277",
    badgeColor: "#74549E",
    sigil: "บ้านม่วง.png",
    description: "พื้นที่ให้ความสงสัยได้เติบโต และทุกความคิดได้เป็นตัวเอง",
    motto: "A little wonder goes a long way.",
  },
  {
    id: "clover",
    name: "Clover",
    thai: "บ้านของหัวใจอ่อนโยน",
    groupTitle: "THE VELVETEENS",
    color: "#EAF7E8",
    gradientStart: "#F9FBF5",
    gradientEnd: "#DBEED5",
    ink: "#173E2C",
    badgeColor: "#459273",
    sigil: "บ้านเขียว.png",
    description: "โอบกอดความรู้สึก ความฝัน และสิ่งเล็ก ๆ ที่มีความหมาย",
    motto: "Soft hearts make a lovely world.",
  },
  {
    id: "forget-me-not",
    name: "Forget-me-not",
    thai: "บ้านของความใส่ใจ",
    groupTitle: "THE VIGILS",
    color: "#EEF6FF",
    gradientStart: "#F8FAFC",
    gradientEnd: "#DCECFB",
    ink: "#183B64",
    badgeColor: "#447EB9",
    sigil: "บ้านฟ้า.png",
    description: "ความอบอุ่นจากคนที่อยู่ข้าง ๆ และรายละเอียดที่ไม่เคยถูกลืม",
    motto: "It’s the little things that matter.",
  },
  {
    id: "dandelion",
    name: "Dandelion",
    thai: "บ้านของนักสำรวจ",
    groupTitle: "THE VOYAGEURS",
    color: "#FFF7D7",
    gradientStart: "#FCFAF3",
    gradientEnd: "#F9EBBB",
    ink: "#493A0E",
    badgeColor: "#BD7A38",
    sigil: "บ้านเหลือง.png",
    description: "เปิดประตูให้วันธรรมดาได้พาเราไปพบเรื่องใหม่ ๆ",
    motto: "Let the day surprise you.",
  },
] as const;
export function houseBackground(house: (typeof houses)[number]) {
  return `linear-gradient(145deg, ${house.gradientStart} 0%, ${house.color} 55%, ${house.gradientEnd} 100%)`;
}
const entries = [
  [
    "INTJ",
    "Caine",
    "นักวางแผนที่มีโลกเล็ก ๆ ของตัวเอง",
    "แม้จะดูเงียบ ๆ แต่ในหัวมีเรื่องน่าสนใจเกิดขึ้นเสมอ",
  ],
  [
    "INTP",
    "Mavis",
    "เพื่อนช่างสงสัย",
    "ชอบเก็บคำถามเล็ก ๆ ไปคิดต่อในมุมที่สบายใจ",
  ],
  [
    "ENTJ",
    "Conrad",
    "คนที่คอยพาเราไปข้างหน้า",
    "มองเห็นความเป็นไปได้ และอยากชวนทุกคนเติบโตไปด้วยกัน",
  ],
  ["ENTP", "Felix", "นักคิดนอกกรอบ", "ทุกบทสนทนาคือประตูสู่ไอเดียใหม่ ๆ"],
  [
    "INFJ",
    "Luna",
    "ผู้ฟังที่เข้าใจหัวใจ",
    "มองเห็นความหมายในสิ่งที่คนอื่นอาจมองข้าม",
  ],
  [
    "INFP",
    "Kumo",
    "นักฝันใจนุ่มฟู",
    "มีความสุขกับเรื่องเล็ก ๆ และเชื่อว่าความอ่อนโยนเปลี่ยนโลกได้",
  ],
  [
    "ENFJ",
    "Alfred",
    "เพื่อนที่คอยส่งกำลังใจ",
    "อยากให้ทุกคนรู้ว่าตัวเองมีคุณค่าในแบบที่เป็น",
  ],
  [
    "ENFP",
    "Penny",
    "ประกายสดใสในวันธรรมดา",
    "พร้อมชวนเพื่อนออกไปพบความเป็นไปได้ใหม่เสมอ",
  ],
  [
    "ISTJ",
    "Henry",
    "ความสบายใจที่ไว้ใจได้",
    "ค่อย ๆ ดูแลทุกอย่างด้วยความตั้งใจในแบบของตัวเอง",
  ],
  [
    "ISFJ",
    "Charlotte",
    "ผู้ดูแลความสุขเล็ก ๆ",
    "จำรายละเอียดของคนรอบตัวได้ และใส่ใจโดยไม่ต้องเอ่ยคำ",
  ],
  [
    "ESTJ",
    "Aalto",
    "คนเก่งที่พึ่งพาได้",
    "ชอบทำให้เรื่องยุ่ง ๆ กลายเป็นเรื่องที่ทุกคนจัดการได้",
  ],
  [
    "ESFJ",
    "Julian",
    "เจ้าบ้านแสนอบอุ่น",
    "ความสุขคือการได้เห็นคนรอบตัวรู้สึกเหมือนอยู่บ้าน",
  ],
  ["ISTP", "Jax", "นักลองผู้รักอิสระ", "ปล่อยให้การลงมือทำพาไปเจอคำตอบทีละนิด"],
  [
    "ISFP",
    "Wendy",
    "ศิลปินของช่วงเวลาเล็ก ๆ",
    "เก็บความสวยงามระหว่างทางไว้ในหัวใจเสมอ",
  ],
  [
    "ESTP",
    "Axel",
    "เพื่อนร่วมผจญภัย",
    "พร้อมลองสิ่งใหม่ และทำให้วันนี้มีเรื่องให้ยิ้ม",
  ],
  [
    "ESFP",
    "Hanni",
    "รอยยิ้มของวงเพื่อน",
    "อยู่กับปัจจุบัน และแบ่งปันความสุขอย่างเป็นธรรมชาติ",
  ],
] as const;
export const characters = entries.map(
  ([type, name, tagline, description], i) => ({
    type,
    name,
    tagline,
    description,
    house: houses[Math.floor(i / 4)],
    image: `/characters/${String(i + 1).padStart(2, "0")}_${type}.png`,
  }),
);
export type Character = (typeof characters)[number];
export function getCharacter(type: string) {
  return characters.find((c) => c.type === type.toUpperCase());
}
export const questions = [
  {
    text: "วันว่างที่ไม่มีแผน คุณอยากใช้เวลายังไง?",
    options: [
      "ออกไปเจอเพื่อน เติมพลังด้วยบทสนทนา",
      "อยู่ในมุมโปรด เติมพลังให้ตัวเอง",
    ],
    values: ["E", "I"],
  },
  {
    text: "เมื่อเจอเพื่อนกลุ่มใหม่ คุณมักจะ…",
    options: ["เริ่มทักทาย แล้วค่อยทำความรู้จัก", "ฟังสักหน่อย แล้วค่อยเปิดใจ"],
    values: ["E", "I"],
  },
  {
    text: "เวลาเดินเล่น คุณมักสะดุดตากับอะไร?",
    options: [
      "รายละเอียดเล็ก ๆ ที่อยู่ตรงหน้า",
      "จินตนาการว่าเส้นทางนี้จะพาไปไหน",
    ],
    values: ["S", "N"],
  },
  {
    text: "ถ้าจะลองทำอะไรใหม่ คุณชอบเริ่มจาก…",
    options: [
      "ตัวอย่างที่เห็นภาพและลองทำตามได้",
      "ไอเดียและความเป็นไปได้หลาย ๆ แบบ",
    ],
    values: ["S", "N"],
  },
  {
    text: "เมื่อเพื่อนมีเรื่องหนักใจ คุณจะ…",
    options: [
      "ช่วยคิดหาวิธีแก้ปัญหาไปด้วยกัน",
      "ฟังและอยู่ข้าง ๆ ความรู้สึกของเขา",
    ],
    values: ["T", "F"],
  },
  {
    text: "เวลาต้องเลือกเรื่องสำคัญ คุณให้น้ำหนักกับ…",
    options: ["เหตุผลและสิ่งที่น่าจะได้ผล", "ความรู้สึกและผลต่อคนรอบตัว"],
    values: ["T", "F"],
  },
  {
    text: "ทริปในฝันของคุณน่าจะเป็นแบบไหน?",
    options: ["มีแผนสบาย ๆ รู้ว่าจะไปไหน", "ไปตามใจ แล้วพบอะไรใหม่ระหว่างทาง"],
    values: ["J", "P"],
  },
  {
    text: "เมื่อมีสิ่งที่อยากทำ คุณมักจะ…",
    options: [
      "จัดเวลาไว้ แล้วค่อย ๆ ทำให้เสร็จ",
      "รอจังหวะที่ใช่ แล้วทำตามแรงบันดาลใจ",
    ],
    values: ["J", "P"],
  },
];
// A third question for each dimension makes every answer count without a tie-break bias.
questions.push(
  {
    text: "หลังจากวันยาว ๆ อะไรช่วยให้คุณรู้สึกดีขึ้น?",
    options: [
      "เล่าเรื่องของวันนี้ให้ใครสักคนฟัง",
      "ใช้เวลาเงียบ ๆ อยู่กับตัวเอง",
    ],
    values: ["E", "I"],
  },
  {
    text: "เวลาเล่าเรื่องที่ชอบ คุณมักเล่าถึง…",
    options: [
      "สิ่งที่เกิดขึ้นจริงอย่างชัดเจน",
      "ความหมายและสิ่งที่เรื่องนั้นทำให้นึกถึง",
    ],
    values: ["S", "N"],
  },
  {
    text: "ถ้าเพื่อนมีความเห็นไม่ตรงกัน คุณมักจะ…",
    options: [
      "ช่วยเทียบเหตุผลของแต่ละทางเลือก",
      "ช่วยให้ทุกคนรู้สึกว่าได้รับการรับฟัง",
    ],
    values: ["T", "F"],
  },
  {
    text: "วันหยุดที่กำลังจะมาถึง คุณชอบ…",
    options: ["เลือกสิ่งที่อยากทำไว้ล่วงหน้า", "เว้นที่ไว้ให้เปลี่ยนใจได้เสมอ"],
    values: ["J", "P"],
  },
);
export function calculateType(answers: number[]) {
  if (
    answers.length !== questions.length ||
    answers.some((a) => a !== 0 && a !== 1)
  )
    throw new Error("Please answer all questions.");
  return [0, 2, 4, 6]
    .map(
      (i, dimension) =>
        questions[i].values[
          answers[i] + answers[i + 1] + answers[8 + dimension] >= 2 ? 1 : 0
        ],
    )
    .join("");
}
export const situations = [
  "วันที่อยากพักจากทุกอย่าง",
  "เมื่อเพื่อนส่งข้อความมาหา",
  "เช้าวันจันทร์ที่ยังง่วงอยู่",
  "วันที่ฝนตกทั้งวัน",
  "เมื่อได้ลองสิ่งใหม่",
  "เมื่อแผนเปลี่ยนกะทันหัน",
  "ตอนต้องตัดสินใจ",
  "วันเกิดของเพื่อนคนสำคัญ",
  "เมื่ออยู่ในงานที่คนเยอะ",
  "เมื่อมีเวลาให้ตัวเอง",
  "วันที่งานไม่เป็นใจ",
  "เมื่อเจอเพลงที่ชอบ",
  "ก่อนออกเดินทาง",
  "เมื่อใครสักคนต้องการกำลังใจ",
  "วันที่ภูมิใจในตัวเอง",
  "ก่อนเข้านอนในคืนนี้",
];
