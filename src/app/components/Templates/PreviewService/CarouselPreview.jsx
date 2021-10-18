/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable react/jsx-boolean-value */
import React from 'react';
import PropTypes from 'prop-types';
import ImageGallery from 'app/components/Molecules/GaleryService/ImageGallery';
import { PlayCircleOutlined } from '@ant-design/icons';

function renderVideo(videoUrl, isExternalVideo) {
	if (!isExternalVideo) {
		return (
			<div className="wrap-video">
				<video
					width="100%"
					controls
					disablePictureInPicture={true}
					controlsList="nodownload"
					src={videoUrl}
					className="image-gallery-image"
				/>
			</div>
		);
	}
	return (
		<div className="wrap-video relative h-0 " style={{ paddingTop: '56.25%' }}>
			<iframe
				title={videoUrl}
				width="100%"
				height="100%"
				src={videoUrl}
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				className="image-gallery-image top-0 left-0 absolute"
			/>
		</div>
	);
}
function renderVideoThumbnail(videoUrl, isExternalVideo) {
	if (!isExternalVideo) {
		return (
			<span className="image-gallery-thumbnail-inner">
				<PlayCircleOutlined className="absolute block top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-3xl transform leading-0" />
				<video
					width="100%"
					controls={false}
					disablePictureInPicture={true}
					controlsList="nodownload"
					src={videoUrl}
					className="image-gallery-thumbnail-image"
				/>
			</span>
		);
	}
	const videoSplit = videoUrl.split('/');
	const videoID = videoSplit[videoSplit.length - 1];
	const urlThumbnail = `http://i3.ytimg.com/vi/${videoID}/hqdefault.jpg`;
	return (
		<span className="image-gallery-thumbnail-inner">
			<PlayCircleOutlined className="absolute block top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-3xl transform leading-0" />
			<img title={videoUrl} src={urlThumbnail} className="image-gallery-thumbnail-image" alt={videoUrl} />
		</span>
	);
}
const CarouselPreview = ({ className, imageArray, videoUrl, name = 'panels' }) => {
	const isExternalVideo = React.useMemo(() => {
		const reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\?v=)([^#&?]*).*/;
		const match = videoUrl?.match(reg);
		return match;
	}, []);
	const panels = imageArray.map((item) => ({
		original: item.urlImg,
		thumbnail: item.urlImg,
		originalClass: 'featured-slide',
		thumbnailClass: 'featured-thumb',
		originalTitle: name,
		thumbnailTitle: name,
		originalAlt: name,
		thumbnailAlt: name,
	}));

	if (videoUrl) {
		panels.unshift({
			// original: item.urlImg,
			// thumbnail: item.urlImg,
			originalClass: 'featured-slide slide-video',
			thumbnailClass: 'featured-thumb',
			title: name,
			renderItem: () => renderVideo(videoUrl, isExternalVideo),
			renderThumbInner: () => renderVideoThumbnail(videoUrl, isExternalVideo),
		});
	}

	if (!panels.length) {
		return null;
	}
	return (
		<div className={className}>
			<ImageGallery
				items={panels}
				showThumbnails={panels.length > 1}
				showPlayButton={panels.length > 1}
				showNav={panels.length > 1}
				// slideOnThumbnailOver
			/>
		</div>
	);
};
CarouselPreview.propTypes = {
	className: PropTypes.string,
	imageArray: PropTypes.arrayOf(PropTypes.object),
	videoUrl: PropTypes.string,
};
CarouselPreview.defaultProps = {
	className: '',
	imageArray: [],
	videoUrl: '',
};
export default CarouselPreview;
