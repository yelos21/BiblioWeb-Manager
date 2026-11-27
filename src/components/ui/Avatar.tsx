type AvatarProps = { iniciales: string; className?: string };

export default function Avatar({ iniciales, className = "" }: AvatarProps) {
  return (
  <span
      aria-hidden="true"
      className={
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E3EFE9] " +
        "text-xs font-semibold text-[#1D5C4B] " + className
      }
    >
      {iniciales}
    </span>
  );
}