const EmailCode = require("./EmailCode");
const User = require("./User");
//relacion 1 a 1
EmailCode.belongsTo(User); //UserId
User.hasOne(EmailCode);
