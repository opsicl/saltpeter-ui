import React from 'react';

const CustomDOWField = ({ record = {}, source }) => {
	if (record[source] == "*"){
		var currentDate = new Date();
                var currentDayOfWeek = currentDate.getDay();
		return (<span> { currentDayOfWeek } </span>)
	} else {
		return (<span> { record[source] } </span>)
	};
}

export default CustomDOWField;
