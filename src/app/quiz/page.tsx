import Quiz from "@/components/quiz";
export const metadata = { title: "Find your Pawson" };
export default function Page() {
  return (
    <div className="wrap min-h-[75vh] pt-10 pb-20">
      <Quiz />
    </div>
  );
}
