module.exports = (app) => {
  const mongoose = app.service('Mongoose');
  const Plugin = app.service('Plugin');
  const { Validate } = app.service('System');
  const { Schema } = mongoose;
  const { Mixed } = mongoose.Schema.Types;

  const schema = Schema({
    email: { type: String, required: true, lowercase: true },
    type: { type: String, required: true, lowercase: true },
    token: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, expires: 86400 },
    data: { type: Mixed },
  });

  Plugin.plugins(schema);

  schema.r2options = app.service('model/_options/token') || {};
  const { attributes, rules } = schema.r2options;
  Validate(schema, { attributes, rules });

  return mongoose.model('token', schema);
};
