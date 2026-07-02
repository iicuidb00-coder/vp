# 봉교부 교회차량 운전자 벌칙제 관리 시스템

Next.js(App Router) + TypeScript + Firebase Firestore 기반 관리 웹앱입니다.

## 1. 설치

```bash
npm install
cp .env.local.example .env.local
# .env.local 에 Firebase 프로젝트 설정값 채우기
npm run dev
```

## 2. Firebase 준비
1. Firebase 콘솔에서 프로젝트 생성 후 Firestore Database 활성화
2. 웹 앱 등록 → 설정값을 `.env.local`에 채워넣기
3. `firestore.rules` 내용을 Firebase 콘솔의 Firestore 규칙에 붙여넣기 (초기에는 관리자 인증 전이라면 임시로 `allow write: if true;`로 낮춰서 테스트 가능)
4. Firestore에 아래 3개 컬렉션에 초기 데이터를 직접 입력 (또는 관리자 화면에서 추가 기능 구현):
   - `vehicles` : { name, plateNumber, department }
   - `drivers` : { name, department, phone, status: "normal", suspendedUntil: null }
   - `violations` : 위반 등록 폼을 통해 자동 생성됨

## 3. 벌칙 규정 로직
`src/lib/penaltyRules.ts` 에 원본 벌칙표(미보고건/부주의건/중대과실, 항목별 임계치, 교육/지파보고 필요 여부)가 상수로 정의되어 있습니다. 규정이 바뀌면 이 파일만 수정하면 전체 로직에 반영됩니다.

## 4. 폴더 구조
```
src/
  app/
    page.tsx            대시보드
    vehicles/            차량 목록 · 상세
    drivers/              운전자 목록 · 상세
    violations/new/       위반 등록 폼
  lib/
    types.ts             타입 정의
    penaltyRules.ts       벌칙 규정 + 자동 계산 로직
    firebase.ts           Firebase 초기화
    firestore.ts          Firestore CRUD 함수
  components/             공용 UI 컴포넌트
```

## 5. 다음 단계로 추가하면 좋은 기능
- Firebase Auth 도입 후 관리자 로그인/권한 분리
- 위반 등록 시 사진 업로드 (Firebase Storage 또는 기존 VOSS CDN 연동)
- Telegram Bot Webhook으로 정지 발생 시 관리자 알림
- 부서별/월별 통계 차트 (recharts)
- CSV 내보내기

## 6. 배포
GitHub 저장소 연결 후 Vercel에 Import → 환경변수(.env.local 내용) 등록 → 배포.
