import Base from './Base';

class AdminSubscription extends Base {
	// Yêu cầu tạo hợp đồng điện tử
	postCreateEContract = (id) => this.apiPostWithoutPrefix(`/api/sme-portal/subscription/${id}/e-contract`);

	// Lấy danh sách hợp đồng điện tử
	getAllPaginationEContract = async (query) => {
		let res = [];
		res = await this.apiGet('/e-contract', query);
		const result = {
			content: res?.data,
			totalElements: res?.totalElements,
			size: res?.size,
		};
		return this.formatResPagination(result);
	};

	// Xem chi tiết hợp đồng điện tử
	getDetailEContract = async (id) => {
		const res = await this.apiGetWithoutPrefix(`/api/sme-portal/subscription/${id}/e-contract`);
		let data = {};
		try {
			data = JSON.parse(res.data);
			if (data.object.uri) {
				const blobData = await fetch(data.object.uri).then((t) =>
					t.blob().then(
						(b) =>
							new Blob([b], {
								type: 'application/pdf',
							}),
					),
				);
				data.object.uri = URL.createObjectURL(blobData);
			}

			// eslint-disable-next-line no-empty
		} catch (error) {}
		return {
			...res,
			data: data?.object,
		};
	};

	// Tải về hợp đồng điện tử
	downloadDetailEContract = async (id) => {
		const res = await this.apiGetWithoutPrefix(`/api/sme-portal/subscription/${id}/e-contract`);
		let data = {};
		try {
			data = JSON.parse(res.data);
			if (data.object.uri) {
				const blobData = await fetch(data.object.uri).then((t) =>
					t.blob().then(
						(b) =>
							new Blob([b], {
								type: 'application/pdf',
							}),
					),
				);
				return blobData;
			}
			// eslint-disable-next-line no-empty
		} catch (error) {}
		return null;
	};
}
export default new AdminSubscription('/admin-portal/subscription');
