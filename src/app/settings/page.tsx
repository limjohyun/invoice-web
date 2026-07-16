import { Metadata } from 'next'

import { SettingsForm } from '@/components/settings-form'

export const metadata: Metadata = {
  title: 'Notion 연동 설정',
  description: '청구서 발행에 사용할 Notion 워크스페이스를 연결하세요',
}

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      {/* 페이지 헤더 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Notion 연동 설정</h1>
        <p className="text-muted-foreground text-sm">
          청구서 발행에 사용할 Notion 워크스페이스와 데이터베이스를 연결하세요
        </p>
      </div>

      <SettingsForm />
    </div>
  )
}
