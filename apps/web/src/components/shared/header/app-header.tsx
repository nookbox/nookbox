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
