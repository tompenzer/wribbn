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
    locations: [{
      latitude: faker.address.latitude(),
      longitude: faker.address.longitude(),
      createdAt: faker.date.recent()
    },{
      latitude: faker.address.latitude(),
      longitude: faker.address.longitude(),
      createdAt: faker.date.past()
    }]
  });

  // Generate Stores with two locations each
  stores.push({
    name: faker.company.companyName(),
    description: faker.company.bs(),
    image: faker.image.business(),
    locations: [{
      latitude: faker.address.latitude(),
      longitude: faker.address.longitude()
    },{
      latitude: faker.address.latitude(),
      longitude: faker.address.longitude()
    }],
    products: [],
  });
}

users.forEach(function(user, index) {
  let newUser = new User(user);

  users[index] = null;
  users = users.filter((n) => (n));

  newUser.save();

  console.log(`User[${index}] Seeded.`);
});

stores.forEach(function(store, index) {
  let products = [];

  for (let i = 0; i < 10; i++) {
    // Generate Stores with two locations each
    products.push({
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      images: [faker.image.fashion()],
      url: faker.internet.url(),
      price: faker.commerce.price(),
      priceMSRP: faker.commerce.price(),
    });
  }

  for (product of products) {
    newProduct = new Product(product);

    newProduct.save();

    store.products.push({ _id: newProduct._id });
  }

  let newStore = new Store(store);

  stores[index] = null;
  stores = stores.filter((n) => (n));

  newStore.save();

  console.log(`Store[${index}] Seeded.`);
});

function handle(signal) {
  process.exit();
}

process.on('SIGINT', handle);
process.on('SIGTERM', handle);