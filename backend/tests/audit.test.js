const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../src/app");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Audit API Tests", () => {
  let token = "your_test_jwt_token";

  it("should fetch audit logs", (done) => {
    chai
      .request(server)
      .get("/audit")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("logs");
        done();
      });
  });
});
