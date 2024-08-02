import dbClient from './utils/db';
console.log('db:', process.env.DB_HOST, process.env.DB_PORT);

const waitConnection = () => {
    return new Promise((resolve, reject) => {
        let i = 0;
        const repeatFct = async () => {
            await setTimeout(() => {
                i += 1;
                if (i >= 10) {
                    reject()
                }
                else if(!dbClient.isAlive()) {
                    repeatFct()
                }
                else {
                    resolve()
                }
            }, 1000);
        };
        repeatFct();
    });
};

(async () => {
    console.log(dbClient.isAlive());
    await waitConnection();
    console.log(dbClient.isAlive());
    (await dbClient.createObject('users', { email: 'red@dri.com', password: '123456' }));
    (await dbClient.createObject('users', { email: 'red@dri.com', password: '123456' }));
    console.log(await dbClient.nbUsers());
    console.log(await dbClient.nbFiles());
})();

