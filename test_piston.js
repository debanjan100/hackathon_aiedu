import axios from 'axios';
axios.post('https://emkc.org/api/v2/piston/execute', {
  language: "javascript",
  version: "18.15.0",
  files: [{content: "console.log('hi');"}]
}).then(r => console.log(r.data)).catch(err => console.error(err.response ? err.response.data : err.message));
