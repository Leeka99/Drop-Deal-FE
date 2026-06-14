# DropDeal API 명세서

> 프론트엔드와 Spring Boot 백엔드가 함께 사용하는 REST API 및 실시간 이벤트 계약

- 문서 버전: `v1.0.0-draft`
- 기준일: `2026-06-14`
- API 버전: `v1`
- 기본 경로: `/api/v1`
- 통신 형식: `application/json; charset=UTF-8`
- 금액 단위: 대한민국 원화(KRW), 소수점 없는 정수
- 시간 형식: ISO 8601 (`2026-06-14T23:30:00+09:00`)

## 1. 설계 원칙

1. 가격, 재고, 참여 가능 여부, 쿠폰 지급, 결제, 환불, 수수료, 정산 금액은 백엔드 계산값을 최종값으로 사용한다.
2. 프론트엔드는 상품 참여 직전 서버에서 최신 결제 예상 금액을 다시 조회한다.
3. 상품 참여 및 결제 요청에는 멱등성 키를 사용하여 중복 주문과 중복 결제를 방지한다.
4. 목록 API는 공통 커서 기반 페이지네이션을 사용한다.
5. 구매자와 판매자 권한을 분리한다. 판매자 계정은 자신의 상품을 구매할 수 없다.
6. 실시간 공동구매 현황은 WebSocket 또는 SSE로 전달하고, 연결 실패 시 상품 상세 REST API로 재동기화한다.

## 2. 인증 및 권한

### 2.1 역할

| 역할 | 값 | 설명 |
| --- | --- | --- |
| 비회원 | `ANONYMOUS` | 상품 조회 및 1회성 배송지 입력을 통한 주문 가능 |
| 구매자 | `BUYER` | 상품 참여, 주문, 쿠폰, Q&A, 후기 기능 사용 |
| 판매자 | `SELLER` | 판매 상품, 매출, Q&A 답변, 정산 관리 |
| 관리자 | `ADMIN` | 운영 및 정책 관리 |

### 2.2 인증 방식

웹 프론트엔드는 백엔드가 발급하는 `HttpOnly`, `Secure`, `SameSite=Lax` 세션 쿠키 사용을 권장한다.

인증이 필요한 API에서 세션이 없으면 `401 UNAUTHORIZED`, 권한이 없으면 `403 FORBIDDEN`을 반환한다.

### 2.3 인증 API

#### 로그인

`POST /api/v1/auth/login`

```json
{
  "email": "buyer@dropdeal.kr",
  "password": "buyer123"
}
```

```json
{
  "data": {
    "user": {
      "id": 101,
      "email": "buyer@dropdeal.kr",
      "name": "구매자 데모",
      "role": "BUYER"
    }
  }
}
```

#### 로그아웃

`POST /api/v1/auth/logout`

응답: `204 No Content`

#### 현재 사용자 조회

`GET /api/v1/auth/me`

```json
{
  "data": {
    "id": 101,
    "email": "buyer@dropdeal.kr",
    "name": "구매자 데모",
    "role": "BUYER"
  }
}
```

## 3. 공통 규칙

### 3.1 성공 응답

단건:

```json
{
  "data": {}
}
```

목록:

```json
{
  "data": [],
  "page": {
    "nextCursor": "eyJpZCI6MTAwfQ==",
    "hasNext": true,
    "size": 20
  }
}
```

### 3.2 오류 응답

```json
{
  "error": {
    "code": "PRODUCT_NOT_OPEN",
    "message": "현재 참여할 수 없는 상품입니다.",
    "fieldErrors": [
      {
        "field": "productId",
        "reason": "상품 상태가 OPEN이 아닙니다."
      }
    ],
    "traceId": "01J0ABCDEF123456789"
  }
}
```

### 3.3 공통 HTTP 상태 코드

| 상태 코드 | 의미 |
| --- | --- |
| `200` | 조회 및 변경 성공 |
| `201` | 리소스 생성 성공 |
| `204` | 응답 본문 없는 성공 |
| `400` | 요청 형식 또는 값 오류 |
| `401` | 로그인 필요 |
| `403` | 권한 없음 |
| `404` | 리소스 없음 |
| `409` | 현재 상태와 요청 충돌 |
| `422` | 비즈니스 규칙 위반 |
| `429` | 요청 횟수 제한 초과 |
| `500` | 서버 내부 오류 |

### 3.4 공통 요청 헤더

| 헤더 | 필수 | 설명 |
| --- | --- | --- |
| `Content-Type: application/json` | 본문이 있는 요청 | JSON 요청 |
| `Idempotency-Key` | 결제 및 상태 변경 요청 | UUID 권장 |
| `X-Request-Id` | 선택 | 요청 추적용 UUID |

### 3.5 공통 오류 코드

| 코드 | HTTP | 설명 |
| --- | --- | --- |
| `VALIDATION_ERROR` | `400` | 입력값 검증 실패 |
| `UNAUTHORIZED` | `401` | 인증 필요 |
| `FORBIDDEN` | `403` | 권한 없음 |
| `RESOURCE_NOT_FOUND` | `404` | 리소스 없음 |
| `DUPLICATE_REQUEST` | `409` | 멱등성 키 또는 중복 요청 |
| `NICKNAME_ALREADY_EXISTS` | `409` | 이미 사용 중인 닉네임 |
| `PRODUCT_NOT_OPEN` | `409` | 참여 가능한 상품이 아님 |
| `PRODUCT_SOLD_OUT` | `409` | 재고 또는 참여 인원 소진 |
| `ALREADY_PARTICIPATED` | `409` | 동일 상품에 이미 참여함 |
| `PRICE_CHANGED` | `409` | 결제 확인 이후 가격 변경 |
| `PAYMENT_FAILED` | `422` | 결제 실패 |
| `COUPON_NOT_APPLICABLE` | `422` | 쿠폰 적용 조건 불충족 |
| `SETTLEMENT_NOT_REQUESTABLE` | `409` | 정산 요청 불가능 상태 |
| `PROHIBITED_PRODUCT` | `422` | 법령 또는 운영 정책상 등록 금지 품목 |
| `RATE_LIMITED` | `429` | 요청 횟수 제한 |

## 4. 공통 데이터 타입

### 4.1 열거형

```ts
type UserRole = "BUYER" | "SELLER" | "ADMIN";

type ProductType = "NORMAL" | "CLEARANCE" | "FREE_GIVEAWAY";

type ProductStatus =
  | "SCHEDULED"
  | "OPEN"
  | "SOLD_OUT"
  | "CLOSED"
  | "FAILED";

type OrderStatus =
  | "PAYMENT_PENDING"
  | "GROUP_BUYING"
  | "GROUP_BUY_SUCCESS"
  | "GROUP_BUY_FAILED"
  | "REFUND_PENDING"
  | "REFUND_COMPLETED"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELED";

type CouponStatus = "AVAILABLE" | "USED" | "EXPIRED";

type QuestionStatus = "WAITING" | "ANSWERED";

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

### 4.2 ProductSummary

상품 목록과 카드 UI에서 사용한다.

```ts
type ProductSummary = {
  id: number;
  name: string;
  sellerName: string;
  thumbnailUrl: string;
  type: ProductType;
  status: ProductStatus;
  originalPrice: number;
  startPrice: number;
  currentPrice: number;
  minPrice: number;
  currentDiscountRate: number;
  maxDiscountRate: number;
  minParticipants: number;
  currentParticipants: number;
  maxParticipants: number;
  remainingStock: number;
  shippingFee: number;
  nextDiscountParticipants: number | null;
  nextPrice: number | null;
  startAt: string;
  endAt: string;
  couponEvent: CouponEventSummary | null;
  ratingAverage: number;
  reviewCount: number;
};
```

### 4.3 ProductDetail

```ts
type ProductDetail = ProductSummary & {
  description: string;
  imageUrls: string[];
  seller: {
    id: number;
    name: string;
    profileImageUrl: string | null;
  };
  stockQuantity: number;
  discountStepParticipants: number;
  discountStepAmount: number;
  priceSteps: PriceStep[];
  giveaway: GiveawayPolicy | null;
  reactionSummary: ReactionSummary;
  qnaCount: number;
  viewer: {
    participated: boolean;
    canParticipate: boolean;
    participationBlockedReason: string | null;
    selectedReaction: ReactionType | null;
  };
};
```

```ts
type PriceStep = {
  participants: number;
  price: number;
  reached: boolean;
};
```

### 4.4 완전무료! 상품

```ts
type FulfillmentMethod = "SHIPPING" | "PICKUP";

type GiveawayPolicy = {
  reason: string;
  promotionalPurpose: boolean;
  fulfillmentMethods: FulfillmentMethod[];
  shippingFee: number | null;
  pickup: {
    storeName: string;
    address: string;
    instructions: string;
    deposit: 2000;
  } | null;
};
```

- 상품 가격과 플랫폼 중개수수료는 항상 `0원`이다.
- 택배 수령은 판매자가 등록한 택배비만 결제한다.
- 매장 픽업은 보증금 `2,000원`을 결제하며 수령 완료 시 전액 환불한다.
- 픽업 예약 완료 후 소비자에게 교환 코드와 QR을 발급한다.

### 4.5 쿠폰 이벤트

```ts
type CouponEventSummary = {
  rate: 3 | 5 | 10 | 15;
  maxDiscountAmount: number;
  winnerRate: number | null;
  minParticipantsForDraw: number | null;
  estimatedWinnerCount: number | null;
  description: string;
};
```

### 4.5 반응

```ts
type ReactionType =
  | "JOIN_TOGETHER"
  | "DROP_MORE"
  | "CLOSING_SOON"
  | "THINKING"
  | "GOOD_PRICE"
  | "CLEAR_STOCK";

type ReactionSummary = Record<ReactionType, number>;
```

## 5. 상품 API

### 5.1 상품 목록 조회

`GET /api/v1/products`

#### Query Parameters

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `type` | `NORMAL \| CLEARANCE` | 아니요 | 상품 유형 |
| `status` | `ProductStatus` | 아니요 | 상품 상태 |
| `couponEvent` | `boolean` | 아니요 | 쿠폰 이벤트 상품 여부 |
| `keyword` | `string` | 아니요 | 상품명 또는 판매자명 검색 |
| `sort` | `ENDING_SOON \| DISCOUNT_DESC \| PARTICIPANTS_DESC \| NEWEST \| PRICE_ASC` | 아니요 | 정렬, 기본값 `ENDING_SOON` |
| `cursor` | `string` | 아니요 | 다음 페이지 커서 |
| `size` | `number` | 아니요 | 기본 `20`, 최대 `100` |

```json
{
  "data": [
    {
      "id": 1,
      "name": "제주 햇살 감귤 5kg",
      "sellerName": "귤빛농원",
      "thumbnailUrl": "https://cdn.example.com/products/1/thumbnail.jpg",
      "type": "NORMAL",
      "status": "OPEN",
      "originalPrice": 32000,
      "startPrice": 30400,
      "currentPrice": 29100,
      "minPrice": 24000,
      "currentDiscountRate": 9,
      "maxDiscountRate": 25,
      "minParticipants": 15,
      "currentParticipants": 27,
      "maxParticipants": 50,
      "remainingStock": 23,
      "nextDiscountParticipants": 2,
      "nextPrice": 27800,
      "startAt": "2026-06-01T09:00:00+09:00",
      "endAt": "2026-06-15T22:00:00+09:00",
      "couponEvent": null,
      "ratingAverage": 4.8,
      "reviewCount": 128
    }
  ],
  "page": {
    "nextCursor": null,
    "hasNext": false,
    "size": 20
  }
}
```

### 5.2 상품 상세 조회

`GET /api/v1/products/{productId}`

응답: `ProductDetail`

### 5.3 상품 가격 정책 미리보기

판매자 상품 등록 화면에서 정가와 재고에 따른 서버 계산값을 미리 확인한다.

`POST /api/v1/seller/products/pricing-preview`

권한: `SELLER`

```json
{
  "type": "CLEARANCE",
  "originalPrice": 30000,
  "stockQuantity": 50
}
```

```json
{
  "data": {
    "startPrice": 15000,
    "minPrice": 9000,
    "minParticipants": 13,
    "discountStartParticipants": 13,
    "maxParticipants": 50,
    "discountStepParticipants": 35,
    "discountStepAmount": 6000,
    "stepCount": 0,
    "clearanceDeepDiscountParticipants": 35,
    "startDiscountRate": 50,
    "maxDiscountRate": 70,
    "recommendedCouponRate": null,
    "estimatedParticipants": 43,
    "estimatedFinalPrice": 9000,
    "estimatedGrossAmount": 387000,
    "commissionRate": 0.12,
    "estimatedPlatformFee": 46440,
    "estimatedPgFee": 11610,
    "estimatedSettlementAmount": 328950,
    "priceSteps": [
      {
        "participants": 0,
        "price": 15000,
        "reached": true
      },
      {
        "participants": 35,
        "price": 9000,
        "reached": true
      }
    ]
  }
}
```

### 5.4 판매자 상품 등록

`POST /api/v1/seller/products`

권한: `SELLER`

가격 정책 관련 값은 요청으로 받지 않고 백엔드에서 계산한다.

```json
{
  "name": "유통기한 임박 그래놀라 6종 세트",
  "description": "품질에는 이상 없고 유통기한이 가까운 상품입니다.",
  "type": "CLEARANCE",
  "originalPrice": 36000,
  "stockQuantity": 70,
  "startAt": "2026-06-15T09:00:00+09:00",
  "endAt": "2026-06-20T23:30:00+09:00",
  "imageUrls": [
    "https://cdn.example.com/products/granola-1.jpg"
  ],
  "clearance": {
    "reason": "EXPIRATION_DATE_APPROACHING",
    "conditionNotice": "유통기한 2026-08-30까지",
    "disclosureConfirmed": true
  }
}
```

응답: `201 Created`, 생성된 `ProductDetail`

#### 완전무료! 상품 등록 요청

```json
{
  "name": "폐업 정리 카페 머그컵",
  "description": "남은 새 머그컵을 지역 주민께 무료로 나눕니다.",
  "type": "FREE_GIVEAWAY",
  "stockQuantity": 80,
  "startAt": "2026-06-15T09:00:00+09:00",
  "endAt": "2026-06-20T18:00:00+09:00",
  "giveaway": {
    "reason": "폐업 예정 또는 폐업 재고 기부",
    "promotionalPurpose": false,
    "fulfillmentMethods": ["SHIPPING", "PICKUP"],
    "shippingFee": 3000,
    "pickup": {
      "storeName": "동네카페 느린오후",
      "address": "서울시 마포구 월드컵로 10",
      "instructions": "오후 1시부터 6시 사이 카운터에서 QR을 보여주세요."
    }
  }
}
```

#### 등록 검증 규칙

| 규칙 | 값 |
| --- | --- |
| 최소 정가 | `100원` |
| 최소 총 재고 | `10개` |
| 최대 참여 인원 | 총 재고와 동일 |
| `CLEARANCE` 필수값 | 재고떨이 사유, 상태 고지, 고지 확인 |
| `FREE_GIVEAWAY` 필수값 | 무료나눔 사유, 최소 한 가지 수령 방식 |
| 매장 픽업 보증금 | 시스템 고정 `2,000원` |

#### 등록 금지 품목

다음 품목은 일반 공동구매, 재고떨이, 완전무료! 상품을 포함한 모든 유형으로 등록할 수 없다.

- 마약류 및 불법 약물
- 주류
- 담배 및 니코틴 제품
- 청소년 유해제품
- 불법 의약품 및 무허가 의료제품
- 총포·도검·폭발물 등 무기류 및 위험물
- 도난품, 위조품, 불법 복제품 및 타인의 지식재산권을 침해하는 물품
- 리콜 대상, 안전 기준 미충족 또는 위해 우려가 있는 식품·생활용품
- 개인정보, 인증정보 또는 타인의 권리가 포함된 물품
- 그 밖에 법령·행정명령·플랫폼 정책상 온라인 거래 또는 무료 제공이 금지되거나 제한된 품목

판매자는 등록 시 다음 사항을 필수 체크해야 한다.

- 등록 상품이 금지 또는 제한 품목에 해당하지 않음
- 판매자에게 해당 상품을 판매하거나 기부할 정당한 권한이 있음
- 타인의 소유권, 지식재산권, 개인정보 및 기타 권리를 침해하지 않음

백엔드는 상품명·설명·카테고리 및 운영자 검수를 통해 등록을 차단할 수 있다. 위반 시 `422 PROHIBITED_PRODUCT`를 반환한다.
| 종료 시각 | 시작 시각 이후 |

### 5.5 판매자 상품 목록

`GET /api/v1/seller/products`

권한: `SELLER`

Query: `status`, `type`, `keyword`, `cursor`, `size`

```ts
type SellerProductSummary = ProductSummary & {
  unansweredQuestionCount: number;
  grossAmount: number;
  commissionRate: number;
  estimatedSettlementAmount: number;
};
```

## 6. 실시간 상품 이벤트

### 6.1 연결

권장 방식:

- WebSocket STOMP 구독: `/topic/products/{productId}`
- 인증 사용자 개인 이벤트: `/user/queue/notifications`
- WebSocket 도입 전 대안: `GET /api/v1/products/{productId}/events` SSE

연결 직후 프론트는 `GET /api/v1/products/{productId}`로 초기 상태를 조회한 후 이벤트를 반영한다.

### 6.2 이벤트 형식

```ts
type ProductRealtimeEvent = {
  eventId: string;
  productId: number;
  type:
    | "PARTICIPATION_CREATED"
    | "PRICE_DROPPED"
    | "NEXT_DISCOUNT_NEAR"
    | "REACTION_UPDATED"
    | "STOCK_LOW"
    | "TIME_LOW"
    | "GOAL_REACHED"
    | "PRODUCT_CLOSED"
    | "COUPON_EVENT";
  occurredAt: string;
  version: number;
  data: Record<string, unknown>;
};
```

가격 하락 이벤트 예시:

```json
{
  "eventId": "evt_01J0ABCDEF",
  "productId": 1,
  "type": "PRICE_DROPPED",
  "occurredAt": "2026-06-14T14:30:10+09:00",
  "version": 18,
  "data": {
    "currentPrice": 23000,
    "currentParticipants": 30,
    "remainingStock": 20,
    "nextDiscountParticipants": 5,
    "nextPrice": 22000,
    "message": "현재 가격이 23,000원으로 내려갔어요."
  }
}
```

프론트가 보유한 `version`보다 큰 이벤트만 적용한다. 이벤트 누락 또는 재연결 시 상품 상세 API로 재동기화한다.

## 7. 상품 반응 API

### 반응 등록 또는 변경

`PUT /api/v1/products/{productId}/reaction`

권한: `BUYER`

```json
{
  "reaction": "GOOD_PRICE"
}
```

```json
{
  "data": {
    "selectedReaction": "GOOD_PRICE",
    "reactionSummary": {
      "JOIN_TOGETHER": 24,
      "DROP_MORE": 18,
      "CLOSING_SOON": 7,
      "THINKING": 11,
      "GOOD_PRICE": 16,
      "CLEAR_STOCK": 9
    }
  }
}
```

동일 상품에서 사용자당 하나의 반응만 유지하며 다른 반응으로 변경할 수 있다.

## 8. Q&A API

### 8.1 상품 질문 목록

`GET /api/v1/products/{productId}/questions`

Query: `status`, `cursor`, `size`

```ts
type ProductQuestion = {
  id: number;
  productId: number;
  userNickname: string;
  question: string;
  answer: string | null;
  status: QuestionStatus;
  createdAt: string;
  answeredAt: string | null;
};
```

### 8.2 질문 등록

`POST /api/v1/products/{productId}/questions`

권한: `BUYER`

```json
{
  "question": "배송은 언제 시작하나요?"
}
```

검증: 공백 제외 `1~300자`

### 8.3 판매자 질문 목록

`GET /api/v1/seller/questions`

권한: `SELLER`

Query: `productId`, `status`, `cursor`, `size`

### 8.4 판매자 답변 등록

`PUT /api/v1/seller/questions/{questionId}/answer`

권한: 해당 상품의 `SELLER`

```json
{
  "answer": "공동구매 종료 다음 영업일부터 순차 발송합니다."
}
```

## 9. 후기 API

### 9.1 상품 후기 목록

`GET /api/v1/products/{productId}/reviews`

Query: `sort=NEWEST|RATING_DESC|RATING_ASC`, `cursor`, `size`

```ts
type ProductReview = {
  id: number;
  productId: number;
  userNickname: string;
  rating: number;
  content: string;
  imageUrls: string[];
  createdAt: string;
};
```

### 9.2 후기 등록

`POST /api/v1/orders/{orderId}/review`

권한: 해당 주문의 `BUYER`

```json
{
  "rating": 5,
  "content": "배송이 빠르고 상품 상태가 좋았습니다.",
  "imageUrls": []
}
```

검증:

- 배송 완료된 구매자만 작성 가능
- 주문당 후기 1개
- 별점 `1~5`

## 10. 공동구매 참여 및 결제 API

### 10.0 완전무료! 상품 결제 원칙

- `SHIPPING`: 결제 금액은 판매자가 등록한 택배비이며 상품 대금과 플랫폼 수수료는 `0원`
- `PICKUP`: 결제 금액은 환불형 보증금 `2,000원`
- 픽업 수령 확인 시 보증금 전액 환불
- 무료 상품의 택배비와 픽업 보증금은 판매 매출 및 정산 금액에 포함하지 않음

### 10.1 결제 예상 정보 조회

결제 화면 진입과 결제 직전에 호출한다.

`GET /api/v1/products/{productId}/checkout`

권한: `BUYER` 또는 비회원

```json
{
  "data": {
    "productId": 1,
    "productName": "제주 햇살 감귤 5kg",
    "thumbnailUrl": "https://cdn.example.com/products/1/thumbnail.jpg",
    "sellerName": "귤빛농원",
    "originalPrice": 32000,
    "currentPrice": 24000,
    "currentDiscountAmount": 8000,
    "quantity": 1,
    "totalPaymentAmount": 27000,
    "shippingFee": 3000,
    "currentParticipants": 27,
    "maxParticipants": 50,
    "remainingStock": 23,
    "endAt": "2026-06-15T22:00:00+09:00",
    "canParticipate": true,
    "blockedReason": null,
    "priceVersion": 18
  }
}
```

### 10.2 공동구매 참여 및 결제 생성

`POST /api/v1/orders`

권한: `BUYER` 또는 비회원

필수 헤더: `Idempotency-Key`

```json
{
  "productId": 1,
  "quantity": 1,
  "paymentMethod": "CARD",
  "expectedPaymentAmount": 27000,
  "priceVersion": 18,
  "shippingAddressId": 12,
  "shippingAddress": {
    "recipientName": "홍길동",
    "phone": "010-0000-0000",
    "postalCode": "04000",
    "address": "서울시 마포구 월드컵로 10",
    "detailAddress": "101호",
    "deliveryMemo": "문 앞에 놓아주세요."
  },
  "successUrl": "https://dropdealkr.com/payment/success",
  "failUrl": "https://dropdealkr.com/payment/fail"
}
```

완전무료! 상품은 `fulfillmentMethod`를 함께 전송한다.

```json
{
  "productId": 9,
  "quantity": 1,
  "fulfillmentMethod": "PICKUP",
  "expectedPaymentAmount": 2000,
  "successUrl": "https://dropdealkr.com/payment/success",
  "failUrl": "https://dropdealkr.com/payment/fail"
}
```

픽업 예약 완료 응답:

```json
{
  "data": {
    "orderId": "DD-FREE-260615-0012",
    "fulfillmentMethod": "PICKUP",
    "paidAmount": 2000,
    "refundableDeposit": 2000,
    "pickupCode": "FREE-9K2A",
    "pickupQrUrl": "https://cdn.example.com/pickup/qr/FREE-9K2A.png",
    "depositStatus": "HELD"
  }
}
```

### 10.5 매장 픽업 수령 확인

`POST /api/v1/seller/pickups/{pickupCode}/complete`

권한: 해당 완전무료! 상품의 `SELLER`

수령 확인 후 보증금 `2,000원`을 전액 환불하며, 같은 교환 코드 또는 QR은 다시 사용할 수 없다.

```json
{
  "data": {
    "orderId": "DD-260614-01842",
    "paymentId": "PAY-260614-01842",
    "status": "PAYMENT_PENDING",
    "paymentAmount": 24000,
    "paymentUrl": "https://pg.example.com/pay/token",
    "createdAt": "2026-06-14T14:35:00+09:00"
  }
}
```

가격이 변경되었으면 결제를 만들지 않고 아래 응답을 반환한다.

```json
{
  "error": {
    "code": "PRICE_CHANGED",
    "message": "상품 가격이 변경되었습니다. 최신 금액을 확인해 주세요.",
    "details": {
      "expectedPaymentAmount": 24000,
      "currentPaymentAmount": 23000,
      "priceVersion": 19
    }
  }
}
```

### 10.3 결제 승인

PG 결제 완료 후 프론트 또는 백엔드 결제 콜백에서 호출한다.

`POST /api/v1/payments/{paymentId}/confirm`

필수 헤더: `Idempotency-Key`

```json
{
  "paymentKey": "pg_payment_key",
  "orderId": "DD-260614-01842",
  "amount": 24000
}
```

```json
{
  "data": {
    "orderId": "DD-260614-01842",
    "paymentId": "PAY-260614-01842",
    "orderStatus": "GROUP_BUYING",
    "paidAmount": 24000,
    "currentPrice": 24000,
    "estimatedRefundAmount": 0,
    "paidAt": "2026-06-14T14:36:00+09:00"
  }
}
```

### 10.4 주문 취소

`POST /api/v1/orders/{orderId}/cancel`

권한: 해당 주문의 `BUYER`

필수 헤더: `Idempotency-Key`

```json
{
  "reason": "단순 변심"
}
```

취소 가능 여부는 공동구매 상태와 운영 정책에 따라 백엔드가 판단한다.

## 11. 구매자 주문 API

### 11.1 내 주문 목록

`GET /api/v1/me/orders`

권한: `BUYER`

Query: `status`, `cursor`, `size`

```ts
type OrderSummary = {
  id: string;
  product: {
    id: number;
    name: string;
    thumbnailUrl: string;
  };
  status: OrderStatus;
  paidAmount: number;
  finalPrice: number | null;
  refundAmount: number;
  refundStatus: "NONE" | "PENDING" | "COMPLETED" | "FAILED";
  participatedAt: string;
};
```

### 11.2 내 주문 상세

`GET /api/v1/me/orders/{orderId}`

권한: 해당 주문의 `BUYER`

```ts
type OrderDetail = OrderSummary & {
  quantity: number;
  paymentMethod: string;
  paymentId: string;
  productEndAt: string;
  refundCompletedAt: string | null;
  shipping: {
    carrier: string | null;
    trackingNumber: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
  };
};
```

### 11.3 비회원 주문 인증 및 조회

비회원은 로그인 회원의 `내 참여` 내역에 접근할 수 없다. 비회원 주문 조회 화면에서 주문 시 입력한 이름과 휴대폰 번호를 인증한 뒤 해당 정보와 일치하는 비회원 주문만 조회한다.

`POST /api/v1/guest-orders/verify`

```json
{
  "name": "홍길동",
  "phone": "010-1234-5678"
}
```

인증 성공 시 짧은 만료 시간을 가진 비회원 주문 조회 토큰을 발급한다. 인증 실패 여부로 주문 존재 여부를 추측할 수 없도록 응답 메시지를 통일하고, IP와 휴대폰 번호 기준 시도 횟수를 제한한다. 운영 환경에서는 휴대폰 본인확인 또는 일회용 인증번호 절차를 추가한다.

`GET /api/v1/guest-orders`

필수 헤더: `Guest-Order-Token`

응답은 인증된 이름과 휴대폰 번호가 주문 시점 정보와 모두 일치하는 비회원 주문만 포함한다.

## 12. 구매자 쿠폰 API

### 내 쿠폰 목록

`GET /api/v1/me/coupons`

권한: `BUYER`

Query: `status=AVAILABLE|USED|EXPIRED`, `cursor`, `size`

```ts
type UserCoupon = {
  id: number;
  name: string;
  rate: 3 | 5 | 10 | 15;
  maxDiscountAmount: number;
  status: CouponStatus;
  issuedReason: string;
  issuedAt: string;
  expiresAt: string;
  usedAt: string | null;
  sourceProductId: number | null;
};
```

## 12.1 내 정보 및 배송지 API

### 내 정보 조회

`GET /api/v1/me/profile`

```ts
type UserProfile = {
  id: number;
  email: string;
  nickname: string;
  phone: string;
  defaultShippingAddressId: number | null;
};
```

사용자 식별의 기준은 변경되지 않는 `id`이며, 닉네임은 화면 표시용 고유값으로 사용한다.

### 닉네임 중복 확인

`GET /api/v1/users/nickname-availability?nickname=DropDealUser`

```json
{
  "data": {
    "nickname": "DropDealUser",
    "available": true
  }
}
```

닉네임 규칙:

- 전체 사용자 간 중복 불가
- 문자 종류와 길이 제한 없음
- 관리자, 운영자, 서비스명 사칭 및 금칙어 사용 불가
- 닉네임 변경 후 저장 전에 중복 확인 필수
- 동시 변경 충돌 시 프로필 수정 API가 `409 NICKNAME_ALREADY_EXISTS` 반환

### 내 정보 수정

`PUT /api/v1/me/profile`

```json
{
  "nickname": "DropDeal 구매자",
  "phone": "010-0000-0000"
}
```

### 배송지 목록 조회

`GET /api/v1/me/shipping-addresses`

### 배송지 등록

`POST /api/v1/me/shipping-addresses`

```json
{
  "name": "집",
  "recipientName": "홍길동",
  "phone": "010-0000-0000",
  "postalCode": "04000",
  "address": "서울시 마포구 월드컵로 10",
  "detailAddress": "101호",
  "deliveryMemo": "문 앞에 놓아주세요.",
  "isDefault": true
}
```

### 배송지 수정 및 삭제

- `PUT /api/v1/me/shipping-addresses/{addressId}`
- `DELETE /api/v1/me/shipping-addresses/{addressId}`

택배 주문에는 저장된 `shippingAddressId` 또는 직접 입력한 `shippingAddress`가 반드시 필요하다. 주문 생성 시 배송지 내용을 주문 스냅샷으로 저장하여 이후 배송지 수정의 영향을 받지 않게 한다.

비회원 주문은 `shippingAddressId`를 사용할 수 없으며 직접 입력한 `shippingAddress`만 허용한다. 입력 주소는 해당 주문의 배송 스냅샷으로만 저장하고 회원 배송지 주소록에는 저장하지 않는다. 개인정보 보관 기간이 지나면 관련 법령과 개인정보 처리방침에 따라 파기한다.

로그인 구매자에게는 결제 화면에서 `기본 배송지 사용`과 `새 배송지 입력` 선택지를 제공한다. 로그인만으로 기본 배송지를 주문에 자동 적용하지 않는다. 구매자가 기본 배송지 사용을 선택하면 프론트엔드는 `GET /api/v1/me/profile`과 `GET /api/v1/me/shipping-addresses`를 조회해 배송지를 채운다. 구매자는 불러온 배송지를 이번 주문에 한해 수정할 수 있으며, 새 배송지 입력을 선택하면 빈 입력 폼을 제공한다.

## 13. 판매자 매출 API

### 13.1 판매 현황 요약

`GET /api/v1/seller/sales/summary`

권한: `SELLER`

Query: `from=2026-06-01`, `to=2026-06-30`

```json
{
  "data": {
    "grossAmount": 10590000,
    "platformFee": 1059000,
    "pgFee": 317700,
    "estimatedSettlementAmount": 9213300,
    "orderCount": 268,
    "participantCount": 268
  }
}
```

### 13.2 상품별 판매 목록

`GET /api/v1/seller/sales`

권한: `SELLER`

Query: `from`, `to`, `productId`, `status`, `cursor`, `size`

```ts
type SellerSale = {
  id: string;
  product: {
    id: number;
    name: string;
    type: ProductType;
  };
  grossAmount: number;
  commissionRate: number;
  platformFee: number;
  pgFee: number;
  estimatedSettlementAmount: number;
  currentParticipants: number;
  maxParticipants: number;
  orderCount: number;
};
```

## 14. 판매자 정산 API

### 14.1 정산 목록 조회

`GET /api/v1/seller/settlements`

권한: `SELLER`

Query: `status`, `from`, `to`, `cursor`, `size`

```ts
type SettlementSummary = {
  id: number;
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
  scheduledAt: string | null;
  paidAt: string | null;
  holdReason: string | null;
};
```

### 14.2 정산 상세 조회

`GET /api/v1/seller/settlements/{settlementId}`

권한: 해당 정산의 `SELLER`

```ts
type SettlementDetail = SettlementSummary & {
  orders: SettlementOrder[];
};

type SettlementOrder = {
  id: string;
  productName: string;
  finalAmount: number;
  refundAmount: number;
  platformFee: number;
  pgFee: number;
  sellerDiscountShare: number;
  settlementAmount: number;
};
```

### 14.3 정산 지급 요청

`POST /api/v1/seller/settlements/{settlementId}/request`

권한: 해당 정산의 `SELLER`

필수 헤더: `Idempotency-Key`

요청 가능한 상태: `READY`

응답: 변경된 `SettlementSummary`

## 15. 파일 업로드 API

상품 및 후기 이미지 업로드는 API 서버에 파일을 직접 전송하지 않고 사전 서명 URL 사용을 권장한다.

### 업로드 URL 발급

`POST /api/v1/uploads/presigned-url`

권한: 로그인 사용자

```json
{
  "purpose": "PRODUCT_IMAGE",
  "fileName": "granola.jpg",
  "contentType": "image/jpeg",
  "size": 1048576
}
```

```json
{
  "data": {
    "uploadUrl": "https://storage.example.com/presigned...",
    "fileUrl": "https://cdn.example.com/products/granola.jpg",
    "expiresAt": "2026-06-14T15:00:00+09:00"
  }
}
```

## 16. 백엔드 내부 처리 규칙

### 16.1 상품 가격

현재 프론트의 정책 기준:

```text
일반 상품 시작 할인율: 5%
일반 상품 최대 할인율: 25%
재고떨이 상품 기본 할인율: 50%
재고떨이 상품 총 재고 70% 참여 달성 할인율: 70%
완전무료! 상품 가격 및 플랫폼 수수료: 0원
금액 계산 결과: 100원 단위 반올림
```

일반 상품은 최소 참여 인원 달성 후 단계별로 가격이 내려간다. 재고떨이 상품은 주문 시작부터 50% 할인가를 적용하고, 총 재고의 70% 이상이 참여하면 한 번만 70% 할인가로 변경한다. 가격과 가격 버전은 트랜잭션 안에서 갱신한다.

### 16.2 참여 및 재고

- MVP 기준 사용자당 동일 상품 `1개`, `1회` 참여
- `maxParticipants = stockQuantity`
- 주문 생성 또는 결제 승인 시점의 재고 차감 정책을 백엔드에서 일관되게 적용
- 동시 참여 요청은 DB 잠금 또는 원자적 조건 업데이트로 초과 판매 방지

### 16.3 공동구매 종료

- `currentParticipants >= minParticipants`: 성공 처리 및 최종 가격 확정
- `currentParticipants < minParticipants`: 실패 처리 및 전액 환불
- 성공 시 `paidAmount - finalPrice`를 차액 환불
- 차액 환불과 전액 환불은 멱등 처리

### 16.4 쿠폰

| 할인율 | 최대 할인 금액 | 주요 대상 |
| --- | ---: | --- |
| `3%` | `3,000원` | 전체 공동구매 및 신규 참여 유도 |
| `5%` | `5,000원` | 참여율 70% 이상 및 재구매 유도 |
| `10%` | `10,000원` | 참여율 40~70% 또는 마감 임박 |
| `15%` | `15,000원` | 참여율 40% 미만 |

재고떨이 상품에는 50%·70% 전용 할인 정책이 적용되며 쿠폰 중복 할인은 허용하지 않는다.
완전무료! 상품에는 쿠폰과 플랫폼 중개수수료를 적용하지 않는다.

### 16.5 수수료와 정산

```text
플랫폼 수익 = 최종 판매금액 × 중개수수료율

판매자 정산금 =
최종 판매금액
- 환불액
- 플랫폼 중개수수료
- PG 수수료
- 판매자 할인 분담금
- 추가 비용
```

| 최종 판매금액 | 중개수수료율 |
| --- | ---: |
| 100만원 미만 | `12%` |
| 100만원 이상 | `10%` |
| 300만원 이상 | `8%` |
| 1,000만원 이상 | `6%` |

PG 수수료 기본 예상치는 `3%`이며 실제 정산에서는 PG 결과값을 사용한다.

완전무료! 상품의 택배비는 배송 처리 비용이며 판매 매출로 보지 않는다. 매장 픽업 보증금은 예치금으로 관리하고 수령 완료 시 전액 환불하므로 판매자 정산 및 플랫폼 매출에 포함하지 않는다.

## 17. 구현 우선순위

### 1차: 현재 프론트 mock 교체

1. `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
2. `GET /products`, `GET /products/{productId}`
3. `GET /products/{productId}/checkout`, `POST /orders`, 결제 승인
4. `GET /me/orders`, `GET /me/coupons`
5. `GET /seller/products`, `POST /seller/products`, 가격 정책 미리보기
6. `GET /seller/sales`, `GET /seller/settlements`

### 2차: 상호작용과 실시간 기능

1. 상품 실시간 이벤트
2. 상품 반응
3. Q&A 질문 및 판매자 답변
4. 후기

### 3차: 운영 안정화

1. PG 웹훅, 환불, 정산 자동화
2. 관리자 API
3. 감사 로그, 요청 추적, 알림

## 18. 프론트엔드 연동 참고

- 현재 `src/types/product.ts`의 `visual`, `icon`은 mock UI 전용 필드이므로 실제 연동 시 `thumbnailUrl`, `imageUrls`로 교체한다.
- 현재 `productService`와 `settlementService`의 mock 반환부를 이 문서의 REST API 호출로 교체한다.
- 상품 가격과 참여 인원은 프론트에서 계산해 확정하지 않는다. 화면 미리보기 외에는 항상 API 응답값을 표시한다.
- 결제 성공 및 실패 페이지는 고정 문구 대신 `orderId`로 주문 상세를 조회해 표시한다.
- 실시간 이벤트 수신 후에도 결제 전에는 반드시 checkout API로 최신 가격과 참여 가능 여부를 확인한다.
> 닉네임과 상품 정보 등 사용자가 입력하는 모든 문자열은 서버에서 중복 닉네임 및 플랫폼 금칙어 검사를 수행해야 합니다. 닉네임은 문자 종류와 길이를 제한하지 않으며, 중복 또는 금칙어 포함 시에만 거절합니다. 공백, 특수문자, 대소문자 차이로 금칙어 검사를 우회할 수 없도록 정규화 후 검사합니다.
