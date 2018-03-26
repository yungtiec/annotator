/* global describe beforeEach it */

const { expect } = require("chai");
const db = require("../index");
const User = db.model("user");
const Role = db.model("role");
const Permission = db.model("permission");
Promise = require("bluebird");

describe("User model", () => {
  beforeEach(() => {
    // return db.sync({ force: true });
  });

  describe("instanceMethods", () => {
    describe("correctPassword", () => {
      let cody;

      before(() => {
        return User.create({
          email: "cody@puppybook.com",
          password: "bones"
        }).then(user => {
          cody = user;
        });
      });

      it("returns true if the password is correct", () => {
        expect(cody.correctPassword("bones")).to.be.equal(true);
      });

      it("returns false if the password is incorrect", () => {
        expect(cody.correctPassword("bonez")).to.be.equal(false);
      });
    }); // end describe('correctPassword')

    describe("role and permission", async () => {
      let permissions, role, cody;
      before(async () => {
        cody = await User.findOne({
          where: { email: "cody@puppybook.com" }
        });

        permissions = await Promise.map(
          [
            { name: "upvote" },
            { name: "annotate" },
            { name: "answer_survey" },
            { name: "create_survey" },
            { name: "approve_survey_answers" },
            { name: "approve_annotation" }
          ],
          entry => Permission.create(entry)
        );
        roles = await Promise.map(
          [
            { name: "admin" },
            { name: "open_source_user" },
            { name: "business_user" }
          ],
          entry => Role.create(entry)
        );
        await Promise.map(permissions, permission => {
          return roles[0].addPermission(permission.id);
        });
        await Promise.map(permissions.slice(0, 2), permission => {
          return roles[1].addPermission(permission.id);
        });
        await Promise.map(permissions.slice(0, 4), permission => {
          return roles[2].addPermission(permission.id);
        });
        return await cody.addRole(roles[0].id);
      });

      it("returns role and permission info", async () => {
        cody = await User.findOne({
          where: { email: "cody@puppybook.com" },
          include: [{
            model: Role,
            include: [{
              model: Permission
            }]
          }]
        })
        expect(cody.toJSON().roles[0].name).to.be.equal('admin');
        expect(cody.toJSON().roles[0].permissions.length).to.be.equal(6);
      });
    });
  }); // end describe('instanceMethods')
}); // end describe('User model')
