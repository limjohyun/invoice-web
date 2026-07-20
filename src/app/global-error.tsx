'use client'

import './globals.css'

/**
 * 루트 레이아웃 자체에서 예외가 발생했을 때만 동작하는 최종 안전망.
 * 라우트 세그먼트 error.tsx들이 잡지 못하는 경우를 대비하며,
 * 루트 레이아웃을 완전히 대체하므로 자체 html/body가 필요하다(Next.js 요구사항).
 * 의존성을 최소화하기 위해 shadcn 컴포넌트 대신 기본 태그를 사용한다.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-lg font-medium">문제가 발생했습니다</p>
          <p className="text-muted-foreground text-sm">
            예상치 못한 오류로 페이지를 표시할 수 없습니다. 잠시 후 다시 시도해
            주세요.
          </p>
          <button
            onClick={reset}
            className="border-input bg-background hover:bg-accent rounded-md border px-4 py-2 text-sm font-medium"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  )
}
