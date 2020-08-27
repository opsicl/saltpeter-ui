import React from 'react';

const CustomDOMField = ({ record = {}, source }) => {
	if (record[source] == "*"){
		var currentDate = new Date();
                var currentDayofMonth = currentDate.getDate();
		return (<span> { currentDayofMonth } </span>)
	} else {
		return (<span> { record[source] } </span>)
	};
}

export default CustomDOMField;

