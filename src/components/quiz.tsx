"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { questions, calculateType, characters } from "@/lib/data";
import { CharacterImage } from "./ui";
export default function Quiz() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!started) return;
    heading.current?.focus();
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(panel.current, {
        opacity: 0,
        y: 12,
        duration: 0.4,
        clearProps: "all",
      });
    });
    return () => media.revert();
  }, [step, started]);
  function next() {
    if (answers[step] === undefined) return;
    if (step === questions.length - 1) {
      router.push(`/results/${calculateType(answers).toLowerCase()}`);
    } else setStep(step + 1);
  }
  if (!started)
    return (
      <div className="quiz-welcome">
        <div className="quiz-welcome-art">
          <CharacterImage character={characters[5]} priority />
        </div>
        <span className="eyebrow">A LITTLE SELF-DISCOVERY</span>
        <h1>
          เพื่อนตัวไหน
          <br />
          คล้ายคุณอยู่บ้างนะ?
        </h1>
        <p>
          12 คำถามสบาย ๆ ไม่มีคำตอบที่ผิด
          <br />
          เลือกสิ่งที่เป็นคุณ แล้วมาพบเพื่อนตัวน้อยกัน
        </p>
        <button className="button" onClick={() => setStarted(true)}>
          เริ่มทำแบบทดสอบ ↗
        </button>
        <span className="quiz-footnote">
          ใช้เวลาประมาณ 3 นาที · ไม่เก็บคำตอบของคุณ
        </span>
        <p className="prototype-note">
          แบบทดสอบตัวอย่างเพื่อความสนุก ไม่ใช่การประเมินบุคลิกภาพทางจิตวิทยา
        </p>
      </div>
    );
  const q = questions[step];
  return (
    <div className="quiz-panel">
      <div className="quiz-topline">
        <button
          className="text-button"
          onClick={() => (step ? setStep(step - 1) : setStarted(false))}
        >
          ← ย้อนกลับ
        </button>
        <span aria-live="polite">
          {step + 1} / {questions.length}
        </span>
      </div>
      <div
        className="quiz-progress"
        role="progressbar"
        aria-label="ความคืบหน้าแบบทดสอบ"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={step}
      >
        {questions.map((_, i) => (
          <span key={i} className={i <= step ? "done" : ""} />
        ))}
      </div>
      <div ref={panel}>
        <span className="eyebrow">TAKE YOUR TIME</span>
        <h1 ref={heading} tabIndex={-1}>
          {q.text}
        </h1>
        <fieldset className="quiz-options">
          <legend className="sr-only">เลือกคำตอบที่ตรงกับคุณ</legend>
          {q.options.map((option, i) => (
            <label
              key={option}
              className={`quiz-option ${answers[step] === i ? "selected" : ""}`}
            >
              <input
                type="radio"
                name={`question-${step}`}
                checked={answers[step] === i}
                onChange={() =>
                  setAnswers((prev) => {
                    const copy = [...prev];
                    copy[step] = i;
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
          disabled={answers[step] === undefined}
          onClick={next}
        >
          {step === questions.length - 1 ? "พบเพื่อนของคุณ" : "ข้อต่อไป"} ↗
        </button>
        <p className="quiz-reassurance">
          ไม่ต้องคิดมาก เลือกแบบที่รู้สึกเป็นคุณก็พอ
        </p>
      </div>
    </div>
  );
}
