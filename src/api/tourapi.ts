import axios from 'axios';
import dotenv from 'dotenv';
import { ApiResponse, TouristAttraction } from '../types';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'https://apis.data.go.kr/B551011/KorService2';
const API_KEY = process.env.TOUR_API_KEY;
const ITEMS_PER_PAGE = parseInt(process.env.ITEMS_PER_PAGE || '100');

// 1. 기본 관광지 목록 조회
export const fetchAreaBasedList = async (pageNo: number = 1) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/areaBasedList2`, {
      params: {
        serviceKey: API_KEY,
        numOfRows: ITEMS_PER_PAGE,
        pageNo: pageNo,
        MobileOS: 'ETC',
        MobileApp: 'KoreaTravelCollector',
        _type: 'json',
        contentTypeId: 12, // 12 = 관광지
        arrange: 'A', // 제목순 정렬
      },
    });

    const data = response.data;

    // API 응답 구조 확인
    if (data.response) {
      // 구버전 응답 구조
      if (data.response.header.resultCode !== '0000') {
        throw new Error(`API Error: ${data.response.header.resultMsg}`);
      }
      return data.response.body;
    } else {
      // 신버전 응답 구조
      if (data.resultCode !== '0') {
        throw new Error(`API Error: ${data.resultMsg}`);
      }
      return {
        items: { item: data.items || [] },
        numOfRows: data.numOfRows || ITEMS_PER_PAGE,
        pageNo: data.pageNo || pageNo,
        totalCount: data.totalCount || 0,
      };
    }
  } catch (error) {
    console.error('❌ areaBasedList API 호출 실패:', error);
    throw error;
  }
};

// 2. 상세 공통 정보 조회 (overview, homepage 등)
export const fetchDetailCommon = async (contentId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/detailCommon2`, {
      params: {
        serviceKey: API_KEY,
        MobileOS: 'ETC',
        MobileApp: 'KoreaTravelCollector',
        _type: 'json',
        contentId: contentId,
        defaultYN: 'Y',
        firstImageYN: 'N',
        areacodeYN: 'N',
        catcodeYN: 'N',
        addrinfoYN: 'N',
        mapinfoYN: 'N',
        overviewYN: 'Y',
      },
    });

    const data = response.data;

    // API 응답 구조 확인
    if (data.response) {
      // 구버전
      if (data.response.header.resultCode !== '0000') return null;
      const items = data.response.body.items?.item;
      return items && items.length > 0 ? items[0] : null;
    } else {
      // 신버전
      if (data.resultCode !== '0') return null;
      const items = data.items;
      return items && items.length > 0 ? items[0] : null;
    }
  } catch (error) {
    console.error(`❌ detailCommon API 호출 실패 (${contentId}):`, error);
    return null;
  }
};

// 3. 상세 소개 정보 조회 (opendate, restdate 등)
export const fetchDetailIntro = async (contentId: string, contentTypeId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/detailIntro2`, {
      params: {
        serviceKey: API_KEY,
        MobileOS: 'ETC',
        MobileApp: 'KoreaTravelCollector',
        _type: 'json',
        contentId: contentId,
        contentTypeId: contentTypeId,
      },
    });

    const data = response.data;

    // API 응답 구조 확인
    if (data.response) {
      // 구버전
      if (data.response.header.resultCode !== '0000') return null;
      const items = data.response.body.items?.item;
      return items && items.length > 0 ? items[0] : null;
    } else {
      // 신버전
      if (data.resultCode !== '0') return null;
      const items = data.items;
      return items && items.length > 0 ? items[0] : null;
    }
  } catch (error) {
    console.error(`❌ detailIntro API 호출 실패 (${contentId}):`, error);
    return null;
  }
};

// 4. 전체 데이터 조합 (기본 정보 + 상세 정보)
export const fetchCompleteData = async (contentId: string, contentTypeId: string, baseData: any): Promise<TouristAttraction> => {
  // 병렬로 상세 정보 가져오기
  const [detailCommon, detailIntro] = await Promise.all([
    fetchDetailCommon(contentId),
    fetchDetailIntro(contentId, contentTypeId),
  ]);

  return {
    contentid: baseData.contentid,
    contenttypeid: baseData.contenttypeid,
    title: baseData.title,
    addr1: baseData.addr1,
    addr2: baseData.addr2,
    zipcode: baseData.zipcode,
    tel: baseData.tel,
    mapx: baseData.mapx,
    mapy: baseData.mapy,
    areacode: baseData.areacode,
    sigungucode: baseData.sigungucode,
    cat1: baseData.cat1,
    firstimage: baseData.firstimage,
    firstimage2: baseData.firstimage2,
    overview: detailCommon?.overview,
    homepage: detailCommon?.homepage,
    telname: detailCommon?.telname,
    opendate: detailIntro?.opendate,
    restdate: detailIntro?.restdate,
    booktour: baseData.booktour,
    eventstartdate: baseData.eventstartdate,
    eventenddate: baseData.eventenddate,
  };
};
