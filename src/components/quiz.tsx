"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { gsap } from "gsap";
import { questions, calculateType, characters } from "@/lib/data";
import { cn } from "@/lib/utils";
import { CharacterImage } from "./character-ui";
import { Eyebrow, IconDisc, pillButton } from "./pill-button";

type SceneStep = {
  kind: "scene";
  id: string;
  badge?: string;
  text: string;
  subtext?: string;
  image: string;
  imageAlt: string;
  buttonText: string;
};

type QuestionStep = {
  kind: "question";
  questionIndex: number;
};

type SpecialVibeStep = {
  kind: "special-vibe";
  id: string;
  badge?: string;
  text: string;
  subtext?: string;
  options: string[];
};

type QuizStep = SceneStep | QuestionStep | SpecialVibeStep;

const QUIZ_STEPS: QuizStep[] = [
  // Scene 1: Entering the sanctuary
  {
    kind: "scene",
    id: "scene-intro",
    badge: "THE JOURNEY BEGINS",
    text: "ก้าวออกจากความเร่งรีบภายนอก...\nยินดีต้อนรับสู่เส้นทางอันเงียบสงบของ Pawsons",
    subtext: "สูดหายใจลึก ๆ ผ่อนคลาย แล้วมาเริ่มออกเดินทางด้วยกันนะ",
    image: "/characters/06_INFP.png",
    imageAlt: "Kumo the gentle cloud companion",
    buttonText: "เริ่มออกเดินทาง",
  },
  // Q0, Q1, Q2, Q3
  { kind: "question", questionIndex: 0 },
  { kind: "question", questionIndex: 1 },
  { kind: "question", questionIndex: 2 },
  { kind: "question", questionIndex: 3 },
  // Scene 2: Rest by the leaf stream
  {
    kind: "scene",
    id: "scene-stream",
    badge: "A GENTLE BREATHER",
    text: "หยุดพักสูดหายใจลึก ๆ ริมลำธารใบไม้\nเสียงสายน้ำใสและลมพัดเอื่อย ๆ ช่วยให้ใจค่อย ๆ เบาลง",
    subtext: "ไม่ต้องรีบนะ เดินไปด้วยจังหวะที่สบายที่สุดของคุณ",
    image: "/characters/14_ISFP.png",
    imageAlt: "Wendy the gentle artist by the stream",
    buttonText: "เดินต่อ",
  },
  // Q4, Q5, Q6, Q7
  { kind: "question", questionIndex: 4 },
  { kind: "question", questionIndex: 5 },
  { kind: "question", questionIndex: 6 },
  { kind: "question", questionIndex: 7 },
  // Scene 3: Pastel twilight & fragrant breeze
  {
    kind: "scene",
    id: "scene-twilight",
    badge: "TWILIGHT TRAIL",
    text: "แสงแดดยามเย็นเริ่มทอแสงสีพาสเทลอบอุ่น\nรอยเท้าเล็ก ๆ บนผืนหญ้านำทางคุณไปข้างหน้า",
    subtext: "กลิ่นหอมของดอกไม้ลอยมาเบา ๆ ใกล้ถึงที่หมายแล้วล่ะ",
    image: "/characters/10_ISFJ.png",
    imageAlt: "Charlotte with warm tea and flowers",
    buttonText: "ตามรอยเท้าไป",
  },
  // Q8, Q9, Q10, Q11
  { kind: "question", questionIndex: 8 },
  { kind: "question", questionIndex: 9 },
  { kind: "question", questionIndex: 10 },
  { kind: "question", questionIndex: 11 },
  // Special Question: 10 choices in a balanced 2-column grid
  {
    kind: "special-vibe",
    id: "special-vibe",
    badge: "YOUR INNER SANCTUARY",
    text: "สิ่งที่ขาดไม่ได้ในที่พักใจของคุณคือ…",
    subtext: "เลือก 1 คำที่ตรงกับหัวใจของคุณที่สุดตอนนี้",
    options: [
      "สบาย",
      "ใส่ใจ",
      "สนุก",
      "อิสระ",
      "พอดี",
      "เข้าที่เข้าทาง",
      "ตื่นเต้น",
      "มั่นคง",
      "ไม่ยอมแพ้",
      "อบอุ่น",
    ],
  },
  // Scene 4: The clearing where a friend awaits
  {
    kind: "scene",
    id: "scene-clearing",
    badge: "ALMOST HOME",
    text: "สุดทางเดินคือลานหญ้ากว้างที่แสงแดดอุ่นส่องถึง\nมีเพื่อนตัวน้อยกำลังรอทักทายคุณอยู่ตรงนั้น...",
    subtext: "พร้อมที่จะพบกับเพื่อนที่คล้ายคุณแล้วหรือยัง?",
    image: "/characters/02_INTP.png",
    imageAlt: "Mavis curious little pawson",
    buttonText: "พบเพื่อนของคุณ",
  },
];

export default function Quiz() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // GSAP transition when step changes
  useEffect(() => {
    if (!started) return;
    heading.current?.focus();
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(panel.current, {
        opacity: 0,
        y: 12,
        duration: 0.4,
        ease: "power2.out",
        clearProps: "all",
      });
    });
    return () => media.revert();
  }, [step, started]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  function startQuiz() {
    setStarted(true);
    setStep(0);
    if (!isMuted && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay policy fallback
      });
    }
  }

  function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused || isMuted) {
      audio.muted = false;
      setIsMuted(false);
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
      setIsMuted(true);
    }
  }

  const currentStep = QUIZ_STEPS[step];

  function handleNext() {
    if (currentStep.kind === "question") {
      if (answers[currentStep.questionIndex] === undefined) return;
    } else if (currentStep.kind === "special-vibe") {
      if (!selectedVibe) return;
    }

    if (step === QUIZ_STEPS.length - 1) {
      // Final scene complete, calculate results
      const fullAnswers = Array.from({ length: 12 }, (_, i) => answers[i] ?? 0);
      const vibeQuery = selectedVibe ? `?vibe=${encodeURIComponent(selectedVibe)}` : "";
      router.push(`/results/${calculateType(fullAnswers).toLowerCase()}${vibeQuery}`);
    } else {
      setStep(step + 1);
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1);
    } else {
      setStarted(false);
    }
  }

  if (!started) {
    const playing = isPlaying && !isMuted;
    return (
      <div className="relative mx-auto max-w-[600px] rounded-[36px] border border-line bg-cream px-9 py-14 text-center shadow-card">
        {/* Invisible audio element initialized and persists across quiz */}
        <audio ref={audioRef} src="/audio/quiz-bgm.mp3" loop preload="auto" />

        {/* Pure circular icon button with no text (only on front page) */}
        <button
          type="button"
          className={cn(
            "absolute top-[26px] right-[26px] z-10 flex size-11 items-center justify-center rounded-full border-[1.5px] shadow-soft transition-all duration-350 ease-spring hover:scale-108 max-xs:top-[18px] max-xs:right-[18px] max-xs:size-[38px]",
            playing
              ? "border-green/35 bg-clover text-[#2d6b46]"
              : "border-line bg-white text-ink hover:border-green/40 hover:bg-[#faf8f2]",
          )}
          onClick={toggleAudio}
          aria-label={playing ? "ปิดเพลงคลอ" : "เปิดเพลงคลอ"}
          title={playing ? "ปิดเพลงคลอ" : "เปิดเพลงคลอ"}
        >
          {playing ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>

        <div className="mx-auto mb-6 grid size-[180px] place-items-center rounded-full bg-[linear-gradient(145deg,#fbfdf9_0%,#eef6ec_55%,#deeed8_100%)] shadow-[inset_0_1px_3px_rgb(255_255_255/0.8)]">
          <CharacterImage
            character={characters[5]}
            priority
            className="size-[155px] animate-float object-contain"
          />
        </div>

        <Eyebrow>A LITTLE SELF-DISCOVERY</Eyebrow>
        <h1 className="mt-3.5 mb-4 text-[clamp(34px,4.2vw,44px)]">
          เพื่อนตัวไหน
          <br />
          คล้ายคุณอยู่บ้างนะ?
        </h1>
        <p className="text-[16.5px] leading-[1.8]">
          12 คำถามสบาย ๆ พร้อมเรื่องราวระหว่างทาง
          <br />
          เลือกสิ่งที่เป็นคุณ แล้วมาพบเพื่อนตัวน้อยกัน
        </p>
        <button className={cn(pillButton(), "mt-7")} onClick={startQuiz}>
          <span>เริ่มทำแบบทดสอบ</span>
          <IconDisc>↗</IconDisc>
        </button>
        <span className="mt-4 block text-[12.5px] text-ink-muted">
          ใช้เวลาประมาณ 3 นาที · ไม่เก็บคำตอบของคุณ
        </span>
        <p className="mt-12 text-center text-[16.5px] leading-[1.8] text-ink-faint">
          แบบทดสอบเพื่อความสนุกและการผ่อนคลายใจ ไม่ใช่การประเมินทางจิตวิทยา
        </p>
      </div>
    );
  }

  // Active Quiz View (Clean, zero bars)
  const isQuestion = currentStep.kind === "question";
  const isSpecialVibe = currentStep.kind === "special-vibe";
  const questionIndex = isQuestion ? currentStep.questionIndex : -1;
  const q = isQuestion ? questions[questionIndex] : null;
  // How many of the 12 progress segments are filled.
  const progress = isQuestion
    ? questionIndex + 1
    : isSpecialVibe
      ? 12
      : (SCENE_PROGRESS[currentStep.id] ?? 12);
  const nextButton = cn(pillButton(), "mt-7 ml-auto flex");
  const questionHeading =
    "mt-4 mb-6 text-[clamp(24px,3.2vw,32px)] leading-[1.45] tracking-[-0.5px] outline-none";

  return (
    <div className="mx-auto mt-2.5 mb-10 max-w-[680px] rounded-[36px] border border-line bg-cream px-9 py-10 shadow-card max-md:rounded-[28px] max-md:px-5 max-md:py-7">
      {/* Persistent audio element continues playing seamlessly */}
      <audio ref={audioRef} src="/audio/quiz-bgm.mp3" loop preload="auto" />

      <div className="flex items-center justify-between text-[13.5px] font-medium text-ink-muted">
        <button
          className="rounded-full bg-ink/4 px-3.5 py-1.5 text-[13.5px] font-medium text-ink transition-all duration-350 ease-spring hover:bg-ink/8"
          onClick={handleBack}
        >
          ← ย้อนกลับ
        </button>
        <span aria-live="polite">
          {isQuestion
            ? `คำถามที่ ${questionIndex + 1} / 12`
            : isSpecialVibe
            ? "คำถามพิเศษ"
            : currentStep.badge ?? "เรื่องราวระหว่างทาง"}
        </span>
      </div>

      {/* 12-stage progress bar across the questions */}
      <div
        className="mt-[18px] mb-8 flex gap-2"
        role="progressbar"
        aria-label="ความคืบหน้าคำถาม"
        aria-valuemin={0}
        aria-valuemax={12}
        aria-valuenow={isQuestion ? questionIndex + 1 : isSpecialVibe ? 12 : Math.max(0, questionIndex + 1)}
      >
        {questions.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-[4px] transition-colors duration-300",
              i < progress ? "bg-green" : "bg-ink/7",
            )}
          />
        ))}
      </div>

      <div ref={panel}>
        {/* INTERSTITIAL SCENE SLIDE */}
        {currentStep.kind === "scene" && (
          <div className="mx-auto flex flex-col items-center px-2 pt-4 pb-3 text-center">
            <Eyebrow>{currentStep.badge ?? "PAWSONS SANCTUARY"}</Eyebrow>
            <h2
              className="mt-3 mb-2.5 text-[clamp(20px,3vw,25px)] leading-[1.6] font-semibold whitespace-pre-line text-ink outline-none"
              ref={heading}
              tabIndex={-1}
            >
              {currentStep.text}
            </h2>
            {currentStep.subtext && (
              <p className="mb-5 text-[14.5px] leading-[1.6]">{currentStep.subtext}</p>
            )}

            {/* Soft green glow behind the friend */}
            <div className="relative mx-auto mt-3 mb-7 grid size-[180px] place-items-center before:absolute before:-inset-3 before:rounded-full before:bg-[radial-gradient(circle,rgb(238_246_236/0.85)_0%,rgb(247_245_238/0)_70%)] before:content-['']">
              <Image
                src={currentStep.image}
                alt={currentStep.imageAlt}
                width={170}
                height={170}
                className="relative size-[155px] animate-[float_5.5s_ease-in-out_infinite] object-contain"
                priority
              />
            </div>

            <button type="button" className={cn(pillButton(), "mt-2")} onClick={handleNext}>
              <span>{currentStep.buttonText}</span>
              <IconDisc>↗</IconDisc>
            </button>
          </div>
        )}

        {/* SPECIAL VIBE MULTI-CHOICE QUESTION (2-COLUMN GRID LIKE QUIZ SAMPLE) */}
        {isSpecialVibe && (
          <div>
            <Eyebrow>{currentStep.badge ?? "YOUR INNER SANCTUARY"}</Eyebrow>
            <h1 ref={heading} tabIndex={-1} className={cn(questionHeading, "mb-2 text-center")}>
              {currentStep.text}
            </h1>
            {currentStep.subtext && (
              <p className="mb-6 text-center text-[15px]">{currentStep.subtext}</p>
            )}

            <div
              className="mt-7 mb-5 grid grid-cols-2 gap-3 max-xs:gap-2.5"
              aria-label="เลือกสิ่งที่ขาดไม่ได้ในที่พักใจ"
            >
              {currentStep.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    "flex items-center justify-center rounded-full border-[1.5px] px-5 py-4 text-center text-[16px] text-ink transition-all duration-350 ease-spring select-none hover:-translate-y-0.5 max-xs:px-2.5 max-xs:py-3.5 max-xs:text-[15px]",
                    selectedVibe === option
                      ? cn(SELECTED, "font-semibold text-[#1f4b30] shadow-[0_4px_16px_-3px_rgb(61_127_88/0.2)]")
                      : "border-line bg-paper font-medium hover:border-green/40 hover:bg-[#faf8f2]",
                  )}
                  onClick={() => setSelectedVibe(option)}
                >
                  <span>{option}</span>
                </button>
              ))}
            </div>

            <button className={nextButton} disabled={!selectedVibe} onClick={handleNext}>
              <span>ข้อต่อไป</span>
              <IconDisc>↗</IconDisc>
            </button>

            <p className="mt-6 text-center text-[12.5px]">
              เลือกคำที่ตรงกับความรู้สึกในใจคุณที่สุด
            </p>
          </div>
        )}

        {/* STANDARD QUESTION SLIDE */}
        {isQuestion && q && (
          <div>
            <Eyebrow>TAKE YOUR TIME</Eyebrow>
            <h1 ref={heading} tabIndex={-1} className={questionHeading}>
              {q.text}
            </h1>

            <fieldset className="grid gap-3">
              <legend className="sr-only">เลือกคำตอบที่ตรงกับคุณ</legend>
              {q.options.map((option, i) => (
                <label
                  key={option}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-[20px] border-[1.5px] px-6 py-[18px] text-[16px] transition-all duration-350 ease-spring hover:translate-x-[3px]",
                    answers[questionIndex] === i
                      ? cn(SELECTED, "shadow-[0_4px_16px_-3px_rgb(61_127_88/0.15)]")
                      : "border-line bg-paper hover:border-green/30 hover:bg-[#faf8f2]",
                  )}
                >
                  <input
                    type="radio"
                    className="size-5 shrink-0 accent-green"
                    name={`question-${questionIndex}`}
                    checked={answers[questionIndex] === i}
                    onChange={() =>
                      setAnswers((prev) => {
                        const copy = [...prev];
                        copy[questionIndex] = i;
                        return copy;
                      })
                    }
                  />
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>

            <button
              className={nextButton}
              disabled={answers[questionIndex] === undefined}
              onClick={handleNext}
            >
              <span>ข้อต่อไป</span>
              <IconDisc>↗</IconDisc>
            </button>

            <p className="mt-6 text-center text-[12.5px]">
              ไม่ต้องคิดมาก เลือกแบบที่รู้สึกเป็นคุณก็พอ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Progress shown on each story scene (questions answered before it).
const SCENE_PROGRESS: Record<string, number> = {
  "scene-intro": 0,
  "scene-stream": 4,
  "scene-twilight": 8,
};

const SELECTED =
  "border-green bg-[linear-gradient(145deg,#fbfdf9_0%,#eef6ec_60%,#e0efe0_100%)]";
