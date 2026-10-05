import Image from "next/image";

export default function CharacterGallery({
  type,
  name,
}: {
  type: string;
  name: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="relative isolate grid aspect-square place-items-center p-4 before:pointer-events-none before:absolute before:inset-2 before:-z-1 before:rounded-full before:bg-cream before:blur-lg before:content-['']"
        >
          <Image
            src={`/characters/reference/extra/${type}-${index}.webp`}
            alt={`${name} ในอีกมุมหนึ่ง ภาพที่ ${index}`}
            width={400}
            height={400}
            sizes="(max-width: 767px) 44vw, 240px"
            className="size-full object-contain"
          />
        </div>
      ))}
    </div>
  );
}
