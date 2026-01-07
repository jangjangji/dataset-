# 한국관광공사 데이터 수집기

한국관광공사 API를 통해 전국 관광지 정보를 수집하여 PostgreSQL 데이터베이스에 저장하는 프로젝트입니다.
하이브리드 검색 시스템 구축을 위한 관광지 데이터 수집 도구입니다.

## 주요 기능

- 한국관광공사 공공데이터 API 연동 (KorService2)
- 관광지 기본 정보 + 상세 정보 + 이미지 정보 자동 수집
- PostgreSQL 데이터베이스 자동 저장
- 중복 데이터 자동 업데이트 (UPSERT)
- Rate Limit 방지를 위한 자동 딜레이 처리

## 수집 데이터 항목 (총 25개 컬럼)

### 📍 기본 정보 (12개)
```
content_id : 콘텐츠 고유 ID (UNIQUE KEY)
content_type_id : 콘텐츠 타입 (12=관광지)
title : 관광지명
addr1 : 주소
addr2 : 상세주소
zipcode : 우편번호
tel : 전화번호
map_x : GPS X좌표 (경도)
map_y : GPS Y좌표 (위도)
area_code : 지역코드
sigungu_code : 시군구코드
cat1 : 대분류 카테고리
```

### 🖼️ 이미지 정보 (2개)
```
firstimage : 대표 이미지 URL (원본)
firstimage2 : 썸네일 이미지 URL
```

### 📝 상세 정보 (3개)
```
overview : 콘텐츠 개요/상세설명 (하이브리드 검색용 핵심 필드)
homepage : 홈페이지 URL
telname : 전화명
```

### 🏛️ 소개 정보 (2개)
```
opendate : 개장일
restdate : 휴무일
```

### 🎫 이벤트/투어 정보 (3개)
```
booktour : 투어/예약 여부
eventstartdate : 이벤트 시작일
eventenddate : 이벤트 종료일
```

### ⏰ 메타 정보 (3개)
```
id : 자동 증가 ID (PRIMARY KEY)
created_at : 생성 시간 (자동)
updated_at : 수정 시간 (자동)
```

## API 엔드포인트

### 1. areaBasedList2 (기본 정보)
- **수집 컬럼**: content_id ~ eventenddate (17개)
- **용도**: 관광지 목록 및 기본 정보 조회

### 2. detailCommon2 (상세 공통 정보)
- **수집 컬럼**: overview, homepage, telname (3개)
- **용도**: 상세 설명 및 연락처 정보

### 3. detailIntro2 (상세 소개 정보)
- **수집 컬럼**: opendate, restdate (2개)
- **용도**: 운영 정보

**총 API 호출**: 1개 관광지당 3회 (기본 정보 + 상세 정보 × 2)

## 설치 및 설정

### 1. 프로젝트 클론

```bash
git clone https://github.com/jangjangji/dataset-.git
cd korea_travel
npm install
```

### 2. API 키 발급

1. [공공데이터포털](https://www.data.go.kr/data/15101578/openapi.do) 접속
2. 회원가입 및 로그인
3. "한국관광공사_국문 관광정보 서비스" API 신청
4. 승인 후 발급된 API 키 확인
5. **트래픽 증가 신청** (마이페이지 > 오픈API > 상세보기 > 트래픽 증가 신청)
   - 일일 트래픽: 10,000 ~ 100,000 권장
   - 사유: 하이브리드 검색 시스템 구축을 위한 데이터 수집

### 3. PostgreSQL 데이터베이스 설정

```bash
# PostgreSQL 서비스 시작
sudo service postgresql start

# 사용자 및 데이터베이스 생성
sudo -u postgres psql -c "CREATE USER jang WITH PASSWORD 'jang';"
sudo -u postgres psql -c "CREATE DATABASE korea OWNER jang;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE korea TO jang;"

# 테이블 생성
psql -U jang -d korea -f schema.sql
```

### 4. 환경변수 설정

`.env.example` 파일을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 수정:

```env
# 한국관광공사 API 키 (디코딩된 형태로 입력)
TOUR_API_KEY=your_decoded_api_key_here

# PostgreSQL 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=korea
DB_USER=jang
DB_PASSWORD=jang

# API 요청 설정
API_BASE_URL=https://apis.data.go.kr/B551011/KorService2
ITEMS_PER_PAGE=100
MAX_PAGES=10
```

**중요**: API 키는 URL 디코딩된 형태로 입력해야 합니다.
- 잘못된 예: `kEX9PvC20lICTKmXbOsb%2FEyOzf7h...`
- 올바른 예: `kEX9PvC20lICTKmXbOsb/EyOzf7h...`

## 사용 방법

### 데이터 수집 실행

```bash
# 개발 모드 (TypeScript 직접 실행)
npm run dev

# 프로덕션 모드
npm run build
npm start
```

### 환경변수 설정

- `MAX_PAGES`: 수집할 최대 페이지 수 (기본값: 10, 전체: 129페이지)
- `ITEMS_PER_PAGE`: 페이지당 항목 수 (기본값: 100)
- `API_BASE_URL`: API 베이스 URL (KorService2 사용)

## 프로젝트 구조

```
korea_travel/
├── src/
│   ├── api/
│   │   └── tourapi.ts          # 한국관광공사 API 클라이언트
│   ├── db/
│   │   ├── connection.ts       # PostgreSQL 연결
│   │   └── repository.ts       # DB 저장 로직
│   ├── services/
│   │   └── collector.ts        # 데이터 수집 서비스
│   ├── types/
│   │   └── index.ts            # TypeScript 타입 정의
│   └── index.ts                # 메인 실행 파일
├── schema.sql                  # DB 스키마 (25개 컬럼)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 기술 스택

- **언어**: TypeScript 5.3+
- **런타임**: Node.js 20+
- **데이터베이스**: PostgreSQL 16+
- **HTTP 클라이언트**: Axios 1.6+
- **DB 드라이버**: node-postgres (pg) 8.11+

## 수집 데이터 현황

- **전체 관광지 수**: 약 12,877개 (2026년 1월 기준)
- **총 페이지 수**: 129페이지
- **API 응답 형식**: JSON
- **데이터 갱신 주기**: 실시간 (한국관광공사 제공)

## 주의사항 및 트러블슈팅

### API 호출 제한
- **딜레이**: 1000ms (1초) 설정 (Rate Limit 방지)
- **429 에러 발생 시**:
  - 일일 트래픽 할당량 초과 → 트래픽 증가 신청 필요
  - 공공데이터포털 마이페이지에서 현재 사용량 확인

### API 키 관련
- API 키는 반드시 디코딩된 형태로 `.env`에 저장
- `%2F` → `/`, `%2B` → `+`, `%3D` → `=` 로 변환

### 데이터베이스
- PostgreSQL 버전 12 이상 권장
- UNIQUE 제약조건으로 중복 방지 (`content_id`)
- UPSERT 방식으로 데이터 업데이트

### Git
- `.env` 파일은 절대 커밋하지 말 것 (`.gitignore`에 포함됨)
- API 키 노출 주의

## 변경 이력

### v1.1.0 (2026-01-04)
- 컬럼 6개 추가 (zipcode, firstimage, firstimage2, booktour, eventstartdate, eventenddate)
- KorService2 API 엔드포인트로 업그레이드
- API 응답 구조 처리 로직 개선 (구버전/신버전 호환)
- Rate Limit 대응 딜레이 1초로 증가
- 총 25개 컬럼으로 확장

### v1.0.0 (2026-01-04)
- 초기 버전 릴리스
- 기본 데이터 수집 기능 구현
- PostgreSQL 저장 기능 구현

## 라이센스

MIT

## 기여자

- jangjangji (https://github.com/jangjangji)

## 문의

이슈 및 문의사항은 GitHub Issues를 통해 남겨주세요.
https://github.com/jangjangji/dataset-/issues
