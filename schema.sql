-- 한국 관광지 정보 테이블
-- 한국관광공사 API 데이터 저장용

CREATE TABLE IF NOT EXISTS tourist_attractions (
  id SERIAL PRIMARY KEY,

  -- 기본 정보
  content_id VARCHAR(20) UNIQUE NOT NULL,
  content_type_id VARCHAR(10) NOT NULL,
  title VARCHAR(500) NOT NULL,
  addr1 TEXT,
  addr2 TEXT,
  zipcode VARCHAR(10),
  tel VARCHAR(50),
  map_x DECIMAL(20, 17),
  map_y DECIMAL(20, 17),
  area_code VARCHAR(10),
  sigungu_code VARCHAR(10),
  cat1 VARCHAR(10),

  -- 이미지 정보
  firstimage TEXT,
  firstimage2 TEXT,

  -- 상세 정보
  overview TEXT,
  homepage TEXT,
  telname VARCHAR(100),
  opendate VARCHAR(100),
  restdate VARCHAR(200),

  -- 이벤트/투어 정보
  booktour VARCHAR(5),
  eventstartdate VARCHAR(10),
  eventenddate VARCHAR(10),

  -- 메타 정보
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
