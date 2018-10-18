"use strict";
module.exports = (sequelize, DataTypes) => {
  const WizardSchema = sequelize.define("wizard_schema", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    step_array: {
      type: DataTypes.ARRAY(DataTypes.STRING)
    },
    step_schemas_json: {
      type: DataTypes.JSON
    },
  });

  WizardSchema.isHierarchy();
  WizardSchema.associate = function(models) {
    WizardSchema.belongsTo(models.version, {
      foreignKey: "wizard_schemas_id"
    });
  };
  return WizardSchema;
};