import React from 'react';
import { Admin, Resource } from 'admin-on-rest';
import SPClient from './saltpeter/sp_rest_client';

import { CronList } from './crons';

const App = () => (
    <Admin restClient={SPClient('http://mon02.storm.lan:8888')}>
        <Resource name="crons" list={CronList} />
    </Admin>
);

export default App;
