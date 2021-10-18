class Resize {
	static resizeAndRotateImage(image) {
		const maxWidth = 60;
		const maxHeight = 60;
		const qualityDecimal = 100 / 100;
		const canvas = document.createElement('canvas');

		canvas.width = maxWidth;
		canvas.height = maxHeight;

		const ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0, maxWidth, maxHeight);

		return canvas.toDataURL(`image/jpeg`, qualityDecimal);
	}

	static createResizedImage(file, responseUriFunc) {
		const reader = new FileReader();
		if (file) {
			reader.readAsDataURL(file);
			reader.onload = () => {
				const image = new Image();
				image.src = reader.result;
				image.onload = () => {
					const resizedDataUrl = Resize.resizeAndRotateImage(image);
					responseUriFunc(resizedDataUrl);
				};
			};
			reader.onerror = (error) => {
				throw Error(error);
			};
		}
	}
}
export default {
	imageFileResize: Resize.createResizedImage,
};
