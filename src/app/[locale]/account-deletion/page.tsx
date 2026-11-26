import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import InfoArticle from '@/components/InfoArticle';
import AccountDeletion from '@/components/AccountDeletion';

// 회원탈퇴: how to delete a PUZZLTHINK account and its data, with a self-service button. Google Play asks apps that let
// people sign in for a web page like this and an in-app path to it (the account menu and the footer link here).
const EMAIL = 'contact@puzzlthink.com';
const COPY = {
  ko: {
    eyebrow: 'ACCOUNT', title: '회원탈퇴 (계정 삭제)', subtitle: 'PUZZLTHINK(퍼즐띵크) 웹사이트와 Android 앱에서 쓰는 계정과 그 데이터를 삭제하는 방법이에요.',
    sections: [
      { title: '탈퇴 방법', body: `로그인한 상태로 이 페이지 아래의 '회원탈퇴' 버튼을 누르면 바로 삭제돼요(앱에서는 계정 메뉴 → 회원탈퇴). 로그인할 수 없거나 앱을 지운 뒤라면, 가입할 때 쓴 Google 계정의 메일 주소로 ${EMAIL}에 제목 '계정 삭제 요청', 본문에 PUZZLTHINK 닉네임을 적어 보내 주세요. 본인 확인 후 삭제해 드려요.` },
      { title: '삭제되는 정보', body: '• 로그인 계정 정보(Google 계정 메일, 이름, 프로필 사진 주소)\n• 닉네임, 프로필, 아이콘·말 모양·후원자 커버 등 계정에 붙은 항목\n• 게임 기록, 랭킹·명예의 전당·왕관 기록, 이용 시간, 히든 워드 기록\n• 라운지에 남긴 채팅 메시지와 신고 내역\n\n다른 플레이어와 함께 쓰는 기록은 지우지 않고 이름만 없애요: 실시간 소식에 남은 닉네임은 "탈퇴한 플레이어"로 바뀌고, 오류 제보 내용은 메일 주소와 계정 연결을 지운 채 남아요. 랭킹은 남은 기록으로 다시 계산돼서 탈퇴한 계정은 빠져요.' },
      { title: '처리 기간과 보관', body: '버튼으로 탈퇴하면 바로 삭제돼요. 메일로 요청하면 본인 확인 후 지체 없이 삭제하고, 끝나면 메일로 알려 드려요. 법령에 따라 보관해야 하는 정보가 있으면 그 기간 동안만 따로 보관한 뒤 삭제해요. 계정은 남기고 일부 데이터만 지우고 싶을 때도 같은 메일로 요청해 주세요.' },
      { title: '더 알아보기', body: '어떤 정보를 어떻게 처리하는지는 개인정보 처리방침에서 확인할 수 있어요.' },
    ],
    mail: '메일로 삭제 요청하기',
  },
  en: {
    eyebrow: 'ACCOUNT', title: 'Delete your account', subtitle: 'How to delete the account you use on the PUZZLTHINK website and Android app, and its data.',
    sections: [
      { title: 'How to delete', body: `While signed in, press "Delete my account" at the bottom of this page (in the app: account menu → Delete account); it is deleted at once. If you cannot sign in or have removed the app, email ${EMAIL} from the Google account address you signed in with, with "Account deletion request" as the subject and your PUZZLTHINK nickname in the message. We delete it once we have confirmed it is yours.` },
      { title: 'What is deleted', body: '• Sign-in details (Google account email, name, profile picture address)\n• Nickname, profile, icons, piece look, supporter cover and other items on the account\n• Game records, ranking, hall of fame and crown entries, play time, Hidden Word records\n• Chat messages and reports you posted in the Lounge\n\nRecords shared with other players are kept without your name: your nickname in the live feed becomes "탈퇴한 플레이어" (deleted player), and bug reports stay without your email or account. Rankings are recomputed from the remaining records, so the account drops out of them.' },
      { title: 'Timing and retention', body: 'The button deletes at once. By email, we delete it without delay once we have confirmed it is your account, and email you when it is done. Anything the law requires us to keep is kept separately for that period only, then deleted. To delete only some data and keep the account, ask by the same email.' },
      { title: 'More', body: 'The privacy policy explains what we collect and how we use it.' },
    ],
    mail: 'Email a deletion request',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = COPY[locale === 'en' ? 'en' : 'ko'];
  return pageMetadata({ locale, path: '/account-deletion', title: `${c.title} | PUZZLTHINK`, description: c.subtitle });
}

export default async function AccountDeletionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = COPY[locale === 'en' ? 'en' : 'ko'];
  const subject = encodeURIComponent(locale === 'en' ? 'Account deletion request' : '계정 삭제 요청');
  return (
    <InfoArticle eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} sections={[...c.sections]} accent="#4b7bff">
      <AccountDeletion />
      <a href={`mailto:${EMAIL}?subject=${subject}`} className="mt-8 inline-flex rounded-full bg-[#17201e] px-5 py-3 text-sm font-bold text-white hover:bg-black">{c.mail}</a>
    </InfoArticle>
  );
}
