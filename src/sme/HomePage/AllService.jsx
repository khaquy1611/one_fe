import { SmeService } from 'app/models';
import React from 'react';
import AllProduct from './components/AllProduct';

export default function AllService() {
	return <AllProduct fnCall={SmeService.getAllPaginationByType} textAllProduct="allProduct" />;
}
