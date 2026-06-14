프론트 작업순서
6.13
- AI : claude code , codex cli 번갈아 사용.
- 먼저 백엔드(java + springboot) 기반으로 프로젝트를 개발 할 예정인데 프론트 기술스택 추천받기
  - [skills.md](skills.md) 파일로 사용예정 스킬 저장
- 생각한 기획을 기능명세서로 추출
- 기능명세서를 바탕으로 frontend 에이전트 개발
- npm run dev로 개발된 사항 확인 (npm 설치 안되어 있다면 npm install 먼저 하기)

6.14
- 서비스 소개 README.md 작성
- 수익화 기능 추가
- 페이지 대표 색상 선정
  - 현재 프론트에서 사용하는 브랜드 색상

  색상           HEX        용도                                                                                                               
  ━━━━━━━━━━━━━  ━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━                                                                                            
  브랜드 핑크    #F6B1C1    로고, 강조, 경고 상태                                                                                              
  ─────────────  ─────────  ────────────────────────                                                                                            
  연한 핑크      #FFD6E1    보조 배경, 안내 영역                                                                                               
  ─────────────  ─────────  ────────────────────────
  크림           #FFF2E0    페이지 기본 배경                                                                                                   
  ─────────────  ─────────  ────────────────────────                                                                                            
  옐로우         #FFD94D    CTA, 가격 하락, 이벤트                                                                                             
  ─────────────  ─────────  ────────────────────────                                                                                            
  화이트         #FFFFFF    카드, 입력 영역                                                                                                    
  ─────────────  ─────────  ────────────────────────                                                                                            
  차콜           #2F2F2F    텍스트, 고대비 패널                                                                                                
  ─────────────  ─────────  ────────────────────────                                                                                            
  그레이         #BDBDBD    보조 텍스트, 경계선

  대표색은 #F6B1C1, 주요 행동 유도 색상은 #FFD94D

- 로고 추가
- 서비스 색상 변경
  -   현재 색상표는 이렇습니다.

  - --brand: #b9828f
  - --brand-dark: #514b4d
  - --brand-deep: #393536
  - --brand-soft: #eee5e7
  - --brand-glow: #e8e0d4
  - --accent: #d5c6b0
  - --alert: #a66f7c
  - --ink: #343132
  - --muted: #7d7775
  - --line: #d8d2ce
  - --soft: #efede9
  - --cream: #f7f5f1
  - --white: #ffffff     

6.15
- 배포 환경 분리 기준 정리
  - `mock.dropdealkr.com`은 목업 프론트 전용
  - `dropdealkr.com`은 실제 백엔드 연결 프론트 전용
  - 같은 Git 저장소를 사용하되 Vercel 프로젝트와 환경변수를 분리
- Vercel 설정 순서
  1. Vercel에서 프로젝트를 2개 만든다.
  2. 두 프로젝트 모두 같은 GitHub 저장소를 연결한다.
  3. 운영용 프로젝트 `Settings > Environment Variables`에 아래 값을 넣는다.
     ```env
     NEXT_PUBLIC_API_MODE=api
     NEXT_PUBLIC_API_BASE_URL=https://api.dropdealkr.com
     ```
  4. 목업용 프로젝트 `Settings > Environment Variables`에 아래 값을 넣는다.
     ```env
     NEXT_PUBLIC_API_MODE=mock
     ```
  5. 운영용 프로젝트 `Settings > Domains`에 `dropdealkr.com`을 연결한다.
  6. 목업용 프로젝트 `Settings > Domains`에 `mock.dropdealkr.com`을 연결한다.
  7. Vercel이 안내하는 DNS 레코드를 도메인 관리 콘솔에 추가한다.
- 로컬 개발 규칙
  - 프로젝트 루트에 `.env.local`을 둔다.
  - 로컬에서는 보통 아래처럼 둔다.
    ```env
    NEXT_PUBLIC_API_MODE=mock
    ```
  - `.env.local`은 Git에 커밋하지 않는다.
- 운영 원칙
  - `mock` 모드는 로컬 개발과 데모용이다.
  - `api` 모드는 운영 또는 스테이징용이다.
  - 브라우저에서 같은 URL 하나로 두 모드를 동시에 쓰는 방식은 사용하지 않는다.
