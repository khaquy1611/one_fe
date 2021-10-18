import { Rate } from 'antd';
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const ImgCustomize = styled.img`
	object-fit: cover;
	width: 100%;
	border-radius: 5px;
`;

const CardCustomize = styled.div`
	border: 1px solid #f6efee;
	box-sizing: border-box;
	border-radius: 10px;
	background: #fffdfd;
	&:hover {
		transition: box-shadow 0.3s, border-color 0.3s;
		border-color: transparent;
		box-shadow: 0 1px 2px -2px rgb(0 0 0 / 16%), 0 3px 6px 0 rgb(0 0 0 / 12%), 0 5px 12px 4px rgb(0 0 0 / 9%);
	}
	.line-clamp {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
`;

const CardCommom = ({
	srcImg,
	altImage,
	valueDefaultRate,
	valueRating,
	height,
	classImg,
	classRateValue,
	classRate,
	title,
}) => (
	<CardCustomize>
		<div className="p-2.5">
			<div className="card-image h-full w-full">
				<ImgCustomize
					src={srcImg}
					alt={altImage}
					className={`cursor-pointer ${classImg}`}
					style={{ height: `${height}rem` }}
				/>
			</div>
			<p className="mt-3 text-base font-semibold line-clamp cursor-pointer">{title}</p>
			<div className="flex items-center">
				<Rate allowHalf defaultValue={valueDefaultRate} className={`${classRate} text-yellow-400`} />
				<p className={`${classRateValue} text-gray-400 flex ml-2 mt-1`}>{valueRating}</p>
			</div>
		</div>
	</CardCustomize>
);
CardCommom.propTypes = {
	srcImg: PropTypes.string,
	altImage: PropTypes.string,
	classImg: PropTypes.string,
	classRateValue: PropTypes.string,
	classRate: PropTypes.string,
	valueDefaultRate: PropTypes.number,
	valueRating: PropTypes.number,
	height: PropTypes.number,
	title: PropTypes.string,
};

CardCommom.defaultProps = {
	srcImg: 'https://baoquocte.vn/stores/news_dataimages/dangtuan/082019/16/08/in_article/cuoc-choi-song-con.jpg',
	title: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Adipisci in dolores et minus praesentium',
	altImage: 'image example',
	classImg: '',
	classRateValue: '',
	classRate: '',
	valueDefaultRate: 4.5,
	valueRating: 8.325,
	height: 8.25,
};
export default CardCommom;
