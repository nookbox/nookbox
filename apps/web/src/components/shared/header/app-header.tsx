// import { LoginButton } from '@/components/shared/buttons';
// import { UserNickname } from '@/components/shared/user-nickname';
// import { getMyProfile } from '@/lib/api/users';
// import Link from 'next/link';

// export async function AppHeader() {
//   // 로그아웃 상태에선 401 로 throw 되므로 catch 로 null 폴백.
//   const profile = await getMyProfile().catch(() => null);

//   return (
//     <div className='flex flex-col items-end justify-end gap-3 p-4'>
//       {profile?.nickname && (
//         <Link href='/profile'>
//           <UserNickname nickname={profile.nickname} />
//         </Link>
//       )}

//       <LoginButton />
//     </div>
//   );
// }

// 파일 전체가 주석이면 TS가 "is not a module"로 빌드를 막는다.
// 아래 한 줄이 빈 모듈임을 알려줘서 위 내용을 보존한 채 빌드를 통과시킨다.
export {};
