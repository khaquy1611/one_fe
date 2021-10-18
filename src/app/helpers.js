import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { pick } from 'opLodash';

import { FlagON, FlagOS } from './icons';
import { getAccessToken } from './models/Base';

export function getFlag(serviceOwner) {
	if (serviceOwner === 'VNPT' || serviceOwner === 'SAAS') return FlagON;
	return serviceOwner ? FlagOS : null;
}

export function queryCache(key, cacheTime = 10) {
	const getData = () => {
		try {
			let data = localStorage.getItem(key);
			if (data) {
				data = JSON.parse(data);
			}
			if (data && parseInt(data.expiredTime, 10) > new Date().getTime()) {
				return data.content;
			}
			localStorage.setItem(key, null);
			return null;
		} catch (e) {
			console.warn(e);
			return null;
		}
	};
	const setData = (data) => {
		try {
			localStorage.setItem(
				key,
				JSON.stringify({ content: data, expiredTime: new Date().getTime() + cacheTime * 60 * 1000 }),
			);
		} catch (e) {
			console.warn(e);
			localStorage.setItem(key, null);
		}
	};
	return {
		getData,
		setData,
	};
}

export function onClickDocs(portal = 'sme') {
	window.open(`${process.env.REACT_APP_DOCS}/docs/${portal}/gioi-thieu?token=${getAccessToken()}`);
}
// STC dev
function fitToColumn(arrayOfArray) {
	return arrayOfArray[0].map((a, i) => ({
		wch: Math.max(...arrayOfArray.map((a2) => a2[i].toString().length)),
	}));
}
export function exportData(header, csvData, fileName, fileExtension) {
	const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

	const ws = XLSX.utils.json_to_sheet(csvData);
	XLSX.utils.sheet_add_aoa(ws, header);
	XLSX.utils.sheet_add_json(ws, csvData, { skipHeader: true, origin: 'A2' });
	ws['!cols'] = fitToColumn(header);
	const wb = { Sheets: { data: ws }, SheetNames: ['data'] };

	const excelBuffer = XLSX.write(wb, { bookType: fileExtension, type: 'array' });

	const data = new Blob([excelBuffer], { type: fileType });
	FileSaver.saveAs(data, `${fileName}.${fileExtension}`);
}
export function parseQueryStringToObjectStc(stringObj) {
	// ex : code==*A*;couponSetId==1;status==1

	const check = typeof stringObj === 'string';
	if (!check) return {};
	const arr = stringObj.split(';'); // ['code==*A*','couponSetId==1']
	const result = {};
	arr.forEach((item) => {
		if (item.includes('==')) {
			const subItem = item.split('=='); // [code , *A*]
			result[subItem[0].trim()] = subItem[1].trim();
		}
		if (item.includes('=in=')) {
			const subItem = item.split('=in=');
			const value = subItem[1]
				.toString()
				.substring(subItem[1].length - 1, 1)
				.split(',');
			const tmp = value.map((xx) => +xx);
			result[subItem[0].trim()] = tmp;
		}
	});
	return result;
}
export function parseObjToQueryString(obj) {
	const check = typeof obj === 'object';
	if (!check) return '';
	// [ [code , a] , [status,''] ]
	return Object.entries(obj)
		.map((item) => {
			if (item[1]) {
				if (Array.isArray(item[1])) {
					return `${item[0]}=in=(${item[1].join()})`;
				}
				return `${item[0]}==${item[1]}`;
			}
			return null;
		})
		.filter((item) => item != null)
		.join(';');
}
export function pickObj(obj, propertyArr) {
	return pick(obj, propertyArr);
}
