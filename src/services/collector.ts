import { fetchAreaBasedList, fetchCompleteData } from '../api/tourapi';
import { insertTouristAttraction, getAttractionCount } from '../db/repository';

const MAX_PAGES = parseInt(process.env.MAX_PAGES || '10');
const DELAY_MS = 1000; // API 호출 간 대기 시간 (rate limit 방지 - 1초)

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const collectAndSaveData = async () => {
  let totalProcessed = 0;
  let totalSaved = 0;
  let totalFailed = 0;

  console.log('📡 데이터 수집 시작...\n');

  try {
    // 1. 첫 페이지 호출해서 전체 개수 확인
    const firstPage = await fetchAreaBasedList(1);
    const totalCount = firstPage.totalCount;
    const totalPages = Math.ceil(totalCount / firstPage.numOfRows);
    const pagesToFetch = Math.min(totalPages, MAX_PAGES);

    console.log(`📊 전체 관광지 수: ${totalCount}개`);
    console.log(`📄 총 페이지 수: ${totalPages}페이지`);
    console.log(`🔄 수집할 페이지: ${pagesToFetch}페이지\n`);

    // 2. 페이지별로 데이터 수집
    for (let page = 1; page <= pagesToFetch; page++) {
      console.log(`\n📖 [${page}/${pagesToFetch}] 페이지 처리 중...`);

      try {
        const pageData = await fetchAreaBasedList(page);
        const items = pageData.items?.item || [];

        if (items.length === 0) {
          console.log('   ⚠️  데이터 없음, 다음 페이지로...');
          continue;
        }

        console.log(`   ✓ ${items.length}개 항목 조회됨`);

        // 3. 각 항목에 대해 상세 정보 가져오기 및 저장
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          totalProcessed++;

          try {
            console.log(`   [${i + 1}/${items.length}] ${item.title} (${item.contentid}) 처리 중...`);

            // 상세 정보 조합
            const completeData = await fetchCompleteData(
              item.contentid,
              item.contenttypeid,
              item
            );

            // DB 저장
            const saved = await insertTouristAttraction(completeData);

            if (saved) {
              totalSaved++;
              console.log(`      ✅ 저장 성공`);
            } else {
              totalFailed++;
              console.log(`      ❌ 저장 실패`);
            }

            // Rate limit 방지를 위한 대기
            await delay(DELAY_MS);

          } catch (error) {
            totalFailed++;
            console.error(`      ❌ 처리 실패:`, error);
          }
        }

        console.log(`   ✓ 페이지 처리 완료 (성공: ${totalSaved}, 실패: ${totalFailed})`);

      } catch (error) {
        console.error(`   ❌ 페이지 ${page} 처리 실패:`, error);
      }
    }

    // 4. 최종 결과 출력
    console.log('\n' + '='.repeat(60));
    console.log('📊 수집 완료!');
    console.log('='.repeat(60));
    console.log(`✅ 총 처리: ${totalProcessed}개`);
    console.log(`✅ 저장 성공: ${totalSaved}개`);
    console.log(`❌ 저장 실패: ${totalFailed}개`);

    const dbCount = await getAttractionCount();
    console.log(`💾 DB 총 레코드 수: ${dbCount}개`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ 데이터 수집 중 오류 발생:', error);
    throw error;
  }
};
