import React from 'react';
import { List, Datagrid, TextField } from 'admin-on-rest';
import CustomYearField from './components/CustomYearField';
import CustomMonthField from './components/CustomMonthField';
import CustomDOWField from './components/CustomDOWField';
import CustomDOMField from './components/CustomDOMField';

export const CronList = (props) => (
    <List {...props}>
        <Datagrid>
            <TextField source="id" />
            <TextField source="command" />
            <TextField source="user" />
            <TextField source="cwd" />
            <TextField source="targets" />
            <CustomYearField source="year" />
            <CustomMonthField source="mon" />
            <CustomDOWField source="dow" />
            <CustomDOMField source="dom" />
         </Datagrid>
    </List>
);

