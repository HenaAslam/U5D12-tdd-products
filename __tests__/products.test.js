// By default Jest does not work with the import syntax
// If you want to use import syntax you should add NODE_OPTIONS=--experimental-vm-modules to the test script in package.json
// On Windows you cannot use NODE_OPTIONS (as well as other env vars in scripts) from the command line --> solution is to use cross-env in order to be able to pass
// env vars to command line scripts on all operative systems!
import supertest from "supertest";
import dotenv from "dotenv";
import mongoose from "mongoose";
import server from "../src/server.js";
import ProductsModel from "../src/api/products/model.js";

dotenv.config(); // This command forces .env vars to be loaded into process.env. This is the way to go when you can't use -r dotenv/config

// supertest is capable of running server.listen from our Express app if we pass the server to it
// It will give us back an object (client) that can be used to run http requests on that server
const client = supertest(server);
let product;
const validProduct = {
  name: "iPhone",
  description: "Good phone",
  price: 10000,
};

const notValidProduct = {
  description: "Good phone",
  price: 10000,
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URL);
  product = new ProductsModel(validProduct);
  await product.save();
}); // beforeAll is a Jest hook which will be ran before all tests, usually this is used to connect to db and to do some initial setup like adding some mock data to the db

afterAll(async () => {
  await ProductsModel.deleteMany();
  await mongoose.connection.close();
}); // afterAll hook could to clean up the situation (close the connection to Mongo gently and clean up db/collections)

describe("Test Products APIs", () => {
  // it("Should test that GET /test endpoint returns 200 and a body containing a message", async () => {
  //   const response = await client.get("/test")
  //   expect(response.status).toBe(200)
  //   expect(response.body.message).toEqual("TEST SUCCESSFULL")
  // })
  it("Should test that env vars are loaded correctly", () => {
    expect(process.env.MONGO_TEST_URL).toBeDefined();
  });

  // it("Should test that GET /products returns 200 and a body", async () => {
  //   const response = await client.get("/products").expect(200);

  // console.log(response.body);
  // });

  // Fetching on/products/ should return a success status code and a body
  it("Should test that GET /products returns 200 and a body", async () => {
    const response = await client.get("/products");
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
  // Create new product on /products should return a valid _id and 201 in case of a valid product, 400 if not
  it("Should test that POST /products returns 201 and an _id if a valid product is provided in req.body", async () => {
    const response = await client
      .post("/products")
      .send(validProduct)
      .expect(201);
    expect(response.body._id).toBeDefined();
  });
  it("Should test that POST /products returns 400 if a not valid product is provided in req.body", async () => {
    await client.post("/products").send(notValidProduct).expect(400);
  });
  //   When retrieving the /products/:id endpoint:
  // expect requests to be 404 with a non-existing id, like 123456123456123456123456. Use a 24 character ID or casting to ObjectID will fail
  it("Should test that GET /products/:id returns 404 for non-existent", async () => {
    const response = await client.get("/products/123456123456123456123456");
    expect(response.status).toBe(404);
  });
  // expect requests to return the correct product with a valid id
  it("Should test that GET /products/:id returns product if id is valid", async () => {
    const res = await client.get(`/products/${product._id}`);

    expect(typeof res.body).toBe("object");
    expect(res.body._id).toBeDefined();
  });

  // When deleting the /products/:id endpoint:
  // expect successful 204 response code
  it("Should test that DELETE /products/:id returns 204 if id is valid", async () => {
    const res = await client.delete(`/products/${product._id}`);
    expect(res.status).toBe(204);

    expect(res.body).toEqual({});
  });
  // expect 404 with a non-existing id
  it("Should test that DeLETE /products/:id returns 404 if id is invalid", async () => {
    const res = await client.delete(`/products/123456123456123456123456`);
    expect(res.status).toBe(404);
  });

  //   When updating a /product/:id endpoint with new data:
  // expect requests to be accepted.

  // expect 404 with a non-existing id
  it("Should test that PUT /products/:id returns 404 if id is invalid", async () => {
    const res = await client.put(`/products/123456123456123456123456`);
    expect(res.status).toBe(404);
  });
  // Expect the response.body.name to be changed
  // Expect the typeof name in response.body to be “string”
  it("Should test that PUT /products/:id changes response.body.name", async () => {
    const res = await client.put(`/products/${product._id}`).send({
      name: "macbook",
    });
    expect(res.statusCode).toBe(200);
    expect(typeof res.body).toBe("object");
    expect(res.body.name).toBe("macbook");
    expect(typeof res.body.name).toBe("string");
  });

  //expect get products to return an array
  // it("Should test that GET /products gives no error", async () => {
  //   const response = await client.get("/products");

  //   // expect(Array.isArray(response)).toBe(true);
  // });

  //expect delete product to have an empty body
  // expect(res.body).toEqual({});
  //expect put product to return an object
  // expect(typeof res.body).toBe("object");
});
