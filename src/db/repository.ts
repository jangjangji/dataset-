import { query } from './connection';
import { TouristAttraction } from '../types';

export const insertTouristAttraction = async (data: TouristAttraction) => {
  const sql = `
    INSERT INTO tourist_attractions (
      content_id, content_type_id, title, addr1, addr2, zipcode, tel,
      map_x, map_y, area_code, sigungu_code, cat1,
      firstimage, firstimage2,
      overview, homepage, telname, opendate, restdate,
      booktour, eventstartdate, eventenddate
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    ON CONFLICT (content_id) DO UPDATE SET
      title = EXCLUDED.title,
      addr1 = EXCLUDED.addr1,
      addr2 = EXCLUDED.addr2,
      zipcode = EXCLUDED.zipcode,
      tel = EXCLUDED.tel,
      map_x = EXCLUDED.map_x,
      map_y = EXCLUDED.map_y,
      area_code = EXCLUDED.area_code,
      sigungu_code = EXCLUDED.sigungu_code,
      cat1 = EXCLUDED.cat1,
      firstimage = EXCLUDED.firstimage,
      firstimage2 = EXCLUDED.firstimage2,
      overview = EXCLUDED.overview,
      homepage = EXCLUDED.homepage,
      telname = EXCLUDED.telname,
      opendate = EXCLUDED.opendate,
      restdate = EXCLUDED.restdate,
      booktour = EXCLUDED.booktour,
      eventstartdate = EXCLUDED.eventstartdate,
      eventenddate = EXCLUDED.eventenddate,
      updated_at = CURRENT_TIMESTAMP
  `;

  const values = [
    data.contentid,
    data.contenttypeid,
    data.title,
    data.addr1 || null,
    data.addr2 || null,
    data.zipcode || null,
    data.tel || null,
    data.mapx ? parseFloat(data.mapx) : null,
    data.mapy ? parseFloat(data.mapy) : null,
    data.areacode || null,
    data.sigungucode || null,
    data.cat1 || null,
    data.firstimage || null,
    data.firstimage2 || null,
    data.overview || null,
    data.homepage || null,
    data.telname || null,
    data.opendate || null,
    data.restdate || null,
    data.booktour || null,
    data.eventstartdate || null,
    data.eventenddate || null,
  ];

  try {
    await query(sql, values);
    return true;
  } catch (error) {
    console.error('❌ DB 저장 실패:', data.contentid, error);
    return false;
  }
};

export const getAttractionCount = async (): Promise<number> => {
  const result = await query('SELECT COUNT(*) FROM tourist_attractions');
  return parseInt(result.rows[0].count);
};
