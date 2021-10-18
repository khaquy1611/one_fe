/* eslint-disable react/react-in-jsx-scope */
import { Rate } from 'antd';
import { isInt } from 'app/validator';
import styled from 'styled-components';

const StyleDev = {
	border: '1px solid #f6efee',
	borderRadius: '0.75rem',
	padding: '0.75rem',
	background: '#fafafa',
};

const CustomCard = styled.div`
	background: #ffffff;
	border: 1px solid #e6e6e6;
	box-sizing: border-box;
	border-radius: 16px;
`;

const OptionRating = ({ criteria, avgRating, ratingPoint, onClick, initRate, className }) => (
	<CustomCard className={`${className} text-center`}>
		{initRate ? (
			<button
				onClick={onClick}
				className={`${
					!initRate && 'cursor-default'
				} bg-white cursor-pointer focus-within:bg-gray-50 p-0 border-0`}
			>
				<Rate
					disabled
					allowHalf
					value={isInt(avgRating) || isInt(ratingPoint)}
					style={{ color: '#F4BF1B' }}
					className="rate-custom"
				/>
				<div className="mt-2.5 font-medium">{criteria}</div>
			</button>
		) : (
			<div className="text-center">
				<Rate
					disabled
					allowHalf
					value={isInt(avgRating) || isInt(ratingPoint)}
					className="block rate-custom"
					style={{ color: '#F4BF1B' }}
				/>
				<div className="mt-2.5 font-medium">{criteria}</div>
			</div>
		)}
	</CustomCard>
);

export default function Evaluate({ data, isSme, title = '', allowRating = '', onClick, initRate, typeTitle }) {
	const defaultEvaluate = [
		{ criteria: 'Đáp ứng đầy đủ yêu cầu của Doanh nghiệp', avgRating: 0 },
		{ criteria: 'Tốc độ xử lý nhanh', avgRating: 0 },
		{ criteria: 'Giao diện thân thiện, dễ sử dụng', avgRating: 0 },
		{ criteria: 'Hỗ trợ từ nhà cung cấp nhiệt tình chu đáo', avgRating: 0 },
	];
	return (
		<div style={typeTitle && StyleDev}>
			<div className={`font-bold text-xl text-primary mb-8 ${typeTitle ? '' : 'uppercase'}`}>{title}</div>
			{data?.ratingQuantity !== 0 || allowRating === 'YES' || !isSme ? (
				<div className="grid grid-cols-4 tablet:grid-cols-2 gap-8 tablet:gap-4">
					{data &&
						data.ratingDetail?.map((item, i) => (
							<OptionRating
								className="p-6 tablet:p-4"
								criteria={item.criteria}
								avgRating={item.avgRating}
								ratingPoint={item.ratingPoint}
								initRate={initRate}
								onClick={onClick}
								key={`${i + 1}`}
							/>
						))}
					{!data &&
						defaultEvaluate.map((item, i) => (
							<OptionRating
								className="p-6 tablet:p-4"
								criteria={item.criteria}
								avgRating={item.avgRating}
								ratingPoint={item.ratingPoint}
								initRate={initRate}
								onClick={onClick}
								key={`${i + 1}`}
							/>
						))}
				</div>
			) : (
				''
			)}
		</div>
	);
}
