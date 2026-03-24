import axios from 'axios';
axios.post('https://wandbox.org/api/compile.json', {
  code: "print('Hello Wandbox!')",
  compiler: "cpython-3.10.2"
}).then(r => console.log(r.data)).catch(err => console.error(err.message));
