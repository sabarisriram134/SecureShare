const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../src/app"); // your Express app
const expect = chai.expect;

chai.use(chaiHttp);

describe("File API Tests", () => {
  let token = null; // JWT token for auth

  before(async () => {
    // For demo purposes, assume you can get a test token
    token = "your_test_jwt_token";
  });

  it("should upload a file", (done) => {
    chai
      .request(server)
      .post("/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .send({ fileName: "test.txt", fileData: "Hello world" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("cid");
        expect(res.body).to.have.property("key");
        done();
      });
  });

  it("should fetch all files", (done) => {
    chai
      .request(server)
      .get("/files")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("files");
        done();
      });
  });

  it("should fetch file metadata", (done) => {
    const cid = "samplecid123";
    chai
      .request(server)
      .get(`/files/meta/${cid}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("fileName");
        expect(res.body).to.have.property("key");
        done();
      });
  });
});
