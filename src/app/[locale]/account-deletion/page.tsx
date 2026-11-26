import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import InfoArticle from '@/components/InfoArticle';

// How to delete a PUZZLTHINK account and its data. Google Play asks apps that let people sign in for a web page like
// this (and an in-app path to it: the account menu and the footer show a link inside the Play app).
const EMAIL = 'contact@puzzlthink.com';
const COPY = {
  ko: {
    eyebrow: 'ACCOUNT', title: '계정 삭제 요청', subtitle: 'PUZZLTHINK(퍼즐띵크) 웹사이트와 Android 앱에서 쓰는 계정과 그 데이터를 삭제하는 방법이에요.',
    sections: [
      { title: '요청 방법', body: `가입할 때 쓴 Google 계정의 메일 주소로 ${EMAIL}에 메일을 보내 주세요. 제목에 '계정 삭제 요청', 본문에 PUZZLTHINK 닉네임을 적어 주시면 돼요. 앱을 다시 설치하지 않아도 이 방법으로 요청할 수 있어요.` },
      { title: '삭제되는 정보', body: '• 로그인 계정 정보(Google 계정 메일, 이름, 프로필 사진 주소)\n• 닉네임, 프로필, 아이콘·후원자 커버 등 계정에 붙은 항목\n• 게임 기록, 랭킹·명예의 전당 기록, 이용 시간\n• 라운지에 남긴 채팅 메시지' },
      { title: '처리 기간과 보관', body: '본인 확인 후 지체 없이 삭제하고, 끝나면 메일로 알려 드려요. 법령에 따라 보관해야 하는 정보가 있으면 그 기간 동안만 따로 보관한 뒤 삭제해요. 계정은 남기고 일부 데이터만 지우고 싶을 때도 같은 메일로 요청해 주세요.' },
      { title: '더 알아보기', body: '어떤 정보를 어떻게 처리하는지는 개인정보 처리방침에서 확인할 수 있어요.' },
    ],
    mail: '삭제 요청 메일 보내기',
  },
  en: {
    eyebrow: 'ACCOUNT', title: 'Delete your account', subtitle: 'How to delete the account you use on the PUZZLTHINK website and Android app, and its data.',
    sections: [
      { title: 'How to ask', body: `Email ${EMAIL} from the Google account address you signed in with. Put "Account deletion request" in the subject and your PUZZLTHINK nickname in the message. You do not need to reinstall the app to ask.` },
      { title: 'What is deleted', body: '• Sign-in details (Google account email, name, profile picture address)\n• Nickname, profile, icons, supporter cover and other items on the account\n• Game records, ranking and hall of fame entries, play time\n• Chat messages you posted in the Lounge' },
      { title: 'Timing and retention', body: 'We delete it without delay once we have confirmed it is your account, and email you when it is done. Anything the law requires us to keep is kept separately for that period only, then deleted. To delete only some data and keep the account, ask by the same email.' },
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
      <a href={`mailto:${EMAIL}?subject=${subject}`} className="mt-8 inline-flex rounded-full bg-[#17201e] px-5 py-3 text-sm font-bold text-white hover:bg-black">{c.mail}</a>
    </InfoArticle>
  );
}
