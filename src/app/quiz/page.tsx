import Quiz from "@/components/quiz";
export const metadata = { title: "Find your Pawson" };
export default function Page() {
  return (
    <div className="wrap quiz-page">
      <Quiz />
    </div>
  );
}
