const { faker } = require("@faker-js/faker");
const users = [];
for (let i = 0; i < 10; i++) {
    users.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
    });
}

console.log("Inserting fake users ...");
db.getSiblingDB("test_data").users.insertMany(users);