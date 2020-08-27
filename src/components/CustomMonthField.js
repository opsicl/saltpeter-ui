import React from 'react';

const CustomMonthField = ({ record = {}, source }) => {
	if (record[source] == "*"){
		var currentDate = new Date();
                var currentMonth = currentDate.getMonth();
		return (<span> { currentMonth + 1 } </span>)
	} else {
		return (<span> { record[source] } </span>)
	};

}

export default CustomMonthField;

