import Base from './Base';

export const SLEEP = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
class BillingDev extends Base {
	tagStatus = {
		// paymentStatusOptions
		INIT: {
			color: 'default',
			text: 'init',
			value: 'INIT',
		},
		WAITING: {
			color: 'processing',
			text: 'unpaid',
			value: 'WAITING',
		},
		PAID: {
			color: 'success',
			text: 'paid',
			value: 'PAID',
		},
		FAILURE: {
			color: 'error',
			text: 'paymentFailed',
			value: 'FAILURE',
		},
		OUT_OF_DATE: {
			color: 'warning',
			text: 'outOfDate',
			value: 'OUT_OF_DATE',
		},
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
}

export default new BillingDev('/dev-portal/billings');
