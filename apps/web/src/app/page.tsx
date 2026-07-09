import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ServerStatus } from '@/components/server-status';

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <Image
        src="/bg-img.png"
        alt=""
        fill
        priority
        className="object-cover opacity-20"
      />
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <Image
          src="/logo.png"
          alt="NOOKBOX"
          width={896}
          height={224}
          priority
          className="h-10 w-auto"
        />
        <p className="text-muted-foreground max-w-md text-lg">
          Next.js + NestJS 모노레포 세팅 완료
        </p>
        <Button size="lg">시작하기</Button>
        <ServerStatus />
      </div>
    </main>
  );
}
