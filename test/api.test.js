const request = require("supertest");
const express = require("express");
const app = require("../server"); // Import your Express app

describe("API Tests", () => {
  
  // Test if API server is running
  test("GET / should return status 200", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });

  // Test the POST /api/calculate endpoint
  test("POST /api/calculate should store values in MySQL", async () => {
    const response = await request(app)
        .post("/api/calculate")
        .send({ num1:5, num2:10 })  // Make sure these are valid numbers
        .expect(200);

    expect(response.text).toContain("Values stored successfully!");
   });

  // Test the GET /api/calculate endpoint
  test("GET /api/calculate should return a hashed value", async () => {
    const response = await request(app).get("/api/calculate");

    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch(/Hash:/); // Check if response contains 'Hash:'
  });
});
