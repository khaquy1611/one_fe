import superagent from 'superagent';
import Base from './Base';

export const SLEEP = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
class BillingPortal extends Base {
	tagStatus = {
		// paymentStatusOptions
		INIT: {
			color: '#78909C',
			text: 'init',
			value: 'INIT',
		},
		WAITING: {
			color: '#FFBE5B',
			text: 'unpaid',
			value: 'WAITING',
		},
		PAID: {
			color: '#50B98F',
			text: 'paid',
			value: 'PAID',
		},
		FAILURE: {
			color: '#F77178',
			text: 'paymentFailed',
			value: 'FAILURE',
		},
		OUT_OF_DATE: {
			color: '#252525',
			text: 'outOfDate',
			value: 'OUT_OF_DATE',
		},
	};

	Payment = async (id) => {
		const ipAddress = await this.getClientIp();
		const res = await this.apiPost(`/payment?ipAddress=${ipAddress}`, {
			billingId: id,
		});
		return res;
	};

	PublishBill = async (id) => {
		const res = await this.apiPost(`/${id}/e-invoice`);
		return res;
	};

	downloadEInvoicePdf = async (fkey) => {
		const res = await this.apiDownload(`/e-invoice/${fkey}/download-pdf`);
		return res;
	};

	downloadEInvoice = async (fkey) => {
		const res = await this.apiGet(`/e-invoice/${fkey}/download`);
		res.content = this.decodeXmlTag(res.content);
		return new Blob([res.content], { type: 'text/plain' });
	};

	viewEInvoice = async (fkey) => {
		const res = await this.apiGet(`/e-invoice/${fkey}`);
		res.content = this.decodeXmlTag(res.content);
		return res;
	};

	decodeXmlTag = (stringData) => {
		let contentDecode = stringData.replace(/&gt;/g, '>');
		contentDecode = contentDecode.replace(/&lt;/g, '<');
		contentDecode = contentDecode.replace(/&quot;/g, '"');
		contentDecode = contentDecode.replace(/&apos;/g, "'");
		contentDecode = contentDecode.replace(/&amp;/g, '&');
		return contentDecode;
	};

	b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
		const byteCharacters = atob(b64Data);
		const byteArrays = [];

		for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			const slice = byteCharacters.slice(offset, offset + sliceSize);

			const byteNumbers = new Array(slice.length);
			for (let i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			const byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}

		const blob = new Blob(byteArrays, { type: contentType });
		return blob;
	};

	AjustBill = async (data) => {
		const res = await this.apiPut(`/${data.id}/e-invoice`, data.body);
		return res;
	};
}
export default new BillingPortal('/sme-portal/billings');
