import React from 'react';

const CustomYearField = ({ record = {}, source }) => {
	if (record[source] == "*"){
		var currentDate = new Date();
                var currentYear = currentDate.getFullYear();
		return (<span> { currentYear } </span>)
	} else {
		return (<span> { record[source] } </span>)
	};
}

export default CustomYearField;
