const fs = require('fs');
const join = require('path').join;
const faker = require('faker');
const mongoose = require('mongoose');
const config = require('./config/db');

const models = join(__dirname, 'models');

// Bootstrap models
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(models, file)));

// Connect to mongoDB
mongoose.connect(config.DB, { keepAlive: 1 });

// Load models
const User = mongoose.model('User');
const Store = mongoose.model('Store');
const Product = mongoose.model('Product');

var users = [];
var stores = [];

for (let i = 0; i < 10; i++) {
  // Generate Users with two locations each at different times.
  users.push({
    name: faker.name.findName(),
    email: faker.internet.email(),
    bio: faker.lorem.paragraph(),
    image: faker.image.avatar(),
    lastLocation: [faker.address.longitude(), faker.address.latitude()],
    followedStores: []
  });

  // Generate Stores with two locations each
  stores.push({
    name: faker.company.companyName(),
    description: faker.company.bs(),
    image: faker.image.image(),
    location: [faker.address.longitude(), faker.address.latitude()],
    products: [],
  });
}

stores.forEach((store, index) => {
  // Generate ten products per store.
  for (let i = 0; i < 10; i++) {
    newProduct = new Product({
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      images: [faker.image.image()],
      url: faker.internet.url(),
      price: faker.commerce.price(),
      priceMSRP: faker.commerce.price(),
    });

    newProduct.save();

    store.products.push({ _id: newProduct._id });
  }

  let newStore = new Store(store);

  newStore.save();

  // Push a ref to the newly created Store to the followedStores for the User
  // with the same index, so each user gets one.
  users[index].followedStores.push({ _id: newStore._id });

  console.log(`Store[${index}] Seeded.`);
});

users.forEach((user, index) => {
  let newUser = new User(user);

  newUser.save();

  console.log(`User[${index}] Seeded.`);
});

function handleInterrupt() {
  process.exit(1);
}

process.on('SIGINT', handleInterrupt);
process.on('SIGTERM', handleInterrupt);
