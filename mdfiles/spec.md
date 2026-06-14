# 프로젝트 기능 명세서: 실시간 가격 하락 공동구매 커머스 플랫폼

## 1. 프로젝트 개요

실시간 공동구매 커머스 플랫폼을 만든다.

핵심 컨셉은 다음과 같다.

사용자가 상품 공동구매에 참여할수록 상품 가격이 실시간으로 내려간다.
모든 참여자는 공동구매 종료 시점의 최종 가격으로 구매하게 되며, 먼저 참여해서 더 높은 가격으로 결제한 사용자는 종료 후 차액을 자동 환불받는다.

일부 상품은 `재고떨이 상품`으로 분류된다.
재고떨이 상품은 일반 상품보다 더 큰 할인율이 적용될 수 있고, 특정 조건을 만족하면 참여자 중 랜덤 5%에게 다음 구매에 사용할 수 있는 50% 할인 쿠폰을 지급한다.

이 서비스는 일반 쇼핑몰이 아니라, 다음 요소를 강조해야 한다.

* 실시간 가격 하락
* 공동구매 참여 현황
* 상품별 실시간 참여 피드
* 상품별 리액션 응원
* 판매자 Q&A
* 구매 후기
* 선결제 후 최종가 기준 차액 환불
* 재고떨이 상품 전용 랜덤 쿠폰 이벤트

현재는 프론트엔드 화면을 먼저 만든다.
백엔드는 추후 Spring Boot(Java)로 직접 구현할 예정이므로, 프론트는 mock data와 mock API 형태로 작성한다.

---

## 2. 기술 스택

다음 기술을 기준으로 프론트엔드를 구현한다.

* Next.js
* TypeScript
* Tailwind CSS
* App Router 구조
* React Hooks
* mock API 함수
* mock WebSocket 또는 setInterval 기반 fake realtime update
* 상태 관리는 우선 React state / Context 정도로 단순하게 구성한다.

디자인은 너무 화려하지 않게 하되, 실제 서비스처럼 보여야 한다.

톤은 다음과 같다.

* 커머스 서비스 느낌
* 실시간 공동구매 특유의 긴장감
* 가격이 떨어지는 재미
* 신뢰감 있는 결제/환불 안내
* 모바일에서도 사용 가능한 반응형 UI

---

## 3. 서비스 이름

임시 서비스명은 다음 중 하나를 사용한다.

* DropDeal
* 같이내림
* DownBuy
* 모이면싸다

우선 화면에서는 `DropDeal`을 사용한다.

---

## 4. 핵심 도메인 개념

### 4.1 상품

상품은 공동구매 단위로 판매된다.

상품은 다음 속성을 가진다.

```ts
type ProductType = "NORMAL" | "CLEARANCE";

type ProductStatus =
  | "SCHEDULED"
  | "OPEN"
  | "SOLD_OUT"
  | "CLOSED"
  | "FAILED";

type Product = {
  id: number;
  name: string;
  description: string;
  thumbnailUrl: string;
  imageUrls: string[];

  sellerName: string;
  sellerProfileImageUrl?: string;

  type: ProductType;
  status: ProductStatus;

  originalPrice: number;
  startPrice: number;
  currentPrice: number;
  finalPrice?: number;

  minPrice: number;
  maxDiscountRate: number;

  discountStepParticipants: number;
  discountStepAmount: number;

  minParticipants: number;
  currentParticipants: number;
  maxParticipants: number;

  stockQuantity: number;
  remainingStock: number;

  startAt: string;
  endAt: string;

  isCouponEventEnabled: boolean;
  couponEvent?: CouponEventPolicy;

  reactionSummary: ReactionSummary;
  qnaCount: number;
  reviewCount: number;
  ratingAverage: number;
};
```

---

### 4.2 가격 정책

상품 가격은 참여자가 늘어날수록 내려간다.

기본 가격 계산 방식은 다음과 같다.

```ts
currentPrice =
  max(
    effectiveMinPrice,
    startPrice - floor(currentParticipants / discountStepParticipants) * discountStepAmount
  )
```

`effectiveMinPrice`는 다음 둘 중 더 높은 값으로 한다.

```ts
effectiveMinPrice = max(
  minPrice,
  originalPrice * (1 - maxDiscountRate / 100)
)
```

예시:

```txt
정가: 30,000원
공동구매 시작가: 27,000원
최저 판매가: 18,000원
최대 할인율: 40%
5명 참여마다 1,000원 할인
최대 참여 가능 인원: 50명
```

화면에는 다음 정보를 반드시 보여준다.

* 정가
* 현재 공동구매가
* 현재 할인율
* 최저 가능 가격
* 다음 가격 하락까지 남은 참여자 수
* 현재 참여자 수
* 최대 참여자 수
* 남은 재고
* 마감까지 남은 시간

---

### 4.3 결제 구조

결제 구조는 `참여 시 선결제, 종료 후 차액 환불` 방식이다.

사용자가 공동구매에 참여하면 현재 가격으로 결제한다.

공동구매 종료 후 최종 가격이 확정된다.

최종 가격이 사용자가 결제한 가격보다 낮으면 차액을 환불한다.

예시:

```txt
A 사용자 참여 시점 가격: 25,000원
B 사용자 참여 시점 가격: 23,000원
공동구매 종료 후 최종 가격: 20,000원

A 사용자 환불액: 5,000원
B 사용자 환불액: 3,000원
```

화면에서는 결제 전 반드시 다음 문구를 보여준다.

```txt
공동구매 종료 후 최종 가격이 더 낮아지면 차액은 자동 환불됩니다.
```

공동구매가 최소 참여 인원을 달성하지 못하면 공동구매는 실패 처리되고 전액 환불된다.

---

### 4.4 재고 제한

MVP에서는 한 사용자가 한 상품에 1개만 참여할 수 있다고 가정한다.

참여 가능 인원은 다음 값을 넘을 수 없다.

```ts
maxParticipants <= stockQuantity
```

화면에서는 다음 상태를 구분해서 보여준다.

* 참여 가능
* 마감 임박
* 재고 임박
* 품절
* 공동구매 종료
* 최소 인원 미달로 실패

---

### 4.5 재고떨이 상품

재고떨이 상품은 `type = CLEARANCE`로 표시한다.

재고떨이 상품은 일반 상품보다 더 높은 할인율을 허용할 수 있다.

예시:

```txt
일반 상품 최대 할인율: 30~40%
재고떨이 상품 최대 할인율: 50~80%
```

재고떨이 상품 카드에는 다음 배지를 표시한다.

```txt
재고떨이
최대 70% 할인
랜덤 쿠폰 이벤트
```

---

### 4.6 랜덤 50% 할인 쿠폰 이벤트

일부 재고떨이 상품은 랜덤 쿠폰 이벤트를 가진다.

조건:

* 상품 타입이 `CLEARANCE`
* `isCouponEventEnabled = true`
* 공동구매가 성공적으로 종료됨
* 최종 참여자 수가 쿠폰 이벤트 최소 기준을 만족함

쿠폰 당첨 대상:

```ts
winnerCount = floor(finalParticipants * 0.05)
```

단, 참여자가 충분히 많고 이벤트 조건을 만족하면 최소 1명은 당첨될 수 있다.

쿠폰은 현재 구매에 즉시 적용하는 것이 아니라, 다음 구매에 사용할 수 있는 50% 할인 쿠폰으로 지급한다.

이유:

* 현재 주문의 결제/환불 구조를 지나치게 복잡하게 만들지 않기 위해
* MVP에서 구현 난이도를 낮추기 위해
* 추후 백엔드에서 쿠폰 정책을 독립적으로 관리하기 위해

쿠폰 이벤트 정책 타입:

```ts
type CouponEventPolicy = {
  enabled: boolean;
  minParticipantsForDraw: number;
  winnerRate: number; // 0.05
  discountRate: number; // 50
  couponValidDays: number;
  description: string;
};
```

상품 상세 페이지에는 다음 정보를 표시한다.

```txt
이 상품은 랜덤 쿠폰 이벤트 대상입니다.
공동구매 성공 시 참여자 중 5%에게 다음 구매 50% 할인 쿠폰을 지급합니다.
```

당첨자는 마이페이지의 쿠폰함에서 확인할 수 있다.

---

## 5. 주요 페이지

다음 페이지를 구현한다.

```txt
/
홈

/products
상품 목록

/products/[id]
상품 상세

/products/[id]/checkout
공동구매 참여 및 결제 페이지

/payment/success
결제 성공 페이지

/payment/fail
결제 실패 페이지

/mypage/orders
내 공동구매 참여 내역

/mypage/coupons
내 쿠폰함

/seller/products/new
판매자 상품 등록 페이지

/seller/products
판매자 상품 관리 페이지
```

---

## 6. 홈 페이지

경로:

```txt
/
```

홈 페이지 목적:

* 서비스의 핵심 컨셉을 한눈에 보여준다.
* 현재 진행 중인 공동구매 상품을 노출한다.
* 실시간 가격 하락의 재미를 전달한다.

### 6.1 홈 페이지 섹션

#### 1. Hero Section

문구 예시:

```txt
모이면 가격이 내려갑니다
실시간으로 싸지는 공동구매, DropDeal
```

서브 문구:

```txt
참여자가 늘어날수록 모두의 가격이 내려가고,
최종가보다 비싸게 결제한 금액은 자동 환불됩니다.
```

CTA 버튼:

```txt
진행 중인 공동구매 보기
재고떨이 특가 보기
```

#### 2. 실시간 가격 하락 상품 섹션

카드 형태로 상품을 보여준다.

각 카드에는 다음 요소를 표시한다.

* 상품 이미지
* 상품명
* 판매자명
* 정가
* 현재가
* 현재 할인율
* 다음 가격 하락까지 남은 인원
* 현재 참여자 / 최대 참여자
* 남은 시간
* 상품 타입 배지
* 쿠폰 이벤트 배지

#### 3. 재고떨이 특가 섹션

`type = CLEARANCE`인 상품만 노출한다.

강조 문구:

```txt
재고가 많을수록 할인은 더 커집니다
```

#### 4. 사용 방법 섹션

3단계로 설명한다.

```txt
1. 공동구매 참여
2. 사람이 모일수록 가격 하락
3. 종료 후 최종가 확정 & 차액 자동 환불
```

#### 5. 신뢰 안내 섹션

```txt
먼저 참여해도 손해 보지 않습니다.
최종 가격이 더 내려가면 차액은 자동 환불됩니다.
```

---

## 7. 상품 목록 페이지

경로:

```txt
/products
```

### 7.1 기능

상품 목록 페이지에서는 사용자가 공동구매 상품을 탐색할 수 있다.

필터:

* 전체
* 일반 공동구매
* 재고떨이
* 쿠폰 이벤트
* 마감 임박
* 가격 많이 내려간 상품
* 참여자 많은 상품

정렬:

* 마감 임박순
* 할인율 높은순
* 참여자 많은순
* 최신 등록순
* 가격 낮은순

검색:

* 상품명 검색
* 판매자명 검색

### 7.2 상품 카드 UI

각 상품 카드는 다음 정보를 표시한다.

```txt
[상품 이미지]
[재고떨이] [쿠폰 이벤트]
상품명
판매자명

정가 30,000원
현재가 21,000원
현재 30% 할인

27명 참여 중 / 최대 50명
다음 가격 하락까지 3명
남은 재고 23개
마감까지 02:14:33

[공동구매 참여하기]
```

상태별 버튼:

```txt
OPEN: 공동구매 참여하기
SOLD_OUT: 품절
CLOSED: 종료됨
FAILED: 공동구매 실패
SCHEDULED: 오픈 예정
```

---

## 8. 상품 상세 페이지

경로:

```txt
/products/[id]
```

상품 상세 페이지가 가장 중요하다.

이 페이지에서 다음 요소를 강하게 보여줘야 한다.

* 실시간 가격 하락
* 참여자 증가
* 다음 할인 조건
* 실시간 참여 피드
* 리액션 응원
* Q&A
* 구매 후기

---

### 8.1 상품 상단 영역

표시 요소:

* 상품 이미지 갤러리
* 상품명
* 판매자명
* 상품 타입 배지
* 쿠폰 이벤트 배지
* 정가
* 현재 공동구매가
* 현재 할인율
* 최저 가능 가격
* 마감까지 남은 시간
* 현재 참여자 수
* 최대 참여자 수
* 남은 재고

CTA 버튼:

```txt
공동구매 참여하기
```

버튼 아래 안내 문구:

```txt
지금 참여해도 최종 가격이 더 내려가면 차액은 자동 환불됩니다.
```

---

### 8.2 가격 하락 진행 영역

가격이 어떻게 내려가는지 시각적으로 보여준다.

구성:

```txt
현재 가격: 24,000원
다음 가격: 23,000원
3명만 더 참여하면 가격이 내려갑니다.
```

프로그레스 바:

```txt
현재 단계 참여자 7 / 10명
```

가격 단계 예시:

```txt
0명: 27,000원
5명: 26,000원
10명: 25,000원
15명: 24,000원
20명: 23,000원
...
최저가: 18,000원
```

---

### 8.3 실시간 참여 피드

일반 채팅 대신 시스템 피드를 보여준다.

목적:

* 상품 페이지에 실시간 생동감을 준다.
* 자유 채팅의 선동, 악성 댓글, 허위 정보 문제를 줄인다.
* WebSocket 이벤트 학습용 구조로 사용한다.

피드 예시:

```txt
방금 1명이 공동구매에 참여했어요.
현재 가격이 24,000원으로 내려갔어요.
다음 가격 하락까지 3명 남았어요.
🔥 12명이 같이 사요를 눌렀어요.
마감까지 10분 남았어요.
재고가 5개 남았어요.
공동구매가 성공 조건을 달성했어요.
```

피드 타입:

```ts
type FeedType =
  | "PARTICIPATION"
  | "PRICE_DROPPED"
  | "NEXT_DISCOUNT_NEAR"
  | "REACTION"
  | "STOCK_LOW"
  | "TIME_LOW"
  | "GOAL_REACHED"
  | "COUPON_EVENT";

type ProductFeed = {
  id: number;
  productId: number;
  type: FeedType;
  message: string;
  createdAt: string;
};
```

피드는 최신순 또는 시간순으로 보여준다.

UI는 채팅창처럼 보이되, 사용자가 자유롭게 글을 입력할 수는 없다.

---

### 8.4 상품별 리액션 응원

사용자가 상품에 대해 정해진 리액션만 보낼 수 있다.

자유 채팅 대신 다음 리액션 버튼을 제공한다.

```txt
🔥 같이 사요
💸 더 내려가자
⏰ 마감 임박
👀 고민 중
🎉 가격 좋다
📦 재고 털자
```

각 리액션은 실시간 카운트로 표시된다.

예시:

```txt
🔥 같이 사요 24
💸 더 내려가자 18
⏰ 마감 임박 7
```

리액션 정책:

* 로그인한 사용자는 같은 상품에서 같은 리액션을 여러 번 누를 수 없다.
* 다른 리액션으로 변경은 가능하다.
* mock 구현에서는 로그인 상태를 가정한다.
* 리액션을 누르면 실시간 피드에 시스템 메시지가 추가된다.

예시:

```txt
🔥 1명이 같이 사요를 눌렀어요.
```

리액션 타입:

```ts
type ReactionType =
  | "JOIN_TOGETHER"
  | "DROP_MORE"
  | "CLOSING_SOON"
  | "THINKING"
  | "GOOD_PRICE"
  | "CLEAR_STOCK";

type ReactionSummary = {
  JOIN_TOGETHER: number;
  DROP_MORE: number;
  CLOSING_SOON: number;
  THINKING: number;
  GOOD_PRICE: number;
  CLEAR_STOCK: number;
};
```

---

### 8.5 판매자 Q&A

상품별 Q&A 영역을 만든다.

사용자는 판매자에게 질문할 수 있고, 판매자는 답변할 수 있다.

MVP 프론트에서는 mock 데이터로 질문/답변을 보여준다.

Q&A 예시:

```txt
Q. 유통기한이 언제까지인가요?
A. 2026년 8월 30일까지입니다.

Q. 배송은 언제 시작되나요?
A. 공동구매 종료 다음 날부터 순차 발송됩니다.
```

Q&A 타입:

```ts
type ProductQuestion = {
  id: number;
  productId: number;
  userNickname: string;
  question: string;
  answer?: string;
  status: "WAITING" | "ANSWERED";
  createdAt: string;
  answeredAt?: string;
};
```

Q&A 기능:

* 질문 작성
* 답변 완료/미답변 상태 표시
* 최신순 정렬
* 답변된 질문만 보기
* 내 질문 보기

질문 작성 제한:

* 최대 300자
* 빈 문자열 작성 불가
* 욕설 필터링은 추후 백엔드에서 처리 예정이라는 주석만 남긴다.

---

### 8.6 구매 후기

자유 댓글 대신 구매 후기를 둔다.

후기는 실제 구매 완료 사용자만 작성할 수 있다는 전제로 UI를 구성한다.

MVP에서는 mock 데이터로 표시한다.

후기 타입:

```ts
type ProductReview = {
  id: number;
  productId: number;
  userNickname: string;
  rating: number;
  content: string;
  imageUrls?: string[];
  createdAt: string;
};
```

후기 UI:

* 별점
* 작성자 닉네임
* 작성일
* 후기 내용
* 후기 이미지
* 평균 별점
* 후기 개수

후기 작성 버튼은 다음 조건에 따라 보여준다.

```txt
구매 이력이 있으면: 후기 작성하기
구매 이력이 없으면: 구매자만 후기를 작성할 수 있습니다.
```

---

### 8.7 쿠폰 이벤트 영역

재고떨이 상품이고 쿠폰 이벤트가 활성화된 경우 표시한다.

문구 예시:

```txt
랜덤 쿠폰 이벤트 진행 중
공동구매 성공 시 참여자 중 5%에게 다음 구매 50% 할인 쿠폰을 지급합니다.
```

조건 표시:

```txt
쿠폰 추첨 조건
- 공동구매 성공
- 최소 30명 이상 참여
- 이벤트 종료 후 자동 추첨
```

참여자가 조건에 가까워지면 다음 문구를 표시한다.

```txt
쿠폰 추첨 조건까지 4명 남았어요.
```

---

## 9. 공동구매 참여 및 결제 페이지

경로:

```txt
/products/[id]/checkout
```

이 페이지는 실제 결제 전 확인 페이지다.

### 9.1 표시 정보

* 상품명
* 상품 이미지
* 현재 공동구매 가격
* 정가
* 현재 할인율
* 예상 결제 금액
* 최종 가격 하락 시 환불 안내
* 남은 재고
* 마감 시간
* 쿠폰 이벤트 대상 여부

### 9.2 결제 안내 문구

반드시 표시한다.

```txt
현재 가격으로 먼저 결제됩니다.
공동구매 종료 후 최종 가격이 더 낮아지면 차액은 자동 환불됩니다.
최소 참여 인원을 달성하지 못하면 결제 금액은 전액 환불됩니다.
```

### 9.3 결제 버튼

버튼 텍스트:

```txt
현재가로 참여하고 결제하기
```

mock 결제 처리:

* 버튼 클릭 시 1초 로딩
* 성공/실패를 랜덤 또는 고정 mock으로 처리
* 성공하면 `/payment/success`로 이동
* 실패하면 `/payment/fail`로 이동

---

## 10. 결제 성공 페이지

경로:

```txt
/payment/success
```

표시 내용:

```txt
공동구매 참여가 완료되었습니다.
최종 가격이 더 내려가면 차액은 자동 환불됩니다.
```

상세 정보:

* 주문 번호
* 상품명
* 결제 가격
* 현재 공동구매 가격
* 마감 시간
* 예상 환불 안내

버튼:

```txt
상품 상세로 돌아가기
내 참여 내역 보기
```

---

## 11. 결제 실패 페이지

경로:

```txt
/payment/fail
```

표시 내용:

```txt
결제가 완료되지 않았습니다.
결제 수단을 확인한 뒤 다시 시도해주세요.
```

버튼:

```txt
다시 결제하기
상품 상세로 돌아가기
```

---

## 12. 마이페이지 - 내 공동구매 참여 내역

경로:

```txt
/mypage/orders
```

### 12.1 표시 상태

주문 상태:

```ts
type OrderStatus =
  | "PAID"
  | "GROUP_BUYING"
  | "CONFIRMED"
  | "PARTIAL_REFUNDED"
  | "FULL_REFUNDED"
  | "FAILED"
  | "SHIPPING"
  | "DELIVERED";
```

표시 예시:

```txt
상품명: 제주 감귤 5kg
결제 금액: 24,000원
최종 확정가: 21,000원
환불 예정 금액: 3,000원
상태: 공동구매 진행 중
```

공동구매 종료 후:

```txt
차액 환불 완료
환불 금액: 3,000원
```

공동구매 실패 시:

```txt
최소 참여 인원을 달성하지 못해 전액 환불되었습니다.
```

---

## 13. 마이페이지 - 쿠폰함

경로:

```txt
/mypage/coupons
```

### 13.1 쿠폰 타입

```ts
type Coupon = {
  id: number;
  name: string;
  discountRate: number;
  status: "AVAILABLE" | "USED" | "EXPIRED";
  issuedAt: string;
  expiredAt: string;
  sourceProductName?: string;
};
```

### 13.2 쿠폰 카드 UI

표시 예시:

```txt
50% 할인 쿠폰
재고떨이 랜덤 이벤트 당첨
사용 기한: 2026.08.31까지
상태: 사용 가능
```

상태별 UI:

```txt
AVAILABLE: 사용 가능
USED: 사용 완료
EXPIRED: 만료됨
```

---

## 14. 판매자 상품 등록 페이지

경로:

```txt
/seller/products/new
```

판매자가 공동구매 상품을 등록하는 화면이다.

백엔드는 아직 없으므로 입력 후 mock으로 상품이 등록된 것처럼 처리한다.

### 14.1 입력 필드

기본 정보:

* 상품명
* 상품 설명
* 상품 이미지 URL
* 판매자명
* 상품 타입

    * 일반 공동구매
    * 재고떨이 상품

가격 정책:

* 정가
* 공동구매 시작가
* 최저 판매가
* 최대 할인율
* 몇 명마다 가격을 내릴지
* 한 단계당 할인 금액

참여/재고 정책:

* 최소 참여 인원
* 최대 참여 인원
* 총 재고 수량
* 공동구매 시작 시간
* 공동구매 종료 시간

쿠폰 이벤트:

* 쿠폰 이벤트 사용 여부
* 쿠폰 추첨 최소 참여 인원
* 당첨 비율
* 쿠폰 할인율
* 쿠폰 유효 기간

### 14.2 가격 정책 미리보기

판매자가 값을 입력하면 오른쪽에 가격 단계 미리보기를 보여준다.

예시:

```txt
0명 참여: 27,000원
5명 참여: 26,000원
10명 참여: 25,000원
15명 참여: 24,000원
...
최저가: 18,000원
```

### 14.3 유효성 검사

* 정가는 0보다 커야 한다.
* 시작가는 정가보다 높을 수 없다.
* 최저가는 시작가보다 높을 수 없다.
* 최대 할인율은 0~90 사이여야 한다.
* 최대 참여 인원은 재고 수량보다 클 수 없다.
* 최소 참여 인원은 최대 참여 인원보다 클 수 없다.
* 가격 하락 단위 인원은 1 이상이어야 한다.
* 가격 하락 금액은 1 이상이어야 한다.
* 재고떨이 상품이 아닌 경우 쿠폰 이벤트는 비활성화하는 것을 기본값으로 한다.

---

## 15. 판매자 상품 관리 페이지

경로:

```txt
/seller/products
```

판매자가 등록한 상품 목록을 관리한다.

표시 정보:

* 상품명
* 상태
* 현재 참여자 수
* 현재 가격
* 최종 가격
* 남은 재고
* 마감 시간
* Q&A 미답변 개수
* 쿠폰 이벤트 여부

버튼:

```txt
상세 보기
Q&A 답변하기
판매 종료
```

---

## 16. 실시간 이벤트 설계

백엔드 WebSocket 구현을 고려해 프론트에서는 다음 이벤트 구조를 가정한다.

현재는 mock WebSocket 또는 setInterval로 흉내 낸다.

```ts
type RealtimeEvent =
  | ProductPriceUpdatedEvent
  | ProductParticipationCreatedEvent
  | ProductReactionUpdatedEvent
  | ProductFeedCreatedEvent
  | ProductStatusChangedEvent
  | CouponEventUpdatedEvent;

type ProductPriceUpdatedEvent = {
  type: "PRODUCT_PRICE_UPDATED";
  productId: number;
  currentParticipants: number;
  currentPrice: number;
  nextDiscountParticipantsLeft: number;
  remainingStock: number;
};

type ProductParticipationCreatedEvent = {
  type: "PRODUCT_PARTICIPATION_CREATED";
  productId: number;
  nicknameMasked: string;
  currentParticipants: number;
  createdAt: string;
};

type ProductReactionUpdatedEvent = {
  type: "PRODUCT_REACTION_UPDATED";
  productId: number;
  reactionSummary: ReactionSummary;
};

type ProductFeedCreatedEvent = {
  type: "PRODUCT_FEED_CREATED";
  productId: number;
  feed: ProductFeed;
};

type ProductStatusChangedEvent = {
  type: "PRODUCT_STATUS_CHANGED";
  productId: number;
  status: ProductStatus;
};

type CouponEventUpdatedEvent = {
  type: "COUPON_EVENT_UPDATED";
  productId: number;
  message: string;
};
```

상품 상세 페이지는 위 이벤트를 받으면 화면을 즉시 갱신해야 한다.

갱신 대상:

* 현재 가격
* 참여자 수
* 남은 재고
* 다음 가격 하락까지 남은 인원
* 실시간 피드
* 리액션 카운트
* 상품 상태

---

## 17. Mock 데이터 요구사항

최소 8개 이상의 상품 mock 데이터를 만든다.

상품 구성:

* 일반 공동구매 상품 4개
* 재고떨이 상품 4개
* 쿠폰 이벤트 상품 최소 2개
* 마감 임박 상품 최소 2개
* 품절 상품 최소 1개
* 공동구매 성공 임박 상품 최소 1개

상품 예시:

```txt
1. 제주 감귤 5kg
2. 프리미엄 원두 1kg
3. 단백질 쉐이크 박스
4. 캠핑용 랜턴
5. 유통기한 임박 그래놀라 세트
6. 재고 과다 수건 세트
7. 못난이 사과 박스
8. 시즌오프 반팔 티셔츠
```

---

## 18. 공통 UI 컴포넌트

다음 컴포넌트를 분리해서 작성한다.

```txt
ProductCard
PriceDropProgress
CountdownTimer
ParticipantProgress
ReactionBar
ProductFeedPanel
QnaSection
ReviewSection
CouponEventBox
CheckoutSummary
OrderStatusBadge
ProductStatusBadge
SellerProductForm
PricePolicyPreview
```

---

## 19. 화면에서 강조해야 할 핵심 문구

서비스 곳곳에서 다음 메시지를 사용한다.

```txt
모이면 가격이 내려갑니다.
먼저 참여해도 손해 보지 않습니다.
최종가가 더 내려가면 차액은 자동 환불됩니다.
다음 가격 하락까지 3명 남았어요.
재고떨이 상품은 더 큰 할인이 적용될 수 있습니다.
공동구매 성공 시 랜덤 쿠폰 이벤트가 진행됩니다.
```

---

## 20. 구현 우선순위

1단계:

* 홈
* 상품 목록
* 상품 상세
* 가격 하락 UI
* 실시간 피드 mock
* 리액션 mock

2단계:

* checkout 페이지
* 결제 성공/실패 페이지
* 마이페이지 주문 내역
* 쿠폰함

3단계:

* 판매자 상품 등록
* 가격 정책 미리보기
* 판매자 상품 관리

4단계:

* mock WebSocket 구조 정리
* API 교체를 고려한 service layer 분리

---

## 21. 폴더 구조 예시

```txt
src/
  app/
    page.tsx
    products/
      page.tsx
      [id]/
        page.tsx
        checkout/
          page.tsx
    payment/
      success/
        page.tsx
      fail/
        page.tsx
    mypage/
      orders/
        page.tsx
      coupons/
        page.tsx
    seller/
      products/
        page.tsx
        new/
          page.tsx

  components/
    product/
      ProductCard.tsx
      PriceDropProgress.tsx
      ParticipantProgress.tsx
      ProductFeedPanel.tsx
      ReactionBar.tsx
      QnaSection.tsx
      ReviewSection.tsx
      CouponEventBox.tsx
    checkout/
      CheckoutSummary.tsx
    seller/
      SellerProductForm.tsx
      PricePolicyPreview.tsx
    common/
      CountdownTimer.tsx
      ProductStatusBadge.tsx
      OrderStatusBadge.tsx

  mocks/
    products.ts
    orders.ts
    coupons.ts
    feeds.ts
    qna.ts
    reviews.ts

  services/
    productService.ts
    orderService.ts
    couponService.ts
    realtimeService.ts

  types/
    product.ts
    order.ts
    coupon.ts
    realtime.ts

  utils/
    price.ts
    format.ts
    date.ts
```

---

## 22. 중요한 구현 방향

프론트 코드는 나중에 Spring Boot 백엔드 API로 교체하기 쉽게 작성한다.

따라서 컴포넌트 안에서 mock 데이터를 직접 import하지 말고, 가능하면 service 함수를 통해 데이터를 가져오도록 한다.

예시:

```ts
const product = await productService.getProductById(id);
```

현재는 service 함수 내부에서 mock 데이터를 반환하면 된다.

추후 백엔드 연동 시 service 함수 내부만 fetch/axios로 교체할 수 있게 만든다.

---

## 23. 최종 목표

완성된 프론트 화면은 다음을 명확하게 보여줘야 한다.

* 이 서비스가 일반 쇼핑몰이 아니라는 점
* 참여자가 늘수록 가격이 실시간으로 떨어진다는 점
* 먼저 결제해도 최종가 기준으로 차액 환불된다는 점
* 상품별 자유 채팅 대신 리액션과 실시간 시스템 피드를 사용한다는 점
* 재고떨이 상품은 더 큰 할인과 랜덤 쿠폰 이벤트가 있다는 점
* 추후 Spring Boot 백엔드와 연동하기 쉬운 구조라는 점

우선 mock 데이터 기반으로 실제 서비스처럼 보이는 프론트 페이지를 완성해라.

---

## 24. 수익화 및 판매자 정산 설계

DropDeal의 기본 수익 모델은 판매자에게 받는 `거래 중개수수료`로 한다.

구매자에게 별도 이용료를 부과하지 않는다.
구매자 이용료는 가격이 내려간다는 서비스 핵심 메시지와 충돌하고 구매 전환율을 낮출 수 있기 때문이다.

플랫폼은 공동구매가 성공하고 최종 판매 가격이 확정된 주문에 대해서만 중개수수료를 받는다.

---

### 24.1 핵심 수익 모델

상품 유형별 기본 중개수수료율은 다음과 같이 가정한다.

```txt
모든 상품: 최종 판매금액의 10%
```

플랫폼 중개수수료율은 상품 유형과 판매자에 관계없이 10%로 고정한다.
판매자는 상품 등록 화면에서 수수료율을 수정할 수 없다.

수수료는 사용자가 처음 결제한 가격이 아니라, 공동구매 종료 후 차액 환불이 반영된 `최종 판매금액`을 기준으로 계산한다.

```ts
grossAmount = finalPrice * quantity;
platformFee = floor(grossAmount * commissionRate);

sellerSettlementAmount =
  grossAmount
  - platformFee
  - sellerPgFee
  - sellerDiscountShare
  - additionalFee;
```

예시:

```txt
구매자 최초 결제금액: 30,000원
공동구매 최종 가격: 24,000원
구매자 차액 환불액: 6,000원

최종 판매금액: 24,000원
플랫폼 중개수수료율: 10%
플랫폼 중개수수료: 2,400원
판매자 정산 기준금액: 21,600원 - 판매자 부담 비용
```

공동구매가 실패하거나 주문이 전액 취소된 경우에는 중개수수료를 부과하지 않는다.

---

### 24.2 추가 수익 모델

거래 중개수수료 외 수익 모델은 거래량과 판매자 수가 충분히 확보된 후 단계적으로 도입한다.

```txt
판매자 구독제
- 고급 매출 통계
- 자동 가격 정책 추천
- 정산 리포트 및 CSV 다운로드
- 판매자 전용 프로모션 도구

상품 노출 광고
- 홈 추천 상품
- 검색 결과 상단 노출
- 재고떨이 특가 영역 우선 노출

쿠폰 비용 분담
- 플랫폼과 판매자가 쿠폰 할인 금액을 비율로 분담

물류 및 포장 수수료
- 제휴 물류 서비스 사용 시 주문 건별 수수료 부과

성공 보너스 수수료
- 목표 참여 인원을 크게 초과한 공동구매에 추가 성과 수수료 부과
```

MVP에서는 거래 중개수수료만 구현한다.

---

### 24.3 결제·환불·정산 원칙

플랫폼이 판매대금을 직접 보관하고 판매자에게 수동 송금하지 않는다.

초기 서비스에서는 PG사의 결제 기능과 파트너 정산 또는 지급대행 서비스를 사용한다.
이를 통해 구매자 결제, 부분 취소, 판매자별 정산, 지급 내역을 관리한다.

기본 처리 흐름:

```txt
1. 구매자가 현재 공동구매 가격으로 결제한다.
2. PG 결제 완료 웹훅을 검증한 후 주문 참여를 확정한다.
3. 공동구매가 종료되면 최종 가격을 확정한다.
4. 최초 결제금액과 최종 금액의 차이를 부분 환불한다.
5. 배송과 반품 가능 기간이 종료될 때까지 판매자 정산을 보류한다.
6. 최종 판매금액에서 플랫폼 수수료와 판매자 부담 비용을 차감한다.
7. PG 파트너 정산 또는 지급대행을 통해 판매자에게 지급한다.
```

공동구매 실패 시:

```txt
1. 공동구매 상태를 FAILED로 변경한다.
2. 모든 주문을 전액 환불한다.
3. 플랫폼 수수료를 0원으로 처리한다.
4. 판매자 정산을 생성하지 않거나 취소 상태로 처리한다.
```

---

### 24.4 주문 금액 구성

각 주문은 결제금액, 최종금액, 환불금액, 플랫폼 수수료를 구분해서 저장해야 한다.

```ts
type OrderMoney = {
  paidAmount: number;
  finalAmount?: number;
  refundAmount: number;

  platformFee: number;
  pgFee: number;
  sellerDiscountShare: number;
  platformDiscountShare: number;

  sellerSettlementAmount: number;
};
```

계산 규칙:

```ts
refundAmount = paidAmount - finalAmount;

platformFee = floor(finalAmount * commissionRate);

sellerSettlementAmount =
  finalAmount
  - platformFee
  - pgFee
  - sellerDiscountShare;
```

금액 계산은 프론트엔드 값에 의존하지 않고 반드시 백엔드에서 수행한다.

---

### 24.5 판매자 수수료 정책

플랫폼 전체에 고정 수수료 정책을 적용한다.

```ts
const PLATFORM_COMMISSION_RATE = 0.1;
```

주문이 생성되면 당시 적용된 수수료율을 주문에 복사해서 저장한다.
이후 정책이 변경되어도 기존 주문의 수수료가 바뀌면 안 된다.

---

### 24.6 판매자 정산 상태

```ts
type SettlementStatus =
  | "PENDING"
  | "CALCULATED"
  | "ON_HOLD"
  | "READY"
  | "REQUESTED"
  | "PAID"
  | "FAILED"
  | "CANCELED";
```

상태 설명:

```txt
PENDING: 공동구매 또는 주문이 아직 종료되지 않음
CALCULATED: 최종 가격과 수수료 계산 완료
ON_HOLD: 배송, 반품, 분쟁 등의 사유로 정산 보류
READY: 판매자 지급 가능
REQUESTED: 지급대행 서비스에 이체 요청 완료
PAID: 판매자 지급 완료
FAILED: 지급 실패
CANCELED: 주문 취소 또는 공동구매 실패로 정산 취소
```

기본 상태 흐름:

```txt
PENDING
-> CALCULATED
-> ON_HOLD
-> READY
-> REQUESTED
-> PAID
```

지급 실패 시 `FAILED`로 변경하고 관리자 재처리 대상에 포함한다.

---

### 24.7 정산 주기 및 보류 정책

초기 정산 주기는 주 1회 또는 월 2회로 운영한다.

정산 가능 조건:

```txt
- 공동구매가 성공적으로 종료됨
- 최종 가격 확정 완료
- 구매자 차액 환불 완료
- 배송 완료
- 취소 및 반품 가능 기간 종료
- 진행 중인 분쟁 없음
- 판매자 본인확인 및 정산 계좌 검증 완료
```

다음 상황에서는 정산을 보류한다.

```txt
- 배송 지연 또는 미배송
- 환불 처리 중
- 구매자 분쟁 접수
- 판매자 계좌 검증 실패
- 비정상 거래 탐지
- 지급대행 처리 실패
```

---

### 24.8 정산 데이터 모델

Spring Boot 백엔드 구현 시 다음 도메인 모델을 고려한다.

```ts
type Seller = {
  id: number;
  businessNumber: string;
  businessName: string;
  representativeName: string;
  settlementAccountId?: number;
  commissionPolicyId?: number;
  settlementStatus: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED";
};

type Settlement = {
  id: number;
  sellerId: number;
  periodStart: string;
  periodEnd: string;

  grossAmount: number;
  refundAmount: number;
  platformFee: number;
  pgFee: number;
  sellerDiscountShare: number;
  additionalFee: number;
  settlementAmount: number;

  status: SettlementStatus;
  scheduledAt?: string;
  paidAt?: string;
};

type LedgerEntryType =
  | "PAYMENT"
  | "PARTIAL_REFUND"
  | "FULL_REFUND"
  | "PLATFORM_FEE"
  | "PG_FEE"
  | "DISCOUNT_SHARE"
  | "SETTLEMENT"
  | "SETTLEMENT_REVERSAL";

type LedgerEntry = {
  id: number;
  orderId?: number;
  settlementId?: number;
  type: LedgerEntryType;
  amount: number;
  idempotencyKey: string;
  externalTransactionId?: string;
  createdAt: string;
};
```

`LedgerEntry`는 결제, 환불, 수수료, 정산의 근거가 되는 원장이다.

원장 데이터는 기존 기록을 수정하거나 삭제하지 않고, 취소가 필요한 경우 반대 거래를 추가하는 방식으로 관리한다.

---

### 24.9 판매자 정산 페이지

판매자 센터에 다음 페이지를 추가한다.

```txt
/seller/settlements
판매자 정산 내역

/seller/settlements/[id]
판매자 정산 상세
```

판매자 정산 목록 표시 정보:

```txt
- 정산 기간
- 총 최종 판매금액
- 차액 및 주문 환불액
- 플랫폼 중개수수료
- PG 수수료
- 할인 분담금
- 추가 비용
- 최종 정산 예정금액
- 정산 상태
- 지급 예정일 또는 지급 완료일
```

판매자 정산 상세에서는 주문별 계산 내역을 확인할 수 있어야 한다.

---

### 24.10 관리자 수익 및 정산 페이지

플랫폼 관리자를 위한 페이지를 추후 추가한다.

```txt
/admin/revenue
플랫폼 수익 대시보드

/admin/settlements
전체 판매자 정산 관리

/admin/settlements/[id]
정산 상세 및 재처리

/admin/commission-policies
수수료 정책 관리
```

플랫폼 수익 대시보드 표시 정보:

```txt
- 기간별 총 거래액
- 최종 판매금액
- 플랫폼 수수료 수익
- 환불 금액
- 지급 예정 판매자 정산금
- 지급 완료 판매자 정산금
- 실패 또는 보류 정산 건수
- 일반 공동구매와 재고떨이 상품별 수익
```

---

### 24.11 결제 및 정산 API 요구사항

백엔드는 다음 API 또는 동등한 기능을 제공해야 한다.

```txt
POST /api/payments/prepare
결제 요청 전 주문과 결제금액 검증

POST /api/payments/confirm
PG 결제 승인 결과 검증 및 주문 확정

POST /api/payments/webhooks
PG 결제·취소·환불 이벤트 수신

POST /api/deals/{dealId}/finalize
공동구매 종료 및 최종 가격 확정

POST /api/orders/{orderId}/refund-difference
최종 가격 차액 부분 환불

GET /api/seller/settlements
판매자 정산 목록 조회

GET /api/seller/settlements/{settlementId}
판매자 정산 상세 조회

POST /api/admin/settlements/{settlementId}/request
판매자 지급 요청

POST /api/admin/settlements/{settlementId}/retry
실패한 지급 재처리
```

결제 승인, 환불, 정산 요청 API는 중복 실행을 방지하기 위해 반드시 `idempotency key`를 사용한다.

PG 웹훅 수신 시 서명과 결제금액을 검증하고, 프론트엔드가 전달한 결제 성공 여부만 신뢰해서는 안 된다.

---

### 24.12 판매자 상품 등록 화면 변경

판매자 상품 등록 페이지에서 예상 수수료와 예상 정산금액을 보여준다.

적용 중개수수료율은 플랫폼 고정값 10%로 표시하며 판매자가 수정할 수 없다.

상품 유형 선택 시 다음 등록 기준을 안내한다.

```txt
일반 공동구매
- 품질, 유통기한, 외관상 별도 고지가 필요하지 않은 정상 상품
- 안정적인 재고와 배송 일정을 확보한 상품
- 참여 인원에 따른 가격 하락이 핵심 혜택인 상품

재고떨이 상품
- 과잉 재고, 시즌오프, 판매 종료 예정 상품
- 유통기한 임박 또는 패키지·외관상 하자가 있는 상품
- 재고 소진 사유와 상품 상태를 구매자에게 명확히 고지할 수 있는 상품
```

재고떨이 상품 선택 시 소진 사유, 고지 대상 상태, 구매자 고지 확인을 필수로 입력한다.

표시 예시:

```txt
예상 최종 판매금액: 1,200,000원
플랫폼 고정 중개수수료율: 10%
예상 플랫폼 수수료: 120,000원
예상 판매자 정산금: 1,080,000원
```

예상 정산금액은 참고용이며 실제 정산금액은 공동구매 종료, 환불, 배송, 할인 분담금에 따라 달라질 수 있다는 안내를 표시한다.

---

### 24.13 보안 및 운영 요구사항

```txt
- 결제, 환불, 수수료, 정산 금액은 백엔드에서 다시 계산한다.
- 모든 금액은 부동소수점이 아닌 정수 원 단위로 저장한다.
- 결제와 정산 API에 멱등성을 적용한다.
- PG 웹훅 서명을 검증한다.
- 정산 계좌 정보는 암호화하고 접근 권한을 제한한다.
- 관리자 정산 처리 이력을 감사 로그로 저장한다.
- 수수료율 변경 이력을 저장한다.
- 원장 기록은 삭제하거나 직접 수정하지 않는다.
- 정산 실패와 장기 보류 건에 대한 관리자 알림을 제공한다.
```

---

### 24.14 법률 및 운영 검토 사항

국내에서 실제 서비스를 운영하기 전에 다음 사항을 전문가와 검토한다.

```txt
- 통신판매중개자 고지 및 책임 범위
- 전자금융거래법상 등록 또는 신고 필요 여부
- 판매대금 보관과 지급대행 구조
- 구매자 청약 철회와 환불 정책
- 판매자 정산 및 세금계산서 처리
- 플랫폼 중개수수료의 부가가치세 처리
- 개인정보 및 판매자 정산 계좌 정보 보호
```

초기에는 플랫폼이 판매대금을 직접 보관하지 않고 PG 및 파트너 정산 서비스를 이용하는 구조를 우선한다.

---

### 24.15 수익화 구현 우선순위

1단계:

```txt
- 플랫폼 고정 수수료율 표시
- 판매자 상품 등록 화면에 예상 수수료 표시
- 판매자 상품 관리 화면에 예상 정산금 표시
- Mock 정산 데이터 및 판매자 정산 페이지 구현
```

2단계:

```txt
- Spring Boot 주문 및 결제 도메인 구현
- 실제 PG 결제 승인과 웹훅 검증
- 공동구매 종료 시 최종 가격 확정
- 구매자 차액 부분 환불
- 주문별 수수료 계산
```

3단계:

```txt
- 정산 원장 구현
- 판매자 정산 주기 및 보류 정책 구현
- 파트너 정산 또는 지급대행 API 연동
- 관리자 수익 및 정산 대시보드 구현
```

4단계:

```txt
- 판매자 구독제
- 상품 노출 광고
- 쿠폰 비용 분담
- 물류 및 추가 수수료
- 수익 분석과 자동 가격 정책 추천
```
