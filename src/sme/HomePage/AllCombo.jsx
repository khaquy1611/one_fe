import { ComboSME } from 'app/models';
import React from 'react';
import AllProduct from './components/AllProduct';

export default function AllCombo() {
	return <AllProduct fnCall={ComboSME.getListCombo} textAllProduct="allCombo" isCombo />;
}
