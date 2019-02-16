// import businesses from 'in/';
import fs from 'fs';
import util from 'util';
import { pick, times, slice, shuffle, concat } from 'lodash';
import faker from 'faker';
import restaurantsBlob from './in/restaurants.json';

// Promisfy writeFile
const writeFile = util.promisify(fs.writeFile);

const TEAMMATE_COUNT = 20;
const MIN_NEW_RESTAURANT_COUNT = 10;
const ratingOptions = [ 'LIKE', 'DISLIKE' ];

const log = (statement) => {
    console.log(`[transformer] ${statement}`)
}

log(`Transforming ${restaurantsBlob.businesses.length} restaurants`);

// Transform restaurants
const restaurants = restaurantsBlob.businesses.map(element => {
    return pick(element, ['name', 'id', 'image_url', 'categories', 'price', 'rating']);
});

// Create users
const teammates = times(TEAMMATE_COUNT, () => {
    return {
        id: faker.random.uuid(),
        name: faker.fake("{{name.firstName}} {{name.lastName}}")
    }
});

log(`Created ${teammates.length} teammates`);

const ratings = teammates.reduce((sumOfRatings, teammate) => {
    
    // Shuffled Restaurants
    const restaurantsShuffled = shuffle(restaurants);

    // Take a random sub slice of restaurants
    const sublistIdx = faker.random.number(restaurants.length - MIN_NEW_RESTAURANT_COUNT);

    // Randomly return like or dislike
    const subRatings = slice(restaurantsShuffled, 0, sublistIdx)
        .map((restaurant) => {
            
            return {
                teammateId: teammate.id,
                restaurantId: restaurant.id,
                rating: shuffle(ratingOptions)[0]
            }
        })

    // Merge ratings array
    return concat(sumOfRatings, subRatings);

}, [])

// Write Restauruants
writeFile("./out/restaurants.json", JSON.stringify(restaurants, null, 4))
    .then(() => {
        return writeFile("./out/teammates.json", JSON.stringify(teammates, null, 4))
    })
    .then(() => {
        return writeFile("./out/ratings.json", JSON.stringify(ratings, null, 4))
    })
    .then(() => {
        log("The files was saved!");
    })
    .catch((error) => {
        console.error(err);
    })