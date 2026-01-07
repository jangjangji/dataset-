// 한국관광공사 API 응답 타입 정의

export interface TouristAttraction {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1?: string;
  addr2?: string;
  zipcode?: string;
  tel?: string;
  mapx?: string;
  mapy?: string;
  areacode?: string;
  sigungucode?: string;
  cat1?: string;
  firstimage?: string;
  firstimage2?: string;
  overview?: string;
  homepage?: string;
  telname?: string;
  opendate?: string;
  restdate?: string;
  booktour?: string;
  eventstartdate?: string;
  eventenddate?: string;
}

export interface ApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}
