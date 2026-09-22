"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { gsap } from "gsap";
import { questions, calculateType, characters } from "@/lib/data";
import { CharacterImage } from "./ui";

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
    return (
      <div className="quiz-welcome">
        {/* Invisible audio element initialized and persists across quiz */}
        <audio ref={audioRef} src="/audio/quiz-bgm.mp3" loop preload="auto" />

        {/* Pure circular icon button with no text (only on front page) */}
        <button
          type="button"
          className={`quiz-music-circle ${isPlaying && !isMuted ? "playing" : ""}`}
          onClick={toggleAudio}
          aria-label={isPlaying && !isMuted ? "ปิดเพลงคลอ" : "เปิดเพลงคลอ"}
          title={isPlaying && !isMuted ? "ปิดเพลงคลอ" : "เปิดเพลงคลอ"}
        >
          {isPlaying && !isMuted ? (
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

        <div className="quiz-welcome-art">
          <CharacterImage character={characters[5]} priority />
        </div>

        <span className="eyebrow">A LITTLE SELF-DISCOVERY</span>
        <h1 style={{ marginTop: "14px" }}>
          เพื่อนตัวไหน
          <br />
          คล้ายคุณอยู่บ้างนะ?
        </h1>
        <p>
          12 คำถามสบาย ๆ พร้อมเรื่องราวระหว่างทาง
          <br />
          เลือกสิ่งที่เป็นคุณ แล้วมาพบเพื่อนตัวน้อยกัน
        </p>
        <button className="button" onClick={startQuiz}>
          <span>เริ่มทำแบบทดสอบ</span>
          <span className="icon-disc" aria-hidden="true">↗</span>
        </button>
        <span className="quiz-footnote">
          ใช้เวลาประมาณ 3 นาที · ไม่เก็บคำตอบของคุณ
        </span>
        <p className="prototype-note">
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

  return (
    <div className="quiz-panel">
      {/* Persistent audio element continues playing seamlessly */}
      <audio ref={audioRef} src="/audio/quiz-bgm.mp3" loop preload="auto" />

      <div className="quiz-topline">
        <button className="text-button" onClick={handleBack}>
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
        className="quiz-progress"
        role="progressbar"
        aria-label="ความคืบหน้าคำถาม"
        aria-valuemin={0}
        aria-valuemax={12}
        aria-valuenow={isQuestion ? questionIndex + 1 : isSpecialVibe ? 12 : Math.max(0, questionIndex + 1)}
      >
        {questions.map((_, i) => (
          <span
            key={i}
            className={
              isQuestion
                ? i <= questionIndex
                  ? "done"
                  : ""
                : isSpecialVibe
                ? "done"
                : currentStep.id === "scene-intro"
                ? ""
                : currentStep.id === "scene-stream"
                ? i <= 3
                  ? "done"
                  : ""
                : currentStep.id === "scene-twilight"
                ? i <= 7
                  ? "done"
                  : ""
                : "done"
            }
          />
        ))}
      </div>

      <div ref={panel}>
        {/* INTERSTITIAL SCENE SLIDE */}
        {currentStep.kind === "scene" && (
          <div className="quiz-scene-card">
            <span className="eyebrow">{currentStep.badge ?? "PAWSONS SANCTUARY"}</span>
            <h2 className="quiz-scene-text" ref={heading} tabIndex={-1}>
              {currentStep.text}
            </h2>
            {currentStep.subtext && (
              <p className="quiz-scene-subtext">{currentStep.subtext}</p>
            )}

            <div className="quiz-scene-image-wrap">
              <Image
                src={currentStep.image}
                alt={currentStep.imageAlt}
                width={170}
                height={170}
                className="quiz-scene-image"
                priority
              />
            </div>

            <button
              type="button"
              className="button quiz-scene-btn"
              onClick={handleNext}
            >
              <span>{currentStep.buttonText}</span>
              <span className="icon-disc" aria-hidden="true">↗</span>
            </button>
          </div>
        )}

        {/* SPECIAL VIBE MULTI-CHOICE QUESTION (2-COLUMN GRID LIKE QUIZ SAMPLE) */}
        {isSpecialVibe && (
          <div>
            <span className="eyebrow">{currentStep.badge ?? "YOUR INNER SANCTUARY"}</span>
            <h1 ref={heading} tabIndex={-1} style={{ textAlign: "center", marginBottom: "8px" }}>
              {currentStep.text}
            </h1>
            {currentStep.subtext && (
              <p style={{ textAlign: "center", color: "var(--muted)", margin: "0 0 24px", fontSize: "15px" }}>
                {currentStep.subtext}
              </p>
            )}

            <div className="quiz-options-grid" aria-label="เลือกสิ่งที่ขาดไม่ได้ในที่พักใจ">
              {currentStep.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`quiz-grid-option ${selectedVibe === option ? "selected" : ""}`}
                  onClick={() => setSelectedVibe(option)}
                >
                  <span>{option}</span>
                </button>
              ))}
            </div>

            <button
              className="button quiz-next"
              disabled={!selectedVibe}
              onClick={handleNext}
            >
              <span>ข้อต่อไป</span>
              <span className="icon-disc" aria-hidden="true">↗</span>
            </button>

            <p className="quiz-reassurance">
              เลือกคำที่ตรงกับความรู้สึกในใจคุณที่สุด
            </p>
          </div>
        )}

        {/* STANDARD QUESTION SLIDE */}
        {isQuestion && q && (
          <div>
            <span className="eyebrow">TAKE YOUR TIME</span>
            <h1 ref={heading} tabIndex={-1}>
              {q.text}
            </h1>

            <fieldset className="quiz-options">
              <legend className="sr-only">เลือกคำตอบที่ตรงกับคุณ</legend>
              {q.options.map((option, i) => (
                <label
                  key={option}
                  className={`quiz-option ${answers[questionIndex] === i ? "selected" : ""}`}
                >
                  <input
                    type="radio"
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
              className="button quiz-next"
              disabled={answers[questionIndex] === undefined}
              onClick={handleNext}
            >
              <span>ข้อต่อไป</span>
              <span className="icon-disc" aria-hidden="true">↗</span>
            </button>

            <p className="quiz-reassurance">
              ไม่ต้องคิดมาก เลือกแบบที่รู้สึกเป็นคุณก็พอ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
