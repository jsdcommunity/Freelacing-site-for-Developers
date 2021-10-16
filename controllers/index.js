const ErrorResponse = require("../utils/ErrorResponse");
const path = require("path");
const {
  checkUserExist,
  createToken,
  sendOfficialEmail,
  compileHTMLEmailTemplate,
} = require("../helpers");

module.exports = {
  sendConfirmEmailToken: async (req, res, next) => {
    const userData = req.body;
    const { email } = userData;

    let token;
    let confirmUrl;
    let htmlContent;
    const confirmEmailTemplatePath = path.resolve("utils/email-templates/confirm-email.html");

    // Checking if user exist
    try {
      let { userExist, message } = await checkUserExist(email);
      if (userExist) return next(new ErrorResponse(409, message));
    } catch (err) {
      next(new ErrorResponse(401, err.message));
    }

    // Generating new token for sending with confirm url
    try {
      token = await createToken(userData);
      confirmUrl = "https://but-jsd-3.herokuapp.com/confirm-account?token=" + token;
    } catch (err) {
      return next(new ErrorResponse(500, err.message));
    }

    // Generating html content for sending in email
    try {
      htmlContent = await compileHTMLEmailTemplate(confirmEmailTemplatePath, {
        confirmUrl,
      });
    } catch (err) {
      return next(new ErrorResponse(500, err.message));
    }

    // Sending confirm email
    try {
      const response = await sendOfficialEmail({
        toEmail: email,
        subject: "Activate Your UpBit Account Now",
        htmlContent,
      });
      console.log({ response });
    } catch (err) {
      next(new ErrorResponse(500, err.message));
    }

    // Sending status response to front end
    res.status(250).json({
      success: true,
      message: "Verify email successfully send to " + email,
    });
  },
};
