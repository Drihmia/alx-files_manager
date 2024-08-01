import redisClient from './utils/redis';

(async () => {
    new Promise((res) => res(console.log('using delete method')));
    console.log(await redisClient.get('myKe'), '=> null');
    await redisClient.set('myKe', 10, 20);
    console.log(await redisClient.get('myKe'), '=> 10');
    await redisClient.del('myKe');
    console.log(await redisClient.get('myKe'), '=> null');

    console.log(redisClient.isAlive());
    console.log(await redisClient.get('myKey'), '=> null');
    await redisClient.set('myKey', 12, 1);
    console.log(await redisClient.get('myKey'), '=> 12');

    setTimeout(async () => {
        console.log(await redisClient.get('myKey'), '=> null');
    }, 1200*1);
})();
