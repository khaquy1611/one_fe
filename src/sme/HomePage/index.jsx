import React from 'react';
import { Banner } from 'sme/components';
import CategoryBlock from './components/CategoryBlock';
import ComboBlock from './components/ComboBlock';
import PopularService from './components/PopularService';

export default function HomePage() {
	return (
		<div>
			<Banner className="mt-32 pt-2 mb-16 mobile:mt-20" />
			<PopularService />
			<ComboBlock />
			<CategoryBlock />
		</div>
	);
}
