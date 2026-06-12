const http = require('https');

const variations = [
  // 1. Standard keys
  {
    payload: {
      User: 'o.taha',
      PlatForm: 'web',
      AppVersionWeb: '33',
      AndroidVersion: '33',
      IOSVersion: '33',
      FireBaseToken: '',
      DatabaseIP: '45.32.255.109',
      DatabaseName: 'Visit',
      operation: 'Get Visit List'
    },
    sp: 'APIVisitOperation'
  },
  // 2. Capitalized Operation
  {
    payload: {
      User: 'o.taha',
      PlatForm: 'web',
      AppVersionWeb: '33',
      AndroidVersion: '33',
      IOSVersion: '33',
      FireBaseToken: '',
      DatabaseIP: '45.32.255.109',
      DatabaseName: 'Visit',
      Operation: 'Get Visit List'
    },
    sp: 'APIVisitOperation'
  },
  // 3. Lowercase database name
  {
    payload: {
      User: 'o.taha',
      PlatForm: 'web',
      AppVersionWeb: '33',
      AndroidVersion: '33',
      IOSVersion: '33',
      FireBaseToken: '',
      DatabaseIP: '45.32.255.109',
      DatabaseName: 'visit',
      operation: 'Get Visit List'
    },
    sp: 'APIVisitOperation'
  },
  // 4. APIVisitHeaderOperation
  {
    payload: {
      User: 'o.taha',
      PlatForm: 'web',
      AppVersionWeb: '33',
      AndroidVersion: '33',
      IOSVersion: '33',
      FireBaseToken: '',
      DatabaseIP: '45.32.255.109',
      DatabaseName: 'Visit',
      operation: 'Get Visit List'
    },
    sp: 'APIVisitHeaderOperation'
  }
];

function test(variation, index) {
  return new Promise((resolve) => {
    const payloadStr = JSON.stringify(variation.payload);
    const options = {
      hostname: 'souq.glcpaints.com',
      port: 7781,
      path: '/GeneralAPI/DynamicDatabase',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sp_name': variation.sp,
        'Content-Length': Buffer.byteLength(payloadStr),
      },
      timeout: 4000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          index,
          statusCode: res.statusCode,
          body: data.trim(),
        });
      });
    });

    req.on('error', (err) => {
      resolve({ index, error: err.message });
    });

    req.write(payloadStr);
    req.end();
  });
}

async function run() {
  console.log('Testing payload variations:');
  for (let i = 0; i < variations.length; i++) {
    const result = await test(variations[i], i);
    console.log(`Variation ${result.index + 1} | Status: ${result.statusCode} | Body: ${result.body || result.error}`);
  }
}

run();
