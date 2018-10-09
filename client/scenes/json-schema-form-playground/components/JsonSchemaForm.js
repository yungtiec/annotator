import React, { Component } from "react";
import { render } from "react-dom";
import AccordionField from "./AccordionField";
import { withTheme, Form } from "@react-schema-form/core";
import templates from "@react-schema-form/bootstrap/lib/components/templates";
import widgets from "@react-schema-form/bootstrap/lib/components/widgets";

templates.ObjectFieldTemplate = AccordionField;

const BootstrapCustomForm = withTheme("Bootstrap", { widgets, templates })(
  Form
);

const log = type => console.log.bind(console, type);

export default ({ schema, uiSchema, defaultFormData }) => {
  return (
    <div className="main-container">
      <BootstrapCustomForm
        schema={schema}
        uiSchema={uiSchema}
        formData={defaultFormData}
        onChange={log("changed")}
        onSubmit={log("submitted")}
        onError={log("errors")}
      />
    </div>
  );
};
