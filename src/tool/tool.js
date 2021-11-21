import jsSHA from "jssha"
import { addIndex, map } from "ramda"
export function GetAuthorizationHeader() {
  const AppID = process.env.REACT_APP_APP_ID || ""
  const AppKey = process.env.REACT_APP_APP_KEY || ""

  const GMTString = new Date().toUTCString();
  const ShaObj = new jsSHA('SHA-1', 'TEXT');
  ShaObj.setHMACKey(AppKey, 'TEXT');
  ShaObj.update('x-date: ' + GMTString);
  const HMAC = ShaObj.getHMAC('B64');
  const Authorization = `hmac username="${AppID}", algorithm="hmac-sha1", headers="x-date", signature="${HMAC}"`;

  return { 'Authorization': Authorization, 'X-Date': GMTString /*,'Accept-Encoding': 'gzip'*/}; //如果要將js運行在伺服器，可額外加入 'Accept-Encoding': 'gzip'，要求壓縮以減少網路傳輸資料量
}

export const mapIndexed = addIndex(map); 