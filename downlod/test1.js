const request = require('request');
const fs = require('fs');
const { exec } = require('child_process');

let url = ''

const download = (url, dest) => {
    const file = fs.createWriteStream(dest);
    request(encodeURI(url), {
        auth: {
            user: '',
            password: ''
        }
    })
        .pipe(file)
        .on('close', () => {
            console.log('downloaded success')

            exec('tar zxvf test.tar.gz', (err, stdout, stderr) => {
                if (err) {
                    console.error(err)
                    return
                }
                console.log('unzip success')
            })
        });
}

download(url, 'test.tar.gz');