# claude-nextjs-starters

Next.js 15.5.3 + React 19 기반 모던 웹 애플리케이션 스타터 템플릿입니다. 즉시 사용 가능한 폼 패턴, 디자인 시스템, 문서화된 개발 컨벤션을 갖춘 프레임워크입니다.

## 🛠️ 핵심 기술 스택

| 기술                | 버전    | 설명                                    |
| ------------------- | ------- | --------------------------------------- |
| **Next.js**         | 15.5.3  | App Router, Turbopack 지원              |
| **React**           | 19.1.0  | 최신 기능 (use hook, Server Components) |
| **TypeScript**      | 5.x     | 엄격한 타입 안정성 (strict mode)        |
| **TailwindCSS**     | v4      | 유틸리티 기반 스타일링                  |
| **shadcn/ui**       | 최신    | Radix UI + Tailwind 기반 컴포넌트       |
| **React Hook Form** | 7.x     | 효율적인 폼 상태 관리                   |
| **Zod**             | 4.x     | TypeScript-native 검증                  |
| **Lucide Icons**    | 0.543.0 | 현대적인 SVG 아이콘                     |

## 🚀 시작하기

### 설치 및 개발 서버 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 애플리케이션을 확인할 수 있습니다.

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈페이지
│   ├── login/page.tsx     # 로그인 페이지
│   └── signup/page.tsx    # 회원가입 페이지
├── components/
│   ├── ui/                # shadcn/ui 컴포넌트
│   ├── layout/            # 레이아웃 컴포넌트 (Header, Footer)
│   ├── sections/          # 페이지 섹션 (Hero, Features, CTA)
│   ├── providers/         # Context 제공자 (ThemeProvider)
│   └── forms/             # 폼 컴포넌트 (LoginForm, SignupForm)
├── lib/
│   ├── schemas/           # Zod 검증 스키마
│   ├── utils.ts          # 유틸리티 함수
│   └── env.ts            # 환경 변수 검증
└── styles/                # 글로벌 스타일

docs/                       # 개발 가이드 문서
├── ROADMAP.md             # 개발 로드맵
├── PRD.md                 # 프로젝트 요구사항
└── guides/
    ├── project-structure.md      # 프로젝트 구조 가이드
    ├── styling-guide.md          # Tailwind CSS 가이드
    ├── component-patterns.md     # 컴포넌트 패턴 가이드
    ├── nextjs-15.md            # Next.js 15 상세 가이드
    └── forms-react-hook-form.md # React Hook Form 완전 가이드
```

자세한 구조는 [프로젝트 구조 가이드](docs/guides/project-structure.md)를 참고하세요.

## ⚡ 사용 가능한 스크립트

```bash
npm run dev          # 개발 서버 실행 (Turbopack)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint로 코드 검사
npm run lint:fix     # ESLint로 자동 수정
npm run format       # Prettier로 코드 포맷팅
npm run format:check # Prettier 포맷 확인
npm run typecheck    # TypeScript 타입 검사
npm run check-all    # 모든 검사 통과 (권장)
```

## 📚 개발 가이드 문서

다양한 주제별 상세 가이드를 제공합니다:

| 문서                                                       | 설명                            |
| ---------------------------------------------------------- | ------------------------------- |
| [🗺️ ROADMAP.md](docs/ROADMAP.md)                           | 개발 로드맵 및 진행 상황        |
| [📋 PRD.md](docs/PRD.md)                                   | 프로젝트 목표 및 범위 정의      |
| [📁 프로젝트 구조](docs/guides/project-structure.md)       | 디렉토리 구조 및 파일 조직      |
| [🎨 스타일링 가이드](docs/guides/styling-guide.md)         | Tailwind CSS + shadcn/ui 사용법 |
| [🧩 컴포넌트 패턴](docs/guides/component-patterns.md)      | 컴포넌트 작성 및 재사용 패턴    |
| [⚡ Next.js 15.5.3](docs/guides/nextjs-15.md)              | Next.js 15 최신 기능 가이드     |
| [📝 React Hook Form](docs/guides/forms-react-hook-form.md) | 폼 처리 완전 가이드             |

## 🎨 UI 컴포넌트 추가

새로운 shadcn/ui 컴포넌트를 쉽게 추가할 수 있습니다:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
```

[shadcn/ui 컴포넌트 목록](https://ui.shadcn.com/docs/components)

## 🔧 개발 환경

- **Node.js**: 24 LTS 이상
- **Package Manager**: npm (또는 yarn, pnpm)
- **에디터 권장사항**: VS Code + ESLint + Prettier 확장

## 📦 배포

Vercel에 쉽게 배포할 수 있습니다:

```bash
npm run build
```

[Vercel 배포 가이드](https://vercel.com/docs/frameworks/nextjs)

## 📄 라이센스

MIT
