import { useState } from 'react';
import { useQuery } from 'react-query';
import { CityInfor } from 'app/models';
import useUser from 'app/hooks/useUser';
import { isEmpty } from 'opLodash';

export default function useSelectLocation() {
	const { user } = useUser();
	const [countryId, setCountryId] = useState(user.countryId || 1);
	const [countryCode, setCountryCode] = useState(user?.countryCode); // Chưa có giá trị này, sau get detail còn BE trả thêm
	const [provinceId, setProvinceId] = useState(user.provinceId);
	const [districtId, setDistrictId] = useState(user.districtId);
	const [wardId, setWardId] = useState(user.wardId);
	const [streetId, setStreetId] = useState(user.streetId);
	const [countryList, setCountryList] = useState([]);
	const [provinceList, setProvinceList] = useState([]);
	const [districtList, setDistrictList] = useState([]);
	const [wardList, setWardList] = useState([]);
	const [streetList, setStreetList] = useState([]);

	// Giá trị quốc gia
	const { isFetching: loadingCountry } = useQuery(
		['getAllNation'],
		async () => {
			let res = await CityInfor.getAllNation();
			res = res.map((item) => ({ value: item.id, label: item.name }));
			setCountryList(res);
			return res;
		},
		{
			initialData: [],
		},
	);

	// Giá trị tỉnh thành
	const { isFetching: loadingProvince } = useQuery(
		['getProvinceById', countryId],
		async () => {
			const res = await CityInfor.getProvinceById(countryId);
			const temp = res.map((item) => ({
				value: `${item.id}/${item.code ? item.code : ''}`,
				name: item.name,
				label: item.name,
			}));
			setProvinceList(temp);
			return temp;
		},
		{
			initialData: [],
			enabled: !!countryId && countryId > -1,
		},
	);

	// Giá trị quận huyện
	const { isFetching: loadingDistrict } = useQuery(
		['getDistrictById', provinceId, countryCode],
		async () => {
			const res = await CityInfor.getDistrictById(provinceId, countryCode);
			const temp = res.map((item) => ({
				value: item.id,
				label: item.name,
			}));
			setDistrictList(temp);
			return temp;
		},
		{
			initialData: [],
			enabled: !!provinceId && provinceId > -1 && !isEmpty(countryCode),
			staleTime: 0,
		},
	);

	// Giá trị phường xã
	const { isFetching: loadingWard } = useQuery(
		['getWardById', districtId],
		async () => {
			const res = await CityInfor.getWardById(districtId, countryCode);
			const temp = res.map((item) => ({
				value: item.id,
				label: item.name,
			}));
			setWardList(temp);
			return temp;
		},
		{
			initialData: [],
			enabled: !!districtId && districtId > -1 && !isEmpty(countryCode),
			staleTime: 0,
		},
	);

	// Giá trị phố
	const { isFetching: loadingStreet } = useQuery(
		['getStreetById', wardId],
		async () => {
			const res = await CityInfor.getStreetById(wardId, countryCode);
			const temp = res.map((item) => ({
				value: item.id,
				label: item.name,
			}));
			setStreetList(temp);
			return temp;
		},
		{
			initialData: [],
			enabled: !!wardId && wardId > -1 && !isEmpty(countryCode),
			staleTime: 0,
		},
	);

	return {
		countryId,
		setCountryId,
		setCountryCode,
		provinceId,
		setProvinceId,
		districtId,
		setDistrictId,
		wardId,
		setWardId,
		streetId,
		setStreetId,
		countryList,
		setCountryList,
		provinceList,
		setProvinceList,
		districtList,
		setDistrictList,
		wardList,
		setWardList,
		streetList,
		setStreetList,
		loadingCountry,
		loadingProvince,
		loadingDistrict,
		loadingWard,
		loadingStreet,
	};
}
